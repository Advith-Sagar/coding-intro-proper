let fengariReady = false;

async function ensureFengari() {
  if (fengariReady) return;
  await import('https://unpkg.com/fengari-web/dist/fengari-web.js');
  fengariReady = true;
}

export async function runLua(code) {
  await ensureFengari();

  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.map(String).join(' '));

  try {
    const loader = window.fengari && window.fengari.load;
    if (!loader) throw new Error('Fengari runtime unavailable');
    loader(code)();
    return logs.join('\n') || '(No output)';
  } catch (err) {
    throw new Error(err.message || String(err));
  } finally {
    console.log = originalLog;
  }
}
