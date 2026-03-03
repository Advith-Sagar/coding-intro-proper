let pyodideInstance = null;
let stdoutBuffer = '';

export async function runPython(code) {
  if (!pyodideInstance) {
    const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.mjs');
    pyodideInstance = await loadPyodide({});
    pyodideInstance.setStdout({
      batched: (text) => { stdoutBuffer += text + '\n'; }
    });
    pyodideInstance.setStderr({
      batched: (text) => { stdoutBuffer += text + '\n'; }
    });
  }

  stdoutBuffer = '';
  try {
    const result = await pyodideInstance.runPythonAsync(code);
    const rendered = stdoutBuffer + (result === undefined || result === null ? '' : String(result));
    return rendered.trim() || '(No output)';
  } catch (err) {
    throw new Error(err.message || String(err));
  }
}
