const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const JDOODLE_ENDPOINT = 'https://api.jdoodle.com/v1/execute';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm'
};

function safePath(urlPath) {
  const relative = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const full = path.resolve(ROOT, relative);
  if (!full.startsWith(ROOT + path.sep) && full !== ROOT) {
    throw new Error('Invalid path');
  }
  return full;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0'
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

async function handleRunJdoodle(req, res) {
  try {
    const body = await readJsonBody(req);
    const {
      script = '',
      language,
      versionIndex,
      clientId = process.env.JDOODLE_CLIENT_ID || '',
      clientSecret = process.env.JDOODLE_CLIENT_SECRET || ''
    } = body || {};

    if (!language || typeof versionIndex !== 'number') {
      sendJson(res, 400, { error: 'Missing language or versionIndex' });
      return;
    }
    if (!clientId || !clientSecret) {
      sendJson(res, 400, { error: 'JDoodle credentials missing' });
      return;
    }

    const upstream = await fetch(JDOODLE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script,
        language,
        versionIndex
      })
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { output: text };
    }

    if (!upstream.ok) {
      sendJson(res, upstream.status, { error: data.error || `JDoodle upstream error (${upstream.status})`, data });
      return;
    }

    sendJson(res, 200, data);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
}

function safeText(value, max = 12000) {
  return String(value || '').slice(0, max);
}

function readHeader(req, name) {
  const raw = req?.headers?.[name];
  if (Array.isArray(raw)) return raw[0] || '';
  return raw || '';
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

async function handleCheckCode(req, res) {
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
    let data;
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
        hint: 'Try matching the step instructions exactly.'
      });
      return;
    }

    sendJson(res, 200, {
      correct: parsed.correct === true,
      message: String(parsed.message || 'Checked.'),
      hint: String(parsed.hint || '')
    });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url || '/';

  if (req.method === 'POST' && urlPath.split('?')[0] === '/api/run-jdoodle') {
    await handleRunJdoodle(req, res);
    return;
  }

  if (req.method === 'POST' && urlPath.split('?')[0] === '/api/check-code') {
    await handleCheckCode(req, res);
    return;
  }

  if (req.method === 'GET') {
    let filePath;
    try {
      filePath = safePath(urlPath === '/' ? '/index.html' : urlPath);
    } catch {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500);
        res.end(err.code === 'ENOENT' ? 'File not found' : 'Server error');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      });
      res.end(data);
    });
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`ChromeOS-safe IDE running at http://localhost:${PORT}`);
});
