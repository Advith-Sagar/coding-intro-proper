let opalReady = false;

async function ensureOpal() {
  if (opalReady) return;
  await import('https://cdn.jsdelivr.net/npm/opal-runtime@1.8.2/opal.min.js');
  opalReady = true;
}

export async function runRuby(code) {
  await ensureOpal();

  const output = [];
  const originalLog = console.log;
  console.log = (...args) => output.push(args.map(String).join(' '));

  try {
    if (!window.Opal || typeof window.Opal.eval !== 'function') {
      throw new Error('Opal runtime unavailable');
    }
    const result = window.Opal.eval(code);
    const suffix = (result === undefined || result === null) ? '' : String(result);
    return (output.join('\n') + (suffix ? (output.length ? '\n' : '') + suffix : '')).trim() || '(No output)';
  } catch (err) {
    throw new Error(err.message || String(err));
  } finally {
    console.log = originalLog;
  }
}
