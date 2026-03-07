const JDOODLE_ENDPOINT = 'https://api.jdoodle.com/v1/execute';

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || {};
    const {
      script = '',
      language,
      versionIndex,
      clientId = process.env.JDOODLE_CLIENT_ID || '',
      clientSecret = process.env.JDOODLE_CLIENT_SECRET || ''
    } = body;

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
      sendJson(res, upstream.status, {
        error: data.error || `JDoodle upstream error (${upstream.status})`,
        data
      });
      return;
    }

    sendJson(res, 200, data);
  } catch (err) {
    sendJson(res, 500, { error: err?.message || 'Server error' });
  }
};
