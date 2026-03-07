const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(JSON.stringify(payload));
}

function safeText(value, max = 12000) {
  return String(value || '').slice(0, max);
}

function readHeader(req, name) {
  const raw = req?.headers?.[name];
  if (Array.isArray(raw)) return raw[0] || '';
  return raw || '';
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function parseJsonFromAssistant(message) {
  if (!message) return null;
  try {
    return JSON.parse(message);
  } catch {
    const block = message.match(/\{[\s\S]*\}/);
    if (!block) return null;
    try {
      return JSON.parse(block[0]);
    } catch {
      return null;
    }
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const headerApiKey = safeText(readHeader(req, 'x-openai-key'), 300);
    const headerModel = safeText(readHeader(req, 'x-openai-model'), 80);
    const apiKey = safeText(headerApiKey || body.clientApiKey || process.env.OPENAI_API_KEY || '', 300);
    if (!apiKey) {
      sendJson(res, 503, { error: 'OPENAI_API_KEY is not configured on server.' });
      return;
    }
    const step = Number(body.step || 0);
    const stepPrompt = safeText(body.stepPrompt, 8000);
    const expected = safeText(body.expected, 4000);
    const studentCode = safeText(body.studentCode, 12000);
    const model = safeText(headerModel || body.clientModel || process.env.OPENAI_MODEL || 'gpt-4.1', 80);

    const upstream = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly coding teacher for school students. Return STRICT JSON only with keys: correct (boolean), message (string), hint (string). Keep message and hint short.'
          },
          {
            role: 'user',
            content: `Step ${step}\n\nInstruction:\n${stepPrompt}\n\nExpected snippet (may be empty):\n${expected}\n\nStudent code:\n${studentCode}`
          }
        ]
      })
    });

    const text = await upstream.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!upstream.ok) {
      const msg = data?.error?.message || `OpenAI request failed (${upstream.status})`;
      sendJson(res, upstream.status, { error: msg });
      return;
    }

    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = parseJsonFromAssistant(content);
    if (!parsed || typeof parsed !== 'object') {
      sendJson(res, 200, {
        correct: false,
        message: 'I could not parse AI feedback cleanly.',
        hint: 'Try checking that your code matches the step instructions exactly.'
      });
      return;
    }

    sendJson(res, 200, {
      correct: parsed.correct === true,
      message: String(parsed.message || 'Checked.'),
      hint: String(parsed.hint || '')
    });
  } catch (err) {
    sendJson(res, 500, { error: err?.message || 'Server error' });
  }
};
