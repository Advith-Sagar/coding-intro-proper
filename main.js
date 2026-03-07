import { runPython } from './languages/pyodide.js';
import { runLua } from './languages/fengari.js';
import { runRuby } from './languages/opal.js';

const PISTON_ENDPOINT = 'https://emkc.org/api/v2/piston/execute';
const RUST_PLAYGROUND_ENDPOINT = 'https://play.rust-lang.org/execute';
const JDOODLE_PROXY_ENDPOINT = '/api/run-jdoodle';

const STORAGE_KEY = 'chromebook_ide_project_v2';
const PANEL_VISIBILITY_KEY = 'ide_panel_visibility_v1';
const SETTINGS_KEY = 'ide_settings_v2';
const JDOODLE_CLIENT_ID_KEY = 'jdoodle_client_id';
const JDOODLE_CLIENT_SECRET_KEY = 'jdoodle_client_secret';
const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';
const OPENAI_MODEL_STORAGE_KEY = 'openai_model';
const LESSON_ONE_DONE_KEY = 'lesson_one_completed_v1';
const LESSON_ONE_START_TS_KEY = 'lesson_one_start_ts_v1';
const LESSON_ONE_TIMER_MS = 25 * 60 * 1000;

const HEX_COLOR_REGEX = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

const ICON_FOLDER = `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1.5 3.25A1.75 1.75 0 0 1 3.25 1.5h2.18c.57 0 1.1.28 1.43.75l.39.56c.14.2.37.32.61.32h4.89A1.75 1.75 0 0 1 14.5 4.88v6.87a1.75 1.75 0 0 1-1.75 1.75H3.25A1.75 1.75 0 0 1 1.5 11.75V3.25Z"/></svg>`;
const ICON_FILE = `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8A1.5 1.5 0 0 0 13.5 13V6.06a1.5 1.5 0 0 0-.44-1.06l-2.56-2.56a1.5 1.5 0 0 0-1.06-.44H4Zm5 .81L12.19 5.5H10a1 1 0 0 1-1-1V2.31Z"/></svg>`;

const JDOODLE_LANGUAGES = [
  ['algol', 1, 'Algol'], ['apl', 0, 'APL'], ['awk', 1, 'AWK'], ['ada', 5, 'Ada'],
  ['gccasm', 4, 'Assembly (GCC)'], ['nasm', 5, 'Assembly (NASM)'], ['bc', 1, 'BC'], ['bash', 5, 'Bash'],
  ['befunge', 1, 'Befunge'], ['brainfuck', 0, 'Brainfuck'], ['c', 6, 'C'], ['csharp', 5, 'C#'],
  ['cpp', 6, 'C++'], ['cpp14', 5, 'C++14'], ['cpp17', 2, 'C++17'], ['c99', 5, 'C99'],
  ['clisp', 11, 'Common Lisp'], ['iscobol', 0, 'isCOBOL'], ['cow', 0, 'COW'], ['clojure', 4, 'Clojure'],
  ['cobol', 4, 'COBOL'], ['coffeescript', 5, 'CoffeeScript'], ['crystal', 0, 'Crystal'], ['csharpdblink', 0, 'C# DBLink'],
  ['d', 3, 'D'], ['dart', 5, 'Dart'], ['deno', 0, 'Deno'], ['elixir', 5, 'Elixir'],
  ['erlang', 2, 'Erlang'], ['fsharp', 2, 'F#'], ['fasm', 1, 'Flat Assembler'], ['factor', 4, 'Factor'],
  ['falcon', 0, 'Falcon'], ['fantom', 0, 'Fantom'], ['forth', 1, 'Forth'], ['fortran', 5, 'Fortran'],
  ['freebasic', 3, 'FreeBASIC'], ['go', 5, 'Go'], ['groovy', 5, 'Groovy'], ['hack', 0, 'Hack'],
  ['haskell', 5, 'Haskell'], ['haxe', 1, 'Haxe'], ['icon', 2, 'Icon'], ['intercal', 0, 'INTERCAL'],
  ['itext', 0, 'iText'], ['itextcsharp', 0, 'iText C#'], ['jbang', 0, 'JBang'], ['jlang', 0, 'J Language'],
  ['java', 5, 'Java'], ['javadblink', 0, 'Java DBLink'], ['jelly', 0, 'Jelly'], ['julia', 0, 'Julia'],
  ['kotlin', 4, 'Kotlin'], ['lolcode', 0, 'LOLCODE'], ['lua', 4, 'Lua'], ['moonscript', 0, 'MoonScript'],
  ['mozart', 0, 'Mozart'], ['nemerle', 0, 'Nemerle'], ['nim', 4, 'Nim'], ['ocaml', 3, 'OCaml'],
  ['objc', 5, 'Objective-C'], ['octave', 5, 'Octave'], ['php', 5, 'PHP'], ['pascal', 3, 'Pascal'],
  ['perl', 5, 'Perl'], ['phpdblink', 0, 'PHP DBLink'], ['picolisp', 5, 'PicoLisp'], ['pike', 1, 'Pike'],
  ['prolog', 3, 'Prolog'], ['python2', 3, 'Python 2'], ['python3', 5, 'Python 3'], ['python3dblink', 0, 'Python 3 DBLink'],
  ['r', 5, 'R'], ['racket', 3, 'Racket'], ['raku', 0, 'Raku'], ['rhino', 3, 'Rhino'],
  ['ruby', 5, 'Ruby'], ['rust', 5, 'Rust'], ['sql', 5, 'SQL'], ['scala', 5, 'Scala'],
  ['scheme', 4, 'Scheme'], ['smalltalk', 0, 'Smalltalk'], ['spidermonkey', 2, 'SpiderMonkey'], ['swift', 5, 'Swift'],
  ['tasm', 0, 'Turbo Assembler'], ['tcl', 5, 'Tcl'], ['typescript', 0, 'TypeScript'], ['unlambda', 1, 'Unlambda'],
  ['vbn', 5, 'VB .NET'], ['verilog', 4, 'Verilog'], ['whitespace', 0, 'Whitespace'], ['yabasic', 2, 'Yabasic']
];

const languageToMonaco = {
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'markdown',
  yaml: 'yaml',
  xml: 'xml',
  sql: 'sql',
  python: 'python',
  lua: 'lua',
  ruby: 'ruby',
  c: 'c',
  cpp: 'cpp',
  rust: 'rust',
  plaintext: 'plaintext'
};

const extensionToLanguage = {
  js: 'javascript',
  ts: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  markdown: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  sql: 'sql',
  py: 'python',
  lua: 'lua',
  rb: 'ruby',
  c: 'c',
  cpp: 'cpp',
  cxx: 'cpp',
  rs: 'rust',
  txt: 'plaintext'
};

const languageToDefaultExt = {
  javascript: 'js',
  typescript: 'ts',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'md',
  yaml: 'yaml',
  xml: 'xml',
  sql: 'sql',
  python: 'py',
  lua: 'lua',
  ruby: 'rb',
  c: 'c',
  cpp: 'cpp',
  rust: 'rs'
};

const templates = {
  javascript: `console.log('Hello from JavaScript');`,
  typescript: `const user: string = 'TypeScript';\nconsole.log('Hello from', user);`,
  html: `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>HTML Preview</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }
      h1 { color: #22c55e; }
    </style>
  </head>
  <body>
    <h1>Hello from HTML</h1>
    <p>Edit this and click Run Code to preview.</p>
  </body>
</html>`,
  css: `body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #111827, #1f2937);\n  color: #f3f4f6;\n}\n\n.card {\n  max-width: 420px;\n  margin: 64px auto;\n  padding: 24px;\n  border-radius: 14px;\n  background: rgba(255,255,255,0.08);\n  border: 1px solid rgba(255,255,255,0.16);\n}`,
  json: `{"project":"ChromeOS-safe IDE"}`,
  markdown: `# Markdown Demo\n\nThis IDE can render **Markdown**.`,
  yaml: `project: ChromeOS-safe IDE\nlanguage: YAML`,
  xml: `<root><project>ChromeOS-safe IDE</project></root>`,
  sql: `SELECT 'Hello from SQL' AS message;`,
  python: `name = "Python"\nprint("Hello from", name)`,
  lua: `print("Hello from Lua")`,
  ruby: `puts "Hello from Ruby"`,
  c: `#include <stdio.h>\nint main(){\n  printf("Hello from C\\n");\n  return 0;\n}`,
  cpp: `#include <iostream>\nint main(){\n  std::cout << "Hello from C++\\n";\n  return 0;\n}`,
  rust: `fn main() {\n  println!("Hello from Rust");\n}`,
  plaintext: ''
};

function getTemplateForLanguage(language) {
  if (!language) return '';

  if (isJdoodleLanguage(language)) {
    const parsed = parseJdoodleLanguage(language);
    if (!parsed?.language) return '';
    const mapped = detectLanguageFromName(`x.${parsed.language}`, 'plaintext');
    return templates[mapped] ?? '';
  }

  return templates[language] ?? '';
}

const statusEl = document.getElementById('status');
const outputEl = document.getElementById('output');
const debugOutputEl = document.getElementById('debugOutput');
const terminalOutputEl = document.getElementById('terminalOutput');
const terminalInputEl = document.getElementById('terminalInput');
const terminalPromptEl = document.getElementById('terminalPrompt');

const outputPanelEl = document.querySelector('.output');
const debugPanelEl = document.querySelector('.debug-panel');
const terminalPanelEl = document.querySelector('.terminal-panel');

const runButton = document.getElementById('runButton');
const debugButton = document.getElementById('debugButton');
const clearButton = document.getElementById('clearButton');
const settingsButton = document.getElementById('settingsButton');

const languageSelect = document.getElementById('languageSelect');
const languageDropdown = document.getElementById('languageDropdown');
const languageDropdownButton = document.getElementById('languageDropdownButton');
const languageDropdownMenu = document.getElementById('languageDropdownMenu');

const jdoodleClientIdInput = document.getElementById('jdoodleClientId');
const jdoodleClientSecretInput = document.getElementById('jdoodleClientSecret');
const saveJdoodleButton = document.getElementById('saveJdoodleButton');
const openaiApiKeyInput = document.getElementById('openaiApiKey');
const openaiModelInput = document.getElementById('openaiModel');
const saveOpenaiButton = document.getElementById('saveOpenaiButton');

const newFolderButton = document.getElementById('newFolderButton');
const newTextButton = document.getElementById('newTextButton');
const newCodeButton = document.getElementById('newCodeButton');
const explorerTree = document.getElementById('explorerTree');
const activeFileLabel = document.getElementById('activeFileLabel');
const swapSidebarViewButton = document.getElementById('swapSidebarView');
const sidebarExplorerView = document.getElementById('sidebarExplorerView');
const sidebarLessonView = document.getElementById('sidebarLessonView');
const lessonTitle = document.getElementById('lessonTitle');
const lessonSelect1Button = document.getElementById('lessonSelect1');
const lessonSelect2Button = document.getElementById('lessonSelect2');
const lessonLockNote = document.getElementById('lessonLockNote');
const lessonTimerEl = document.getElementById('lessonTimer');
const lessonStepLabel = document.getElementById('lessonStepLabel');
const lessonPrompt = document.getElementById('lessonPrompt');
const lessonExpected = document.getElementById('lessonExpected');
const lessonMessage = document.getElementById('lessonMessage');
const lessonLoadButton = document.getElementById('lessonLoadButton');
const lessonCheckButton = document.getElementById('lessonCheckButton');
const lessonHintButton = document.getElementById('lessonHintButton');
const lessonContinueButton = document.getElementById('lessonContinueButton');

const mainEl = document.querySelector('.main');
const toolbarEl = document.querySelector('.toolbar');
const sidebarSplitter = document.getElementById('sidebarSplitter');
const editorOutputSplitter = document.getElementById('editorOutputSplitter');
const outputDebugSplitter = document.getElementById('outputDebugSplitter');

const panelTabButtons = Array.from(document.querySelectorAll('.panel-tab'));
const closeOutputPanelButton = document.getElementById('closeOutputPanel');
const closeDebugPanelButton = document.getElementById('closeDebugPanel');
const closeTerminalPanelButton = document.getElementById('closeTerminalPanel');

const explorerContextMenu = document.getElementById('explorerContextMenu');
const menuNewFolder = document.getElementById('menuNewFolder');
const menuNewText = document.getElementById('menuNewText');
const menuNewCode = document.getElementById('menuNewCode');
const menuDelete = document.getElementById('menuDelete');

const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettingsButton = document.getElementById('closeSettingsButton');
const resetSettingsButton = document.getElementById('resetSettingsButton');
const settingsSearchInput = document.getElementById('settingsSearch');
const settingsCategoryList = document.getElementById('settingsCategoryList');
const settingsContent = document.getElementById('settingsContent');

let editor = null;
let selectedNodeId = null;
let project = null;
const modelByFileId = new Map();
let saveTimer = null;
let contextTargetNodeId = null;
let languageMenuOpen = false;
let settingsOpen = false;
let terminalCwdNodeId = 'root';
let panelVisibility = { output: true, debug: true, terminal: true };
let settingsState = {};
let activeSettingsCategory = 'Editor';
let sidebarView = 'explorer';
let lessonStepIndex = 0;
let lessonLoaded = false;
let lessonSource = 'default';
let activeLessonId = 'lesson1';
let lessonTimerInterval = null;

const LESSON_ONE_TEMPLATE = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Dot Dodge Starter</title>
  <style>
    body { margin: 0; background: #0f172a; color: #e2e8f0; font-family: Arial, sans-serif; }
    #game-container { position: relative; width: 600px; height: 400px; margin: 24px auto; border: 2px solid #000; background: #000; overflow: hidden; }
    #score-overlay { position: absolute; top: 10px; left: 10px; color: white; font-family: sans-serif; pointer-events: none; }
    #play-screen {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }
    #play-button { padding: 12px 24px; font-size: 18px; background: #00ff00; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div id="game-container">
    <div id="play-screen"><button id="play-button">PLAY</button></div>
    <div id="score-overlay">Score: <span id="score">0</span></div>
    <canvas id="game-canvas"></canvas>
  </div>
  <script>
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const playScreen = document.getElementById('play-screen');
    const playButton = document.getElementById('play-button');
    canvas.width = 600;
    canvas.height = 400;
    let score = 0;
    let player = { x: 300, y: 200 };
    let enemies = [];
    let gameActive = false;

    playButton.addEventListener('click', () => {
      playScreen.style.display = 'none';
      score = 0;
      scoreEl.innerText = '0';
      enemies = [];
      player = { x: 300, y: 200 };
      gameActive = true;
      update();
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      player.x = e.clientX - rect.left;
      player.y = e.clientY - rect.top;
    });

    function spawnEnemy() {
      const size = Math.random() * 30 + 10;
      enemies.push({ x: canvas.width, y: Math.random() * (canvas.height - size), size, speed: Math.random() * 3 + 2 + (score / 10) });
    }

    function update() {
      if (!gameActive) return;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(player.x - 5, player.y - 5, 10, 10);

      for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.x -= e.speed;
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(e.x, e.y, e.size, e.size);

        if (player.x < e.x + e.size && player.x > e.x && player.y < e.y + e.size && player.y > e.y) {
          gameActive = false;
          alert('Game Over! Score: ' + score);
          location.reload();
          return;
        }

        if (e.x + e.size < 0) {
          enemies.splice(i, 1);
          score++;
          scoreEl.innerText = score;
        }
      }

      if (Math.random() < 0.05) spawnEnemy();
      requestAnimationFrame(update);
    }
  </script>
</body>
</html>`;

const LESSON_ONE_STEPS = [
  {
    prompt: 'Step 1: Customize this starter game code in the IDE (change colors, speeds, sizes, text, or behavior), then click Check.',
    expected: '',
    hint: 'Any real code change from the starter counts.',
    check: (code) => String(code || '').trim() !== LESSON_ONE_TEMPLATE.trim()
  }
];
const DEFAULT_LESSON_STEPS = [
  { prompt: 'Step 1: In the HTML game box, add the player element.', expected: '<div id="player"></div>' },
  { prompt: 'Step 2: In #player CSS, add a background color.', expected: 'background: #22c55e;' },
  { prompt: 'Step 3: In JS, create the x position variable.', expected: 'let x = 0;' },
  { prompt: "Step 4: Add W key movement in JS.", expected: "if (key === 'w') y -= 10;" }
];

const lessonCatalog = {
  lesson1: { id: 'lesson1', title: 'Lesson 1: Dot Game Editor', source: 'inline', starter: LESSON_ONE_TEMPLATE, steps: LESSON_ONE_STEPS, locked: false },
  lesson2: { id: 'lesson2', title: 'Lesson 2: Advanced HTML Course', source: 'file', starter: '', steps: [...DEFAULT_LESSON_STEPS], locked: true }
};
let lessonSteps = [...lessonCatalog.lesson1.steps];

function pxVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parsed = Number.parseFloat(v);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function setPxVar(name, value) {
  document.documentElement.style.setProperty(name, `${Math.round(value)}px`);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setSidebarView(view) {
  sidebarView = view === 'lesson' ? 'lesson' : 'explorer';
  const lessonOpen = sidebarView === 'lesson';
  sidebarExplorerView?.classList.toggle('hidden', lessonOpen);
  sidebarLessonView?.classList.toggle('hidden', !lessonOpen);
  if (swapSidebarViewButton) swapSidebarViewButton.textContent = lessonOpen ? 'Show Explorer' : 'Show Lessons';
  if (lessonOpen) closeExplorerMenu();
}

function normalizeSnippet(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function formatMs(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function lessonOneStartTs() {
  const raw = Number(localStorage.getItem(LESSON_ONE_START_TS_KEY) || 0);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

function ensureLessonOneTimerStarted() {
  let ts = lessonOneStartTs();
  if (!ts) {
    ts = Date.now();
    localStorage.setItem(LESSON_ONE_START_TS_KEY, String(ts));
  }
  return ts;
}

function lessonOneRemainingMs() {
  const ts = lessonOneStartTs();
  if (!ts) return LESSON_ONE_TIMER_MS;
  return Math.max(0, LESSON_ONE_TIMER_MS - (Date.now() - ts));
}

function stopLessonTimerTicker() {
  if (lessonTimerInterval) clearInterval(lessonTimerInterval);
  lessonTimerInterval = null;
}

function startLessonTimerTicker() {
  stopLessonTimerTicker();
  lessonTimerInterval = setInterval(updateLessonTimerDisplay, 1000);
}

function updateLessonTimerDisplay() {
  if (!lessonTimerEl) return;
  if (activeLessonId !== 'lesson1') {
    lessonTimerEl.textContent = 'Lesson 1 Timer: completed';
    return;
  }
  const remaining = lessonOneRemainingMs();
  if (remaining <= 0) {
    lessonTimerEl.textContent = 'Lesson 1 Timer: 00:00 (ready)';
    return;
  }
  lessonTimerEl.textContent = `Lesson 1 Timer: ${formatMs(remaining)} remaining`;
}

function parsePipeSeparatedLessons(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const parsed = [];
  for (const line of lines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 3) continue;
    const prompt = parts[1];
    const expected = parts[2].replace(/\\\|/g, '|');
    const hint = parts[3] || '';
    parsed.push({ prompt, expected, hint });
  }
  return parsed;
}

function parseScriptStepsLessons(text) {
  const match = String(text || '').match(/const\s+steps\s*=\s*(\[[\s\S]*?\n\]);?/);
  if (!match) return [];
  try {
    const parsed = Function(`"use strict"; return (${match[1]});`)();
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((step) => step && (typeof step.prompt === 'string' || typeof step.instructions === 'string'))
      .map((step) => ({
        prompt: step.prompt || step.instructions || '',
        expected: typeof step.expected === 'string' ? step.expected : '',
        hint: typeof step.hint === 'string' ? step.hint : '',
        check: typeof step.check === 'function' ? step.check : null
      }));
  } catch {
    return [];
  }
}

async function loadLessonsFromFile() {
  try {
    const res = await fetch('./Lessons.txt', { cache: 'no-store' });
    if (!res.ok) return;
    const text = await res.text();
    if (!text.trim()) return;
    const scriptParsed = parseScriptStepsLessons(text);
    if (scriptParsed.length > 0) {
      lessonCatalog.lesson2.steps = scriptParsed;
      return;
    }
    const pipeParsed = parsePipeSeparatedLessons(text);
    if (pipeParsed.length > 0) {
      lessonCatalog.lesson2.steps = pipeParsed;
    }
  } catch {
    // Keep defaults when Lessons.txt is unavailable or invalid.
  }
}

function isLessonOneComplete() {
  return localStorage.getItem(LESSON_ONE_DONE_KEY) === '1';
}

function setLessonOneComplete() {
  localStorage.setItem(LESSON_ONE_DONE_KEY, '1');
}

function refreshLessonLockState() {
  lessonCatalog.lesson2.locked = !isLessonOneComplete();
  lessonSelect1Button?.classList.toggle('active', activeLessonId === 'lesson1');
  lessonSelect2Button?.classList.toggle('active', activeLessonId === 'lesson2');
  if (lessonSelect2Button) lessonSelect2Button.textContent = lessonCatalog.lesson2.locked ? 'Lesson 2 (Locked)' : 'Lesson 2';
  if (lessonSelect2Button) lessonSelect2Button.disabled = false;
  if (lessonLockNote) {
    lessonLockNote.textContent = lessonCatalog.lesson2.locked
      ? 'Complete Lesson 1 to unlock Lesson 2.'
      : 'Lesson 2 unlocked.';
  }
}

function selectLesson(lessonId) {
  const lesson = lessonCatalog[lessonId];
  if (!lesson) return;
  if (lesson.locked) {
    lessonMessage.textContent = 'Lesson 2 is locked until Lesson 1 is complete.';
    return;
  }
  activeLessonId = lessonId;
  lessonSteps = [...lesson.steps];
  lessonSource = lesson.source;
  lessonStepIndex = 0;
  lessonLoaded = false;
  if (lessonTitle) lessonTitle.textContent = lesson.title;
  lessonMessage.textContent = 'Click Load Starter to begin this lesson.';
  refreshLessonLockState();
  updateLessonTimerDisplay();
  renderLessonStep();
}

function renderLessonStep() {
  const step = lessonSteps[lessonStepIndex];
  if (!step) {
    lessonStepLabel.textContent = 'Lesson complete';
    lessonPrompt.textContent = 'Done. Click Run Code in the IDE to test movement.';
    lessonExpected.textContent = 'Expected: all lesson checks passed.';
    lessonContinueButton.disabled = true;
    return;
  }
  lessonStepLabel.textContent = `Step ${lessonStepIndex + 1} of ${lessonSteps.length}`;
  lessonPrompt.innerHTML = step.prompt;
  lessonExpected.textContent = step.expected ? `Expected snippet: ${step.expected}` : 'Expected: follow instruction and pass check.';
  lessonContinueButton.disabled = true;
}

function loadLessonStarterIntoEditor() {
  if (!editor) return;
  languageSelect.value = 'html';
  languageSelect.dispatchEvent(new Event('change'));
  const lesson = lessonCatalog[activeLessonId] || lessonCatalog.lesson1;
  const starter = lesson.source === 'file' ? '' : lesson.starter;
  editor.setValue(starter);
  lessonLoaded = true;
  lessonStepIndex = 0;
  if (activeLessonId === 'lesson1') {
    ensureLessonOneTimerStarted();
    startLessonTimerTicker();
  } else {
    stopLessonTimerTicker();
  }
  lessonMessage.textContent = lesson.source === 'file'
    ? 'Blank starter loaded. Begin from scratch and complete Step 1.'
    : 'Starter loaded. Customize anything in the game code, then click Check.';
  updateLessonTimerDisplay();
  renderLessonStep();
}

function checkLessonStepInEditor() {
  if (!editor || !lessonLoaded) {
    lessonMessage.textContent = 'Load the starter first.';
    return;
  }
  const step = lessonSteps[lessonStepIndex];
  if (!step) return;
  const code = editor.getValue();
  let ok = typeof step.check === 'function'
    ? !!step.check(code)
    : normalizeSnippet(code).includes(normalizeSnippet(step.expected));
  let extraHint = '';
  if (activeLessonId === 'lesson1') {
    const remaining = lessonOneRemainingMs();
    if (remaining > 0) {
      ok = false;
      extraHint = ` Timer not finished yet (${formatMs(remaining)} left).`;
    }
  }
  const hint = step.hint ? ` Hint: ${step.hint}` : '';
  lessonMessage.textContent = ok
    ? 'Correct. Continue unlocked.'
    : `Not yet. Update code in the IDE editor and try again.${hint}${extraHint}`;
  lessonContinueButton.disabled = !ok;
}

function continueLessonStep() {
  if (lessonContinueButton.disabled) return;
  lessonStepIndex += 1;
  if (lessonStepIndex >= lessonSteps.length) {
    lessonStepIndex = lessonSteps.length;
    if (activeLessonId === 'lesson1') {
      setLessonOneComplete();
      refreshLessonLockState();
    }
    renderLessonStep();
    lessonMessage.textContent = activeLessonId === 'lesson1'
      ? 'Lesson 1 complete. Lesson 2 is now unlocked.'
      : 'All checks passed. Great job on Lesson 2.';
    setStatus('Lesson complete');
    return;
  }
  renderLessonStep();
  lessonMessage.textContent = 'Next step ready. Edit code in IDE and click Check.';
}

async function requestLessonHintFromAI() {
  if (!editor || !lessonLoaded) {
    lessonMessage.textContent = 'Load the starter first.';
    return;
  }
  const step = lessonSteps[lessonStepIndex];
  if (!step) return;

  lessonHintButton.disabled = true;
  lessonMessage.textContent = 'Getting AI hint...';

  try {
    const creds = currentOpenaiCredentials();
    if (!creds.apiKey) {
      lessonMessage.textContent = 'Enter OpenAI API Key in sidebar (Explorer view) first.';
      return;
    }

    const res = await fetch('/api/check-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openai-key': creds.apiKey,
        'x-openai-model': creds.model
      },
      body: JSON.stringify({
        step: lessonStepIndex + 1,
        stepPrompt: step.prompt || '',
        expected: step.expected || '',
        studentCode: editor.getValue(),
        clientApiKey: creds.apiKey,
        clientModel: creds.model
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `AI hint request failed (${res.status})`);

    const msg = data.message ? `AI: ${data.message}` : 'AI: I checked your code.';
    const hint = data.hint ? ` Hint: ${data.hint}` : '';
    lessonMessage.textContent = `${msg}${hint}`;
    if (data.correct === true) {
      lessonContinueButton.disabled = false;
      lessonMessage.textContent += ' Continue unlocked.';
    }
  } catch (err) {
    lessonMessage.textContent = err.message || 'AI hint request failed.';
  } finally {
    lessonHintButton.disabled = false;
  }
}

function setOutput(text, isError = false) {
  outputEl.textContent = text;
  outputEl.classList.toggle('error', isError);
  if (setting('output.autoScroll')) outputEl.scrollTop = outputEl.scrollHeight;
}

function setDebugOutput(text, isError = false) {
  debugOutputEl.textContent = text;
  debugOutputEl.classList.toggle('error', isError);
  if (setting('output.autoScroll')) debugOutputEl.scrollTop = debugOutputEl.scrollHeight;
}

function appendTerminalOutput(line = '') {
  const withTs = setting('terminal.showTimestamp') ? `[${new Date().toLocaleTimeString()}] ${line}` : line;
  terminalOutputEl.textContent += `${withTs}\n`;
  const maxLines = Number(setting('terminal.maxBufferLines') || 1200);
  const lines = terminalOutputEl.textContent.split('\n');
  if (lines.length > maxLines) terminalOutputEl.textContent = lines.slice(lines.length - maxLines).join('\n');
  terminalOutputEl.scrollTop = terminalOutputEl.scrollHeight;
}

function settingsSchema() {
  const base = [
    { key: 'editor.fontSize', category: 'Editor', name: 'Editor Font Size', type: 'number', min: 10, max: 28, step: 1, default: 14, description: 'Monaco editor font size.' },
    { key: 'editor.tabSize', category: 'Editor', name: 'Tab Size', type: 'number', min: 2, max: 8, step: 1, default: 2, description: 'Tab size in spaces.' },
    { key: 'editor.wordWrap', category: 'Editor', name: 'Word Wrap', type: 'boolean', default: false, description: 'Wrap long lines in editor.' },
    { key: 'editor.minimap', category: 'Editor', name: 'Show Minimap', type: 'boolean', default: true, description: 'Display editor minimap.' },
    { key: 'editor.lineNumbers', category: 'Editor', name: 'Line Numbers', type: 'boolean', default: true, description: 'Show line numbers in editor.' },
    { key: 'editor.renderWhitespace', category: 'Editor', name: 'Render Whitespace', type: 'select', default: 'none', options: [['none', 'None'], ['boundary', 'Boundary'], ['all', 'All']], description: 'Whitespace character visibility.' },
    { key: 'editor.cursorStyle', category: 'Editor', name: 'Cursor Style', type: 'select', default: 'line', options: [['line', 'Line'], ['block', 'Block'], ['underline', 'Underline']], description: 'Cursor style in editor.' },
    { key: 'editor.smoothScrolling', category: 'Editor', name: 'Smooth Scrolling', type: 'boolean', default: true, description: 'Use smooth scrolling.' },

    { key: 'ui.accentColor', category: 'Appearance', name: 'Accent Color', type: 'text', default: '#007fd4', description: 'Main UI accent color.' },
    { key: 'ui.cornerRadius', category: 'Appearance', name: 'Corner Radius', type: 'number', min: 0, max: 18, step: 1, default: 6, description: 'Global corner radius in px.' },
    { key: 'ui.compactMode', category: 'Appearance', name: 'Compact Mode', type: 'boolean', default: false, description: 'Tighter spacing for controls.' },
    { key: 'ui.highContrast', category: 'Appearance', name: 'High Contrast', type: 'boolean', default: false, description: 'Higher contrast colors.' },

    { key: 'explorer.confirmDelete', category: 'Explorer', name: 'Confirm Delete', type: 'boolean', default: true, description: 'Ask before deleting files/folders.' },
    { key: 'explorer.autoExpandOnOpen', category: 'Explorer', name: 'Auto Expand On Open', type: 'boolean', default: true, description: 'Expand folder when opening files.' },
    { key: 'explorer.singleClickOpen', category: 'Explorer', name: 'Single Click Open', type: 'boolean', default: true, description: 'Open files on single click.' },
    { key: 'explorer.sortMode', category: 'Explorer', name: 'Sort Mode', type: 'select', default: 'natural', options: [['natural', 'Natural'], ['name-asc', 'Name A-Z'], ['name-desc', 'Name Z-A']], description: 'Sort mode in file tree.' },

    { key: 'run.clearOutputBeforeRun', category: 'Execution', name: 'Clear Output Before Run', type: 'boolean', default: false, description: 'Clear output before each run.' },
    { key: 'run.confirmBeforeRemote', category: 'Execution', name: 'Confirm Remote Execution', type: 'boolean', default: false, description: 'Confirm before remote compilation API calls.' },
    { key: 'run.openPreviewNewTab', category: 'Execution', name: 'Open Preview In New Tab', type: 'boolean', default: true, description: 'Open HTML/CSS preview in new tab.' },

    { key: 'output.softWrap', category: 'Output', name: 'Soft Wrap Output', type: 'boolean', default: true, description: 'Wrap long output lines.' },
    { key: 'output.autoScroll', category: 'Output', name: 'Auto Scroll Output', type: 'boolean', default: true, description: 'Auto-scroll output to latest line.' },

    { key: 'debug.includeInventory', category: 'Debug', name: 'Include File Inventory', type: 'boolean', default: true, description: 'Include project inventory in debug report.' },
    { key: 'debug.includeReferenceCheck', category: 'Debug', name: 'Include Reference Check', type: 'boolean', default: true, description: 'Check local HTML references.' },
    { key: 'debug.includeRuntimeSmoke', category: 'Debug', name: 'Include Runtime Smoke Test', type: 'boolean', default: true, description: 'Run JS/TS smoke test in debug.' },
    { key: 'debug.maxItems', category: 'Debug', name: 'Max Debug Lines', type: 'number', min: 20, max: 500, step: 10, default: 200, description: 'Maximum debug output lines.' },

    { key: 'terminal.fontSize', category: 'Terminal', name: 'Terminal Font Size', type: 'number', min: 11, max: 20, step: 1, default: 13, description: 'Terminal font size.' },
    { key: 'terminal.autoFocusInput', category: 'Terminal', name: 'Auto Focus Terminal', type: 'boolean', default: false, description: 'Focus terminal input on startup.' },
    { key: 'terminal.showTimestamp', category: 'Terminal', name: 'Show Timestamp', type: 'boolean', default: false, description: 'Prefix terminal output lines with time.' },
    { key: 'terminal.maxBufferLines', category: 'Terminal', name: 'Max Buffer Lines', type: 'number', min: 100, max: 5000, step: 50, default: 1200, description: 'Maximum terminal line buffer.' },

    { key: 'accessibility.reducedMotion', category: 'Accessibility', name: 'Reduced Motion', type: 'boolean', default: false, description: 'Disable most transitions/animations.' },
    { key: 'accessibility.strongFocus', category: 'Accessibility', name: 'Strong Focus Ring', type: 'boolean', default: true, description: 'Stronger keyboard focus styles.' }
  ];

  const templateIds = [
    'javascript','typescript','python','lua','ruby','c','cpp','rust','html','css','json','markdown','yaml','xml','sql',
    'algol','apl','awk','ada','gccasm','nasm','bc','bash','befunge','brainfuck','cpp14','cpp17','c99','csharp','clisp',
    'iscobol','cow','clojure','cobol','coffeescript','crystal','csharpdblink','d','dart','deno','elixir','erlang','fsharp','fasm',
    'factor','falcon','fantom','forth','fortran','freebasic','go','groovy','hack','haskell','haxe','icon','intercal','itext',
    'itextcsharp','jbang','jlang','java','javadblink','jelly','julia','kotlin','lolcode','moonscript','mozart','nemerle','nim',
    'ocaml','objc','octave','php','pascal','perl','phpdblink','picolisp','pike','prolog','python2','python3','python3dblink',
    'r','racket','raku','rhino','ruby','rust','scheme','smalltalk','spidermonkey','swift','tasm','tcl','typescript','unlambda',
    'vbn','verilog','whitespace','yabasic'
  ];

  const templateSettings = templateIds.map((id) => ({
    key: `templates.${id}`,
    category: 'Templates',
    name: `Starter Template: ${id}`,
    type: 'boolean',
    default: true,
    description: `Enable starter template for ${id}.`
  }));

  return [...base, ...templateSettings];
}

function defaultSettings() {
  const out = {};
  settingsSchema().forEach((s) => { out[s.key] = s.default; });
  return out;
}

function loadSettings() {
  const defs = defaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    settingsState = { ...defs, ...(parsed || {}) };
  } catch {
    settingsState = defs;
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsState));
}

function setting(key) {
  return settingsState[key];
}

function setSetting(key, value) {
  settingsState[key] = value;
  saveSettings();
  applySettings();
  renderSettingsContent();
}

function applySettings() {
  document.documentElement.style.setProperty('--focus', String(setting('ui.accentColor') || '#007fd4'));
  document.documentElement.style.setProperty('--ui-radius', `${Number(setting('ui.cornerRadius') || 6)}px`);

  document.body.classList.toggle('compact-ui', !!setting('ui.compactMode'));
  document.body.classList.toggle('high-contrast-ui', !!setting('ui.highContrast'));
  document.body.classList.toggle('reduced-motion-ui', !!setting('accessibility.reducedMotion'));
  document.body.classList.toggle('strong-focus-ui', !!setting('accessibility.strongFocus'));

  outputEl.style.whiteSpace = setting('output.softWrap') ? 'pre-wrap' : 'pre';
  debugOutputEl.style.whiteSpace = setting('output.softWrap') ? 'pre-wrap' : 'pre';
  terminalOutputEl.style.whiteSpace = setting('output.softWrap') ? 'pre-wrap' : 'pre';

  const tFont = Number(setting('terminal.fontSize') || 13);
  terminalOutputEl.style.fontSize = `${clamp(tFont, 11, 20)}px`;
  terminalInputEl.style.fontSize = `${clamp(tFont, 11, 20)}px`;
  terminalPromptEl.style.fontSize = `${Math.max(11, clamp(tFont, 11, 20) - 1)}px`;

  if (editor) {
    editor.updateOptions({
      fontSize: Number(setting('editor.fontSize') || 14),
      tabSize: Number(setting('editor.tabSize') || 2),
      wordWrap: setting('editor.wordWrap') ? 'on' : 'off',
      minimap: { enabled: !!setting('editor.minimap') },
      lineNumbers: setting('editor.lineNumbers') ? 'on' : 'off',
      renderWhitespace: setting('editor.renderWhitespace') || 'none',
      cursorStyle: setting('editor.cursorStyle') || 'line',
      smoothScrolling: !!setting('editor.smoothScrolling')
    });
  }
}

function filteredSettings() {
  const q = (settingsSearchInput.value || '').trim().toLowerCase();
  return settingsSchema().filter((s) => {
    const inCategory = s.category === activeSettingsCategory;
    if (!q) return inCategory;
    const hay = `${s.category} ${s.name} ${s.description} ${s.key}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderSettingsCategories() {
  settingsCategoryList.innerHTML = '';
  const categories = [...new Set(settingsSchema().map((s) => s.category))];
  categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `settings-category-item${category === activeSettingsCategory ? ' active' : ''}`;
    btn.textContent = category;
    btn.addEventListener('click', () => {
      activeSettingsCategory = category;
      renderSettingsCategories();
      renderSettingsContent();
    });
    settingsCategoryList.appendChild(btn);
  });
}

function settingControl(s) {
  const value = setting(s.key);
  const wrap = document.createElement('div');
  wrap.className = 'setting-control';

  if (s.type === 'boolean') {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!value;
    input.addEventListener('change', () => setSetting(s.key, input.checked));
    wrap.appendChild(input);
    return wrap;
  }

  if (s.type === 'number') {
    const input = document.createElement('input');
    input.type = 'number';
    if (typeof s.min === 'number') input.min = String(s.min);
    if (typeof s.max === 'number') input.max = String(s.max);
    if (typeof s.step === 'number') input.step = String(s.step);
    input.value = String(value);
    input.addEventListener('change', () => {
      const n = Number(input.value);
      if (Number.isFinite(n)) setSetting(s.key, n);
    });
    wrap.appendChild(input);
    return wrap;
  }

  if (s.type === 'select') {
    const select = document.createElement('select');
    (s.options || []).forEach(([optVal, optLabel]) => {
      const opt = document.createElement('option');
      opt.value = optVal;
      opt.textContent = optLabel;
      if (optVal === value) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => setSetting(s.key, select.value));
    wrap.appendChild(select);
    return wrap;
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.value = String(value ?? '');
  input.addEventListener('change', () => setSetting(s.key, input.value));
  wrap.appendChild(input);
  return wrap;
}

function renderSettingsContent() {
  settingsContent.innerHTML = '';
  const items = filteredSettings();
  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'setting-row';
    empty.textContent = 'No settings match your search.';
    settingsContent.appendChild(empty);
    return;
  }

  items.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'setting-row';
    const top = document.createElement('div');
    top.className = 'setting-row-top';
    const name = document.createElement('div');
    name.className = 'setting-name';
    name.textContent = s.name;
    top.appendChild(name);
    top.appendChild(settingControl(s));

    const desc = document.createElement('div');
    desc.className = 'setting-description';
    desc.textContent = `${s.description} (${s.key})`;

    row.appendChild(top);
    row.appendChild(desc);
    settingsContent.appendChild(row);
  });
}

function openSettings() {
  settingsOpen = true;
  settingsOverlay.classList.remove('hidden');
  settingsOverlay.setAttribute('aria-hidden', 'false');
  renderSettingsCategories();
  renderSettingsContent();
  settingsSearchInput.focus();
}

function closeSettings() {
  settingsOpen = false;
  settingsOverlay.classList.add('hidden');
  settingsOverlay.setAttribute('aria-hidden', 'true');
}

function normalizePaneSizes() {
  if (!mainEl || !toolbarEl) return;

  if (window.innerWidth > 980) {
    const currentSidebar = pxVar('--sidebar-width', 320);
    const maxSidebar = Math.max(220, window.innerWidth - 520);
    setPxVar('--sidebar-width', clamp(currentSidebar, 220, maxSidebar));
  }

  const splittersH =
    (panelVisibility.output ? (editorOutputSplitter?.offsetHeight || 6) : 0) +
    (panelVisibility.output && panelVisibility.debug ? (outputDebugSplitter?.offsetHeight || 6) : 0);

  const toolbarH = toolbarEl.offsetHeight || 48;
  const mainH = mainEl.clientHeight || window.innerHeight;
  const minEditor = 140;
  const minOutput = 100;
  const minDebug = 100;
  const minTerminal = 120;

  let outputH = panelVisibility.output ? pxVar('--output-height', 220) : 0;
  let debugH = panelVisibility.debug ? pxVar('--debug-height', 190) : 0;
  let terminalH = panelVisibility.terminal ? pxVar('--terminal-height', 190) : 0;

  if (panelVisibility.output) {
    outputH = clamp(outputH, minOutput, Math.max(minOutput, mainH - toolbarH - splittersH - minEditor - (panelVisibility.debug ? minDebug : 0) - (panelVisibility.terminal ? minTerminal : 0)));
  }
  if (panelVisibility.debug) {
    debugH = clamp(debugH, minDebug, Math.max(minDebug, mainH - toolbarH - splittersH - minEditor - (panelVisibility.output ? outputH : 0) - (panelVisibility.terminal ? minTerminal : 0)));
  }
  if (panelVisibility.terminal) {
    terminalH = clamp(terminalH, minTerminal, Math.max(minTerminal, mainH - toolbarH - splittersH - minEditor - (panelVisibility.output ? outputH : 0) - (panelVisibility.debug ? debugH : 0)));
  }

  setPxVar('--output-height', outputH);
  setPxVar('--debug-height', debugH);
  setPxVar('--terminal-height', terminalH);
}

function beginDrag(onMove) {
  function moveHandler(event) {
    onMove(event);
  }

  function upHandler() {
    window.removeEventListener('mousemove', moveHandler);
    window.removeEventListener('mouseup', upHandler);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  window.addEventListener('mousemove', moveHandler);
  window.addEventListener('mouseup', upHandler);
  document.body.style.userSelect = 'none';
}

function setupSplitters() {
  sidebarSplitter?.addEventListener('mousedown', (event) => {
    if (window.innerWidth <= 980) return;
    event.preventDefault();
    document.body.style.cursor = 'col-resize';
    beginDrag((moveEvent) => {
      const width = clamp(moveEvent.clientX, 220, Math.max(220, window.innerWidth - 520));
      setPxVar('--sidebar-width', width);
    });
  });

  editorOutputSplitter?.addEventListener('mousedown', (event) => {
    event.preventDefault();
    document.body.style.cursor = 'row-resize';
    const startY = event.clientY;
    const startOutput = pxVar('--output-height', 220);
    beginDrag((moveEvent) => {
      setPxVar('--output-height', startOutput + (startY - moveEvent.clientY));
      normalizePaneSizes();
    });
  });

  outputDebugSplitter?.addEventListener('mousedown', (event) => {
    event.preventDefault();
    document.body.style.cursor = 'row-resize';
    const startY = event.clientY;
    const startDebug = pxVar('--debug-height', 190);
    beginDrag((moveEvent) => {
      setPxVar('--debug-height', startDebug + (startY - moveEvent.clientY));
      normalizePaneSizes();
    });
  });

  window.addEventListener('resize', normalizePaneSizes);
  normalizePaneSizes();
}

function loadPanelVisibility() {
  try {
    const raw = localStorage.getItem(PANEL_VISIBILITY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    panelVisibility = {
      output: parsed?.output !== false,
      debug: parsed?.debug !== false,
      terminal: parsed?.terminal !== false
    };
  } catch {
    panelVisibility = { output: true, debug: true, terminal: true };
  }
}

function savePanelVisibility() {
  localStorage.setItem(PANEL_VISIBILITY_KEY, JSON.stringify(panelVisibility));
}

function applyPanelVisibility() {
  outputPanelEl.style.display = panelVisibility.output ? 'flex' : 'none';
  debugPanelEl.style.display = panelVisibility.debug ? 'flex' : 'none';
  terminalPanelEl.style.display = panelVisibility.terminal ? 'flex' : 'none';

  editorOutputSplitter.style.display = panelVisibility.output ? 'block' : 'none';
  outputDebugSplitter.style.display = panelVisibility.output && panelVisibility.debug ? 'block' : 'none';

  panelTabButtons.forEach((btn) => {
    btn.classList.toggle('active', !!panelVisibility[btn.dataset.panel]);
  });
  normalizePaneSizes();
}

function setPanelVisibility(panel, visible) {
  panelVisibility[panel] = visible;
  savePanelVisibility();
  applyPanelVisibility();
}

function closeLanguageMenu() {
  languageMenuOpen = false;
  languageDropdownMenu.classList.add('hidden');
  languageDropdownButton.setAttribute('aria-expanded', 'false');
}

function openLanguageMenu() {
  languageMenuOpen = true;
  languageDropdownMenu.classList.remove('hidden');
  languageDropdownButton.setAttribute('aria-expanded', 'true');
}

function isJdoodleLanguage(value) {
  return typeof value === 'string' && value.startsWith('jdoodle:');
}

function parseJdoodleLanguage(value) {
  if (!isJdoodleLanguage(value)) return null;
  const [, language, versionIndexRaw] = value.split(':');
  const versionIndex = Number.parseInt(versionIndexRaw, 10);
  if (!language || !Number.isFinite(versionIndex)) return null;
  return { language, versionIndex };
}

function updateLanguageDropdownButtonText() {
  const selected = languageSelect.options[languageSelect.selectedIndex];
  if (!selected) return;
  languageDropdownButton.textContent = selected.textContent;
}

function renderLanguageDropdownMenu() {
  languageDropdownMenu.innerHTML = '';
  for (const option of languageSelect.options) {
    if (option.disabled) {
      const divider = document.createElement('div');
      divider.className = 'language-dropdown-divider';
      divider.textContent = option.textContent;
      languageDropdownMenu.appendChild(divider);
      continue;
    }
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `language-dropdown-item${option.value === languageSelect.value ? ' active' : ''}`;
    item.textContent = option.textContent;
    item.addEventListener('click', () => {
      languageSelect.value = option.value;
      languageSelect.dispatchEvent(new Event('change'));
      closeLanguageMenu();
    });
    languageDropdownMenu.appendChild(item);
  }
}

function populateJdoodleLanguages() {
  const divider = document.createElement('option');
  divider.value = '';
  divider.disabled = true;
  divider.textContent = '──────── JDoodle (81+) ────────';
  languageSelect.appendChild(divider);

  for (const [language, versionIndex, label] of JDOODLE_LANGUAGES) {
    const option = document.createElement('option');
    option.value = `jdoodle:${language}:${versionIndex}`;
    option.textContent = `${label} (JDoodle)`;
    languageSelect.appendChild(option);
  }

  updateLanguageDropdownButtonText();
  renderLanguageDropdownMenu();
}

function loadJdoodleCredentials() {
  jdoodleClientIdInput.value = localStorage.getItem(JDOODLE_CLIENT_ID_KEY) || '';
  jdoodleClientSecretInput.value = localStorage.getItem(JDOODLE_CLIENT_SECRET_KEY) || '';
}

function saveJdoodleCredentials() {
  const clientId = jdoodleClientIdInput.value.trim();
  const clientSecret = jdoodleClientSecretInput.value.trim();
  if (!clientId || !clientSecret) {
    throw new Error('Enter both JDoodle Client ID and Client Secret.');
  }
  localStorage.setItem(JDOODLE_CLIENT_ID_KEY, clientId);
  localStorage.setItem(JDOODLE_CLIENT_SECRET_KEY, clientSecret);
}

function loadOpenaiCredentials() {
  if (openaiApiKeyInput) openaiApiKeyInput.value = localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || '';
  if (openaiModelInput) openaiModelInput.value = localStorage.getItem(OPENAI_MODEL_STORAGE_KEY) || 'gpt-4.1';
}

function saveOpenaiCredentials() {
  const apiKey = openaiApiKeyInput?.value.trim() || '';
  const model = openaiModelInput?.value.trim() || 'gpt-4.1';
  if (!apiKey) throw new Error('Enter OpenAI API Key.');
  localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, apiKey);
  localStorage.setItem(OPENAI_MODEL_STORAGE_KEY, model);
}

function currentOpenaiCredentials() {
  const inputKey = openaiApiKeyInput?.value.trim() || '';
  const inputModel = openaiModelInput?.value.trim() || '';
  const storedKey = (localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || '').trim();
  const storedModel = (localStorage.getItem(OPENAI_MODEL_STORAGE_KEY) || '').trim();
  return {
    apiKey: inputKey || storedKey,
    model: inputModel || storedModel || 'gpt-4.1'
  };
}

function queueProjectSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, 150);
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function detectLanguageFromName(filename, fallback = 'plaintext') {
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return fallback;
  const ext = filename.slice(idx + 1).toLowerCase();
  return extensionToLanguage[ext] || fallback;
}

function defaultProject() {
  const rootId = 'root';
  const srcId = createId('folder');
  const cssId = createId('folder');
  const jsId = createId('folder');
  const assetsId = createId('folder');
  const imagesId = createId('folder');
  const indexId = createId('file');
  const styleId = createId('file');
  const scriptId = createId('file');
  const readmeId = createId('file');

  return {
    rootId,
    selectedFileId: indexId,
    nodes: {
      [rootId]: { id: rootId, name: 'Project', type: 'folder', parentId: null, expanded: true, children: [indexId, srcId, assetsId, readmeId] },
      [srcId]: { id: srcId, name: 'src', type: 'folder', parentId: rootId, expanded: true, children: [cssId, jsId] },
      [cssId]: { id: cssId, name: 'css', type: 'folder', parentId: srcId, expanded: true, children: [styleId] },
      [jsId]: { id: jsId, name: 'js', type: 'folder', parentId: srcId, expanded: true, children: [scriptId] },
      [assetsId]: { id: assetsId, name: 'assets', type: 'folder', parentId: rootId, expanded: true, children: [imagesId] },
      [imagesId]: { id: imagesId, name: 'images', type: 'folder', parentId: assetsId, expanded: true, children: [] },
      [indexId]: { id: indexId, name: 'index.html', type: 'file', parentId: rootId, language: 'html', content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Starter Site</title>\n    <link rel="stylesheet" href="./src/css/style.css" />\n  </head>\n  <body>\n    <main class="container">\n      <h1>Multi-File HTML Template</h1>\n      <p>This project is split into folders and files.</p>\n      <button id="ctaButton">Click me</button>\n      <p id="statusText">Waiting...</p>\n    </main>\n    <script src="./src/js/main.js"></script>\n  </body>\n</html>` },
      [styleId]: { id: styleId, name: 'style.css', type: 'file', parentId: cssId, language: 'css', content: `body { font-family: Arial, sans-serif; background: #111827; color: #f3f4f6; }` },
      [scriptId]: { id: scriptId, name: 'main.js', type: 'file', parentId: jsId, language: 'javascript', content: `const button = document.getElementById('ctaButton');\nconst status = document.getElementById('statusText');\nbutton?.addEventListener('click', () => { status.textContent = 'Clicked'; });` },
      [readmeId]: { id: readmeId, name: 'README.md', type: 'file', parentId: rootId, language: 'markdown', content: '# Multi-File HTML Template' }
    }
  };
}

function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProject();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.nodes || !parsed.rootId || !parsed.nodes[parsed.rootId]) return defaultProject();
    return parsed;
  } catch {
    return defaultProject();
  }
}

function nodeById(id) {
  if (!project || !project.nodes) return null;
  return project.nodes[id] || null;
}

function ensureProjectIntegrity() {
  if (!project || typeof project !== 'object' || !project.nodes || typeof project.nodes !== 'object') {
    project = defaultProject();
    return;
  }

  if (!project.rootId || typeof project.rootId !== 'string') {
    project.rootId = 'root';
  }

  if (!project.nodes[project.rootId] || project.nodes[project.rootId].type !== 'folder') {
    project.nodes[project.rootId] = {
      id: project.rootId,
      name: 'Project',
      type: 'folder',
      parentId: null,
      expanded: true,
      children: []
    };
  }

  for (const [id, node] of Object.entries(project.nodes)) {
    if (!node || typeof node !== 'object') {
      delete project.nodes[id];
      continue;
    }
    if (node.id !== id) node.id = id;
    if (!node.type) node.type = 'file';
    if (node.type === 'folder') {
      if (!Array.isArray(node.children)) node.children = [];
    } else {
      if (typeof node.content !== 'string') node.content = '';
      if (typeof node.name !== 'string') node.name = `${id}.txt`;
    }
  }
}

function resolveSafeFolderId(preferredId = null) {
  ensureProjectIntegrity();
  const rootId = project.rootId;

  const preferred = preferredId ? nodeById(preferredId) : null;
  if (preferred?.type === 'folder') return preferred.id;
  if (preferred?.type === 'file') {
    const parent = nodeById(preferred.parentId);
    if (parent?.type === 'folder') return parent.id;
  }

  const selected = selectedNodeId ? nodeById(selectedNodeId) : null;
  if (selected?.type === 'folder') return selected.id;
  if (selected?.type === 'file') {
    const parent = nodeById(selected.parentId);
    if (parent?.type === 'folder') return parent.id;
  }

  const root = nodeById(rootId);
  if (root?.type === 'folder') return rootId;

  project = defaultProject();
  return project.rootId;
}

function ensureUniqueName(parentId, desiredName) {
  const parent = nodeById(parentId);
  if (!parent || parent.type !== 'folder') return desiredName;
  const siblings = parent.children.map((id) => nodeById(id)?.name).filter(Boolean);
  if (!siblings.includes(desiredName)) return desiredName;

  const dot = desiredName.lastIndexOf('.');
  const base = dot > 0 ? desiredName.slice(0, dot) : desiredName;
  const ext = dot > 0 ? desiredName.slice(dot) : '';
  let i = 1;
  while (siblings.includes(`${base}-${i}${ext}`)) i += 1;
  return `${base}-${i}${ext}`;
}

function currentFolderId() {
  return resolveSafeFolderId(contextTargetNodeId);
}

function closeExplorerMenu() {
  explorerContextMenu.classList.add('hidden');
  contextTargetNodeId = null;
}

function openExplorerMenu(x, y, targetNodeId = null) {
  contextTargetNodeId = targetNodeId;
  explorerContextMenu.classList.remove('hidden');
  const menuWidth = explorerContextMenu.offsetWidth || 220;
  const menuHeight = explorerContextMenu.offsetHeight || 132;
  const maxX = window.innerWidth - menuWidth - 8;
  const maxY = window.innerHeight - menuHeight - 8;
  explorerContextMenu.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
  explorerContextMenu.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
}

function collectDescendants(nodeId, out = []) {
  const node = nodeById(nodeId);
  if (!node) return out;
  out.push(nodeId);
  if (node.type === 'folder') node.children.forEach((childId) => collectDescendants(childId, out));
  return out;
}

function deleteNodeWithConfirm() {
  const targetId = contextTargetNodeId || selectedNodeId;
  const node = targetId ? nodeById(targetId) : null;
  if (!node || node.id === project.rootId) return;
  if (setting('explorer.confirmDelete') !== false && !window.confirm(`Delete "${node.name}"?`)) return;

  const parent = nodeById(node.parentId);
  if (parent?.type === 'folder') {
    parent.children = parent.children.filter((id) => id !== node.id);
  }

  collectDescendants(node.id).forEach((id) => {
    const model = modelByFileId.get(id);
    if (model) {
      model.dispose();
      modelByFileId.delete(id);
    }
    delete project.nodes[id];
  });

  const fallback = Object.values(project.nodes).find((n) => n.type === 'file');
  if (fallback) openFile(fallback.id);
  else {
    selectedNodeId = project.rootId;
    activeFileLabel.textContent = 'No file open';
    if (editor) editor.setModel(null);
    renderTree();
  }

  queueProjectSave();
  closeExplorerMenu();
  setStatus('Deleted');
}

function addFolder(name, parentIdOverride = null) {
  const parentId = resolveSafeFolderId(parentIdOverride || currentFolderId());
  const id = createId('folder');
  const finalName = ensureUniqueName(parentId, name.trim());
  project.nodes[id] = { id, name: finalName, type: 'folder', parentId, expanded: true, children: [] };
  const parent = nodeById(parentId);
  if (!parent || parent.type !== 'folder') throw new Error('Unable to create folder: target folder missing.');
  parent.children.push(id);
  selectedNodeId = id;
  queueProjectSave();
  renderTree();
  setStatus(`Created ${finalName}`);
}

function addFile(name, language, content, parentIdOverride = null) {
  ensureProjectIntegrity();
  let parentId = resolveSafeFolderId(parentIdOverride || currentFolderId());
  let parentNode = nodeById(parentId);

  // Emergency fallback: always ensure a writable root folder target.
  if (!parentNode || parentNode.type !== 'folder') {
    parentId = project.rootId || 'root';
    if (!project.nodes[parentId] || project.nodes[parentId].type !== 'folder') {
      project.nodes[parentId] = {
        id: parentId,
        name: 'Project',
        type: 'folder',
        parentId: null,
        expanded: true,
        children: []
      };
      project.rootId = parentId;
    }
    parentNode = project.nodes[parentId];
    if (!Array.isArray(parentNode.children)) parentNode.children = [];
  }

  const id = createId('file');
  const safeBaseName = (name || '').trim() || `new-file-${Date.now().toString(36)}.txt`;
  const finalName = ensureUniqueName(parentId, safeBaseName);
  project.nodes[id] = { id, name: finalName, type: 'file', parentId, language: language || 'plaintext', content: String(content ?? '') };
  parentNode.children.push(id);
  selectedNodeId = id;
  queueProjectSave();
  renderTree();
  openFile(id);
  setStatus(`Created ${finalName}`);
  return id;
}

function promptNewFolder() {
  const parentId = currentFolderId();
  closeExplorerMenu();
  const name = prompt('Folder name:');
  if (!name || !name.trim()) return;
  addFolder(name.trim(), parentId);
}

function promptNewTextFile() {
  const parentId = currentFolderId();
  closeExplorerMenu();
  let name = prompt('Text file name (.txt or .md):', 'notes.md');
  if (!name || !name.trim()) return;
  name = name.trim();
  if (!name.includes('.')) name += '.txt';
  const lang = detectLanguageFromName(name, 'plaintext');
  const finalLang = new Set(['markdown', 'plaintext']).has(lang) ? lang : 'plaintext';
  addFile(name, finalLang, getTemplateForLanguage(finalLang), parentId);
}

function promptNewCodeFile() {
  const parentId = currentFolderId() || project.rootId;
  closeExplorerMenu();
  setStatus('Creating language file...');
  const selectedLang = languageSelect?.value || 'javascript';
  const jd = parseJdoodleLanguage(selectedLang);
  const ext = jd ? (languageToDefaultExt[detectLanguageFromName(`x.${jd.language}`,'plaintext')] || 'txt') : (languageToDefaultExt[selectedLang] || 'txt');
  let name = '';
  try {
    name = window.prompt('Code file name:', `main.${ext}`) || '';
  } catch {
    name = '';
  }
  if (!name.trim()) name = `new-file-${Date.now().toString(36)}.${ext}`;
  name = name.trim();
  if (!name.includes('.')) name += `.${ext}`;

  const localLang = detectLanguageFromName(name, 'plaintext');
  const lang = jd ? selectedLang : detectLanguageFromName(name, selectedLang || 'javascript');
  const templateKey = `templates.${jd ? jd.language : selectedLang}`;
  const content = setting(templateKey) === false ? '' : getTemplateForLanguage(localLang);
  addFile(name, lang, content, parentId);
}

function sortChildren(ids) {
  const mode = setting('explorer.sortMode') || 'natural';
  const out = [...ids];
  if (mode === 'name-asc' || mode === 'name-desc') {
    out.sort((a,b) => {
      const na = nodeById(a)?.name || '';
      const nb = nodeById(b)?.name || '';
      return mode === 'name-asc' ? na.localeCompare(nb) : nb.localeCompare(na);
    });
  }
  return out;
}

function renderTree() {
  explorerTree.innerHTML = '';

  function walk(nodeId, depth) {
    const node = nodeById(nodeId);
    if (!node || nodeId === project.rootId) {
      if (node && node.type === 'folder') {
        sortChildren(node.children).forEach((childId) => walk(childId, 0));
      }
      return;
    }

    const row = document.createElement('div');
    row.className = `tree-row${selectedNodeId === node.id ? ' active' : ''}`;
    row.style.paddingLeft = `${8 + depth * 14}px`;

    const caret = document.createElement('span');
    caret.className = 'tree-caret';
    caret.textContent = node.type === 'folder' ? (node.expanded ? '▾' : '▸') : '·';

    const icon = document.createElement('span');
    icon.className = `tree-icon ${node.type === 'folder' ? 'folder' : 'file'}`;
    icon.innerHTML = node.type === 'folder' ? ICON_FOLDER : ICON_FILE;

    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = node.name;

    row.appendChild(caret);
    row.appendChild(icon);
    row.appendChild(label);

    const singleClick = setting('explorer.singleClickOpen') !== false;

    row.addEventListener('click', () => {
      closeExplorerMenu();
      selectedNodeId = node.id;
      if (singleClick) {
        if (node.type === 'folder') {
          node.expanded = !node.expanded;
          queueProjectSave();
        } else openFile(node.id);
      }
      renderTree();
    });

    row.addEventListener('dblclick', () => {
      if (singleClick) return;
      selectedNodeId = node.id;
      if (node.type === 'folder') {
        node.expanded = !node.expanded;
        queueProjectSave();
      } else openFile(node.id);
      renderTree();
    });

    row.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      selectedNodeId = node.id;
      renderTree();
      openExplorerMenu(event.clientX, event.clientY, node.id);
    });

    explorerTree.appendChild(row);

    if (node.type === 'folder' && node.expanded) {
      sortChildren(node.children).forEach((childId) => walk(childId, depth + 1));
    }
  }

  walk(project.rootId, 0);
}

function monacoLanguageForNode(fileNode) {
  let language = fileNode.language || detectLanguageFromName(fileNode.name, 'plaintext');
  if (isJdoodleLanguage(language)) language = detectLanguageFromName(fileNode.name, 'plaintext');
  return languageToMonaco[language] || 'plaintext';
}

function openFile(fileId) {
  if (!editor) return;
  const node = nodeById(fileId);
  if (!node || node.type !== 'file') return;

  selectedNodeId = fileId;
  project.selectedFileId = fileId;

  if (setting('explorer.autoExpandOnOpen') !== false) {
    let p = node.parentId;
    while (p) {
      const pn = nodeById(p);
      if (!pn || pn.type !== 'folder') break;
      pn.expanded = true;
      p = pn.parentId;
    }
  }

  let model = modelByFileId.get(fileId);
  if (!model) {
    const uri = window.monaco.Uri.parse(`inmemory://project/${fileId}/${encodeURIComponent(node.name)}`);
    model = window.monaco.editor.createModel(node.content || '', monacoLanguageForNode(node), uri);
    model.onDidChangeContent(() => {
      const updated = nodeById(fileId);
      if (updated?.type === 'file') {
        updated.content = model.getValue();
        queueProjectSave();
      }
    });
    modelByFileId.set(fileId, model);
  }

  window.monaco.editor.setModelLanguage(model, monacoLanguageForNode(node));
  editor.setModel(model);

  const selectedLang = node.language || detectLanguageFromName(node.name, 'plaintext');
  if (selectedLang && (languageToMonaco[selectedLang] || isJdoodleLanguage(selectedLang))) {
    languageSelect.value = selectedLang;
    updateLanguageDropdownButtonText();
    renderLanguageDropdownMenu();
  }

  activeFileLabel.textContent = node.name;
  renderTree();
  queueProjectSave();
}

function getNodePath(nodeId) {
  const parts = [];
  let current = nodeById(nodeId);
  while (current && current.parentId) {
    if (current.id !== project.rootId) parts.push(current.name);
    current = nodeById(current.parentId);
  }
  return parts.reverse().join('/');
}

function getNodeAbsolutePath(nodeId) {
  if (!nodeId || nodeId === project.rootId) return '/';
  const rel = getNodePath(nodeId);
  return rel ? `/${rel}` : '/';
}

function updateTerminalPrompt() {
  terminalPromptEl.textContent = `${getNodeAbsolutePath(terminalCwdNodeId)} $`;
}

function parseCommandArgs(input) {
  return input.match(/"[^"]*"|'[^']*'|\S+/g)?.map((token) => token.replace(/^['"]|['"]$/g, '')) || [];
}

function findChildByName(parentId, name) {
  const parent = nodeById(parentId);
  if (!parent || parent.type !== 'folder') return null;
  for (const childId of parent.children) {
    const child = nodeById(childId);
    if (child?.name === name) return child;
  }
  return null;
}

function resolvePathToNode(pathInput = '.') {
  const raw = (pathInput || '.').trim();
  let currentId = raw.startsWith('/') ? project.rootId : terminalCwdNodeId;
  const parts = raw.split('/').filter(Boolean);
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      const current = nodeById(currentId);
      currentId = current?.parentId || project.rootId;
      continue;
    }
    const next = findChildByName(currentId, part);
    if (!next) return null;
    currentId = next.id;
  }
  return nodeById(currentId);
}

function splitParentAndName(pathInput) {
  const value = (pathInput || '').trim();
  if (!value) return null;
  const parts = value.split('/').filter(Boolean);
  const baseName = parts.pop();
  const parentPath = value.startsWith('/') ? `/${parts.join('/')}` : parts.join('/') || '.';
  const parentNode = resolvePathToNode(parentPath);
  if (!parentNode || parentNode.type !== 'folder') return null;
  return { parentNode, baseName };
}

function addFolderToParent(parentId, name) {
  const finalName = ensureUniqueName(parentId, name.trim());
  const id = createId('folder');
  project.nodes[id] = { id, name: finalName, type: 'folder', parentId, expanded: true, children: [] };
  nodeById(parentId).children.push(id);
  queueProjectSave();
  return nodeById(id);
}

function addFileToParent(parentId, name, language, content) {
  const finalName = ensureUniqueName(parentId, name.trim());
  const id = createId('file');
  project.nodes[id] = { id, name: finalName, type: 'file', parentId, language, content };
  nodeById(parentId).children.push(id);
  queueProjectSave();
  return nodeById(id);
}

function getProjectFiles() {
  return Object.values(project.nodes)
    .filter((node) => node.type === 'file')
    .map((node) => ({
      id: node.id,
      name: node.name,
      path: getNodePath(node.id),
      language: node.language || detectLanguageFromName(node.name, 'plaintext'),
      content: node.content || ''
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function isExternalOrSpecialPath(path) {
  return /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('#');
}

function resolveRelativePath(fromFilePath, referencedPath) {
  if (referencedPath.startsWith('/')) return referencedPath.slice(1);
  const fromParts = fromFilePath.split('/');
  fromParts.pop();
  const refParts = referencedPath.split('/');
  for (const part of refParts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (fromParts.length > 0) fromParts.pop();
      continue;
    }
    fromParts.push(part);
  }
  return fromParts.join('/');
}

async function ensureTypeScriptLoaded() {
  if (window.ts?.transpile) return;
  await import('https://cdnjs.cloudflare.com/ajax/libs/typescript/5.6.3/typescript.min.js');
}

async function toRunnableJavaScript(file) {
  if (file.language !== 'typescript') return file.content;
  await ensureTypeScriptLoaded();
  return window.ts.transpile(file.content, {
    target: window.ts.ScriptTarget.ES2020,
    module: window.ts.ModuleKind.None
  });
}

function openPreviewHtml(html) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const target = setting('run.openPreviewNewTab') === false ? 'ide-preview' : '_blank';
  window.open(url, target, 'noopener,noreferrer');
}

async function runHtmlProject(entryFile) {
  const files = getProjectFiles();
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  let html = entryFile.content;

  const linkRe = /<link\b([^>]*?)href=(["'])([^"']+)\2([^>]*)>/gi;
  html = html.replace(linkRe, (full, pre, quote, href, post) => {
    if (isExternalOrSpecialPath(href)) return full;
    if (!/rel\s*=\s*["']stylesheet["']/i.test(`${pre} ${post}`)) return full;
    const resolved = resolveRelativePath(entryFile.path, href);
    const target = filesByPath.get(resolved);
    if (!target || target.language !== 'css') return full;
    return `<style data-source="${resolved}">\n${target.content}\n</style>`;
  });

  const scriptRe = /<script\b([^>]*?)src=(["'])([^"']+)\2([^>]*)>\s*<\/script>/gi;
  const scriptMatches = [...html.matchAll(scriptRe)];
  for (const match of scriptMatches) {
    const full = match[0];
    const attrsBefore = match[1] || '';
    const src = match[3] || '';
    const attrsAfter = match[4] || '';

    if (isExternalOrSpecialPath(src)) continue;
    const resolved = resolveRelativePath(entryFile.path, src);
    const target = filesByPath.get(resolved);
    if (!target || !['javascript', 'typescript'].includes(target.language)) continue;

    const code = await toRunnableJavaScript(target);
    const isModule = /type\s*=\s*["']module["']/i.test(`${attrsBefore} ${attrsAfter}`);
    const inline = `<script${isModule ? ' type="module"' : ''} data-source="${resolved}">\n${code}\n</script>`;
    html = html.replace(full, inline);
  }

  openPreviewHtml(html);
  return `Opened project preview: ${entryFile.path}`;
}

async function runScriptProject(entryFile) {
  const files = getProjectFiles().filter((f) => ['javascript', 'typescript'].includes(f.language));
  if (files.length <= 1) return runCode(entryFile.language, entryFile.content);

  const ordered = [...files.filter((f) => f.id !== entryFile.id), entryFile];
  const parts = [];
  for (const f of ordered) {
    const compiled = await toRunnableJavaScript(f);
    parts.push(`// FILE: ${f.path}\n${compiled}`);
  }

  return captureConsole(() => Function(`"use strict";\n${parts.join('\n\n')}`)());
}

async function runSelectedContext(language, code) {
  const selected = selectedNodeId ? nodeById(selectedNodeId) : null;
  if (!selected || selected.type !== 'file') return runCode(language, code);

  const selectedFile = {
    id: selected.id,
    path: getNodePath(selected.id),
    language: selected.language || detectLanguageFromName(selected.name, language),
    content: selected.content || code
  };

  if (selectedFile.language === 'html') return runHtmlProject(selectedFile);
  if (['javascript', 'typescript'].includes(selectedFile.language)) return runScriptProject(selectedFile);
  return runCode(language, code);
}

function renderTreeFromTerminal(selectedId = null) {
  if (selectedId) selectedNodeId = selectedId;
  renderTree();
  queueProjectSave();
}

function treeLines(nodeId, depth = 0, out = []) {
  const node = nodeById(nodeId);
  if (!node) return out;
  const indent = '  '.repeat(depth);
  if (nodeId !== project.rootId) out.push(`${indent}${node.type === 'folder' ? '[D]' : '[F]'} ${node.name}`);
  if (node.type === 'folder') node.children.forEach((childId) => treeLines(childId, depth + (nodeId === project.rootId ? 0 : 1), out));
  return out;
}

async function executeTerminalCommand(commandLine) {
  const args = parseCommandArgs(commandLine);
  if (args.length === 0) return;
  const cmd = args[0].toLowerCase();

  switch (cmd) {
    case 'help':
      appendTerminalOutput('Commands: help, pwd, ls [path], tree [path], cd <path>, cat <file>, open <file>, mkdir <path>, touch <path>, rm <path>, run [file], files, lines, clear');
      return;
    case 'pwd':
      appendTerminalOutput(getNodeAbsolutePath(terminalCwdNodeId));
      return;
    case 'ls': {
      const target = resolvePathToNode(args[1] || '.');
      if (!target) return appendTerminalOutput('ls: path not found');
      if (target.type === 'file') return appendTerminalOutput(target.name);
      const names = sortChildren(target.children).map((id) => nodeById(id)).filter(Boolean).map((n) => `${n.type === 'folder' ? '[D]' : '[F]'} ${n.name}`);
      appendTerminalOutput(names.join('\n') || '(empty)');
      return;
    }
    case 'tree': {
      const target = resolvePathToNode(args[1] || '.');
      if (!target) return appendTerminalOutput('tree: path not found');
      appendTerminalOutput(treeLines(target.id).join('\n') || '(empty)');
      return;
    }
    case 'cd': {
      const target = resolvePathToNode(args[1] || '/');
      if (!target || target.type !== 'folder') return appendTerminalOutput('cd: folder not found');
      terminalCwdNodeId = target.id;
      updateTerminalPrompt();
      return;
    }
    case 'cat': {
      const target = resolvePathToNode(args[1] || '');
      if (!target || target.type !== 'file') return appendTerminalOutput('cat: file not found');
      appendTerminalOutput(target.content || '');
      return;
    }
    case 'open': {
      const target = resolvePathToNode(args[1] || '');
      if (!target || target.type !== 'file') return appendTerminalOutput('open: file not found');
      openFile(target.id);
      appendTerminalOutput(`opened ${getNodeAbsolutePath(target.id)}`);
      return;
    }
    case 'mkdir': {
      const parsed = splitParentAndName(args[1] || '');
      if (!parsed || !parsed.baseName) return appendTerminalOutput('mkdir: invalid path');
      const created = addFolderToParent(parsed.parentNode.id, parsed.baseName);
      renderTreeFromTerminal(created.id);
      appendTerminalOutput(`created folder ${getNodeAbsolutePath(created.id)}`);
      return;
    }
    case 'touch': {
      const parsed = splitParentAndName(args[1] || '');
      if (!parsed || !parsed.baseName) return appendTerminalOutput('touch: invalid path');
      const lang = detectLanguageFromName(parsed.baseName, 'plaintext');
      const created = addFileToParent(parsed.parentNode.id, parsed.baseName, lang, getTemplateForLanguage(lang));
      renderTreeFromTerminal(created.id);
      openFile(created.id);
      appendTerminalOutput(`created file ${getNodeAbsolutePath(created.id)}`);
      return;
    }
    case 'rm': {
      const target = resolvePathToNode(args[1] || '');
      if (!target || target.id === project.rootId) return appendTerminalOutput('rm: path not found');
      contextTargetNodeId = target.id;
      deleteNodeWithConfirm();
      appendTerminalOutput(`deleted ${target.name}`);
      return;
    }
    case 'run': {
      const target = args[1] ? resolvePathToNode(args[1]) : (selectedNodeId ? nodeById(selectedNodeId) : null);
      if (!target || target.type !== 'file') return appendTerminalOutput('run: file not found');
      if (setting('run.clearOutputBeforeRun')) setOutput('');
      openFile(target.id);
      const out = await runSelectedContext(target.language || detectLanguageFromName(target.name, 'plaintext'), target.content || '');
      appendTerminalOutput(out);
      setOutput(out);
      return;
    }
    case 'files':
      appendTerminalOutput(String(getProjectFiles().length));
      return;
    case 'lines': {
      const total = getProjectFiles().reduce((sum, file) => sum + countLines(file.content), 0);
      appendTerminalOutput(String(total));
      return;
    }
    case 'clear':
      terminalOutputEl.textContent = '';
      return;
    default:
      appendTerminalOutput(`Unknown command: ${cmd}`);
  }
}

function parseHtmlAssetRefs(html) {
  const refs = [];
  const regex = /<(?:script|link|img)\b[^>]*(?:src|href)=(["'])([^"']+)\1/gi;
  let match;
  while ((match = regex.exec(html)) !== null) refs.push(match[2]);
  return refs;
}

function countLines(text) {
  if (!text) return 0;
  return text.split(/\r?\n/).length;
}

async function debugCurrentProject() {
  const files = getProjectFiles();
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const selected = selectedNodeId ? nodeById(selectedNodeId) : null;
  const selectedFile = selected && selected.type === 'file'
    ? { id: selected.id, path: getNodePath(selected.id), language: selected.language || detectLanguageFromName(selected.name, 'plaintext'), content: selected.content || '' }
    : null;

  const lines = [];
  lines.push('Debug Report');
  lines.push('============');
  lines.push(`Timestamp: ${new Date().toLocaleString()}`);
  lines.push(`Project files: ${files.length}`);
  lines.push(`Project lines: ${files.reduce((sum, f) => sum + countLines(f.content), 0)}`);
  lines.push(`Active file: ${selectedFile ? selectedFile.path : '(none)'}`);
  lines.push('');

  if (setting('debug.includeInventory')) {
    lines.push('File Inventory');
    lines.push('--------------');
    for (const file of files) lines.push(`- ${file.path} [${file.language}] (${countLines(file.content)} lines)`);
    lines.push('');
  }

  if (setting('debug.includeReferenceCheck')) {
    lines.push('Reference Check');
    lines.push('---------------');
    const htmlFiles = files.filter((f) => f.language === 'html');
    if (htmlFiles.length === 0) lines.push('No HTML files found.');
    else {
      for (const file of htmlFiles) {
        const refs = parseHtmlAssetRefs(file.content);
        const missing = refs
          .filter((ref) => !isExternalOrSpecialPath(ref))
          .map((ref) => ({ ref, resolved: resolveRelativePath(file.path, ref) }))
          .filter(({ resolved }) => !filesByPath.has(resolved));

        if (missing.length === 0) lines.push(`[OK] ${file.path}: all local links resolved`);
        else {
          lines.push(`[WARN] ${file.path}: missing ${missing.length} local file(s)`);
          for (const item of missing) lines.push(`  - ${item.ref} -> ${item.resolved} (not found)`);
        }
      }
    }
    lines.push('');
  }

  lines.push('Active File Diagnostics');
  lines.push('-----------------------');
  if (!selectedFile) {
    lines.push('No active file selected.');
    return lines.join('\n');
  }

  const code = selectedFile.content;
  try {
    switch (selectedFile.language) {
      case 'javascript':
        Function(`"use strict";\n${code}`);
        lines.push('[OK] JavaScript syntax is valid.');
        break;
      case 'typescript': {
        await ensureTypeScriptLoaded();
        const result = window.ts.transpileModule(code, {
          compilerOptions: { target: window.ts.ScriptTarget.ES2020, module: window.ts.ModuleKind.None },
          reportDiagnostics: true
        });
        const diagnostics = result.diagnostics || [];
        if (diagnostics.length === 0) lines.push('[OK] TypeScript transpilation succeeded with no diagnostics.');
        else lines.push(`[WARN] TypeScript diagnostics: ${diagnostics.length}`);
        break;
      }
      case 'json':
        JSON.parse(code);
        lines.push('[OK] JSON is valid.');
        break;
      case 'yaml': {
        const yaml = await import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm');
        yaml.load(code);
        lines.push('[OK] YAML is valid.');
        break;
      }
      case 'xml': {
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'application/xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) throw new Error(parseError.textContent || 'Invalid XML');
        lines.push('[OK] XML is valid.');
        break;
      }
      case 'html':
        lines.push(`[OK] HTML parsed. Local refs found: ${parseHtmlAssetRefs(code).length}.`);
        break;
      default:
        lines.push(`[INFO] No parser available for "${selectedFile.language}" in browser debug mode.`);
    }
  } catch (err) {
    lines.push(`[ERROR] ${err.message || String(err)}`);
  }

  if ((selectedFile.language === 'javascript' || selectedFile.language === 'typescript') && setting('debug.includeRuntimeSmoke')) {
    lines.push('');
    lines.push('Runtime Smoke Test');
    lines.push('------------------');
    try {
      const runnable = selectedFile.language === 'typescript' ? await toRunnableJavaScript(selectedFile) : code;
      const runtimeOut = await captureConsole(() => Function(`"use strict";\n${runnable}`)());
      lines.push('[OK] Runtime executed.');
      lines.push(runtimeOut || '(No console output)');
    } catch (err) {
      lines.push(`[ERROR] Runtime failed: ${err.message || String(err)}`);
    }
  }

  const maxItems = Number(setting('debug.maxItems') || 200);
  const clipped = lines.slice(0, maxItems);
  if (lines.length > maxItems) clipped.push(`... truncated ${lines.length - maxItems} lines`);
  return clipped.join('\n');
}

function hexToMonacoColor(hex) {
  const value = hex.replace('#', '');
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;

  if (value.length === 3 || value.length === 4) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
    if (value.length === 4) a = parseInt(value[3] + value[3], 16) / 255;
  } else if (value.length === 6 || value.length === 8) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
    if (value.length === 8) a = parseInt(value.slice(6, 8), 16) / 255;
  } else return null;

  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
  return { red: r / 255, green: g / 255, blue: b / 255, alpha: Math.max(0, Math.min(1, a)) };
}

function monacoColorToHex(color) {
  const r = Math.round((color.red || 0) * 255);
  const g = Math.round((color.green || 0) * 255);
  const b = Math.round((color.blue || 0) * 255);
  const a = typeof color.alpha === 'number' ? Math.round(color.alpha * 255) : 255;
  const to2 = (n) => n.toString(16).padStart(2, '0');
  if (a < 255) return `#${to2(r)}${to2(g)}${to2(b)}${to2(a)}`;
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function registerColorProviders(monaco) {
  const ids = [...new Set(Object.values(languageToMonaco))];
  for (const id of ids) {
    monaco.languages.registerColorProvider(id, {
      provideDocumentColors(model) {
        const text = model.getValue();
        const infos = [];
        HEX_COLOR_REGEX.lastIndex = 0;
        let match;
        while ((match = HEX_COLOR_REGEX.exec(text)) !== null) {
          const raw = match[0];
          const parsed = hexToMonacoColor(raw);
          if (!parsed) continue;
          const start = model.getPositionAt(match.index);
          const end = model.getPositionAt(match.index + raw.length);
          infos.push({ color: parsed, range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column) });
        }
        return infos;
      },
      provideColorPresentations(_model, colorInfo) {
        const hex = monacoColorToHex(colorInfo.color);
        return [{ label: hex, textEdit: { range: colorInfo.range, text: hex } }];
      }
    });
  }
}

async function runViaPiston(language, code, filename) {
  if (setting('run.confirmBeforeRemote')) {
    const ok = window.confirm(`Run ${language} remotely?`);
    if (!ok) throw new Error('Remote execution cancelled.');
  }

  const payload = { language, version: '*', files: [{ name: filename, content: code }] };
  const res = await fetch(PISTON_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    if (language === 'rust' && res.status === 401) return runViaRustPlayground(code);
    throw new Error(`Remote compiler error (${res.status})`);
  }

  const data = await res.json();
  const compile = data.compile || {};
  const run = data.run || {};
  const output = [];
  if (compile.stdout) output.push(compile.stdout);
  if (compile.stderr) output.push(compile.stderr);
  if (run.stdout) output.push(run.stdout);
  if (run.stderr) output.push(run.stderr);
  const merged = output.join('').trim();
  if (merged) return merged;
  if (typeof run.code === 'number') return `(Process exited with code ${run.code})`;
  return '(No output)';
}

async function runViaJDoodle(language, versionIndex, code) {
  if (setting('run.confirmBeforeRemote')) {
    const ok = window.confirm(`Run ${language} remotely via JDoodle?`);
    if (!ok) throw new Error('Remote execution cancelled.');
  }

  const clientId = localStorage.getItem(JDOODLE_CLIENT_ID_KEY) || '';
  const clientSecret = localStorage.getItem(JDOODLE_CLIENT_SECRET_KEY) || '';
  if (!clientId || !clientSecret) throw new Error('JDoodle keys missing. Add Client ID and Client Secret in the sidebar.');

  const res = await fetch(JDOODLE_PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret, script: code, language, versionIndex })
  });

  if (!res.ok) {
    let message = `JDoodle request failed (${res.status})`;
    try {
      const errData = await res.json();
      if (errData?.error) message = errData.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = await res.json();
  const output = data.output || '';
  const memory = data.memory ? `\nMemory: ${data.memory}` : '';
  const cpuTime = data.cpuTime ? `\nCPU Time: ${data.cpuTime}` : '';
  const statusCode = typeof data.statusCode === 'number' ? `\nStatus: ${data.statusCode}` : '';
  const merged = `${output}${cpuTime}${memory}${statusCode}`.trim();
  return merged || '(No output)';
}

async function runViaRustPlayground(code) {
  if (setting('run.confirmBeforeRemote')) {
    const ok = window.confirm('Run Rust remotely?');
    if (!ok) throw new Error('Remote execution cancelled.');
  }

  const res = await fetch(RUST_PLAYGROUND_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel: 'stable', mode: 'debug', edition: '2021', crateType: 'bin', tests: false, code })
  });

  if (!res.ok) throw new Error(`Rust remote compiler error (${res.status})`);

  const data = await res.json();
  const stdout = data.stdout || '';
  const stderr = data.stderr || '';
  const out = `${stdout}${stderr}`.trim();
  return out || '(No output)';
}

function captureConsole(fn) {
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));

  return Promise.resolve()
    .then(fn)
    .then((result) => {
      console.log = originalLog;
      const suffix = result === undefined ? '' : String(result);
      return (logs.join('\n') + (suffix ? (logs.length ? '\n' : '') + suffix : '')).trim() || '(No output)';
    })
    .catch((err) => {
      console.log = originalLog;
      throw err;
    });
}

async function runCode(language, code) {
  const jdoodle = parseJdoodleLanguage(language);
  if (jdoodle) return runViaJDoodle(jdoodle.language, jdoodle.versionIndex, code);

  switch (language) {
    case 'javascript':
      return captureConsole(() => Function(`"use strict";\n${code}`)());
    case 'typescript': {
      await ensureTypeScriptLoaded();
      const transpiled = window.ts.transpile(code, {
        target: window.ts.ScriptTarget.ES2020,
        module: window.ts.ModuleKind.None
      });
      return captureConsole(() => Function(`"use strict";\n${transpiled}`)());
    }
    case 'python':
      return runPython(code);
    case 'html':
      openPreviewHtml(code);
      return 'Opened HTML preview.';
    case 'css': {
      const html = `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${code}</style><title>CSS Preview</title></head><body><div class="card"><h1>CSS Preview</h1><p>Edit your stylesheet and click Run Code again.</p><button>Sample Button</button></div></body></html>`;
      openPreviewHtml(html);
      return 'Opened CSS preview.';
    }
    case 'json':
      return `JSON valid.\n\n${JSON.stringify(JSON.parse(code), null, 2)}`;
    case 'markdown': {
      const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@13.0.2/+esm');
      const html = `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Markdown Preview</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;line-height:1.6;background:#0b1020;color:#e5e7eb}pre,code{background:#111827;padding:.2rem .35rem;border-radius:6px}h1,h2,h3{color:#22c55e}</style></head><body>${marked.parse(code)}</body></html>`;
      openPreviewHtml(html);
      return 'Opened Markdown preview.';
    }
    case 'yaml': {
      const yaml = await import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm');
      const parsed = yaml.load(code);
      return `YAML valid.\n\n${JSON.stringify(parsed, null, 2)}`;
    }
    case 'xml': {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'application/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) throw new Error(parseError.textContent || 'Invalid XML');
      return 'XML valid.';
    }
    case 'sql': {
      const { default: alasql } = await import('https://cdn.jsdelivr.net/npm/alasql@4.6.5/+esm');
      const statements = code.split(';').map((s) => s.trim()).filter(Boolean);
      if (statements.length === 0) return '(No SQL statements)';
      let lastResult = null;
      for (const stmt of statements) lastResult = alasql(stmt);
      if (Array.isArray(lastResult)) return lastResult.length ? JSON.stringify(lastResult, null, 2) : '(Query OK, no rows)';
      return `SQL executed.\nResult: ${String(lastResult)}`;
    }
    case 'lua':
      return runLua(code);
    case 'ruby':
      return runRuby(code);
    case 'c':
      return runViaPiston('c', code, 'main.c');
    case 'cpp':
      return runViaPiston('cpp', code, 'main.cpp');
    case 'rust':
      return runViaPiston('rust', code, 'main.rs');
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

loadSettings();
applySettings();
loadPanelVisibility();
populateJdoodleLanguages();
loadJdoodleCredentials();
loadOpenaiCredentials();
setSidebarView('explorer');
loadLessonsFromFile().finally(() => {
  refreshLessonLockState();
  selectLesson('lesson1');
  updateLessonTimerDisplay();
  startLessonTimerTicker();
});

swapSidebarViewButton?.addEventListener('click', () => {
  setSidebarView(sidebarView === 'explorer' ? 'lesson' : 'explorer');
});
lessonSelect1Button?.addEventListener('click', () => selectLesson('lesson1'));
lessonSelect2Button?.addEventListener('click', () => selectLesson('lesson2'));
lessonLoadButton?.addEventListener('click', loadLessonStarterIntoEditor);
lessonCheckButton?.addEventListener('click', checkLessonStepInEditor);
lessonHintButton?.addEventListener('click', requestLessonHintFromAI);
lessonContinueButton?.addEventListener('click', continueLessonStep);

settingsButton?.addEventListener('click', openSettings);
closeSettingsButton?.addEventListener('click', closeSettings);
settingsOverlay?.addEventListener('click', (event) => {
  if (event.target === settingsOverlay) closeSettings();
});
settingsSearchInput?.addEventListener('input', renderSettingsContent);
resetSettingsButton?.addEventListener('click', () => {
  if (!window.confirm('Reset all settings to defaults?')) return;
  settingsState = defaultSettings();
  saveSettings();
  applySettings();
  renderSettingsCategories();
  renderSettingsContent();
});

saveJdoodleButton.addEventListener('click', () => {
  try {
    saveJdoodleCredentials();
    setStatus('JDoodle keys saved');
  } catch (err) {
    setStatus('JDoodle keys missing');
    setOutput(err.message || String(err), true);
  }
});

saveOpenaiButton?.addEventListener('click', () => {
  try {
    saveOpenaiCredentials();
    setStatus('OpenAI key saved');
    lessonMessage.textContent = 'OpenAI settings saved in this browser.';
  } catch (err) {
    setStatus('OpenAI key missing');
    setOutput(err.message || String(err), true);
  }
});

panelTabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    setPanelVisibility(panel, !panelVisibility[panel]);
  });
});

closeOutputPanelButton.addEventListener('click', () => setPanelVisibility('output', false));
closeDebugPanelButton.addEventListener('click', () => setPanelVisibility('debug', false));
closeTerminalPanelButton.addEventListener('click', () => setPanelVisibility('terminal', false));

languageDropdownButton.addEventListener('click', () => {
  if (languageMenuOpen) closeLanguageMenu();
  else openLanguageMenu();
});

document.addEventListener('click', (event) => {
  if (languageMenuOpen && !languageDropdown.contains(event.target)) closeLanguageMenu();
  if (!explorerContextMenu.classList.contains('hidden') && !explorerContextMenu.contains(event.target)) closeExplorerMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLanguageMenu();
    closeExplorerMenu();
    if (settingsOpen) closeSettings();
  }
});

window.addEventListener('resize', closeExplorerMenu);
explorerTree.addEventListener('scroll', closeExplorerMenu);

window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' } });
window.require(['vs/editor/editor.main'], () => {
  registerColorProviders(window.monaco);
  setupSplitters();
  applyPanelVisibility();

  editor = window.monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    fixedOverflowWidgets: true,
    minimap: { enabled: true },
    fontSize: 14,
    colorDecorators: true
  });

  editor.updateOptions({
    inlineSuggest: { enabled: false },
    suggest: { preview: false, showInlineDetails: false, showIcons: false },
    suggestFontSize: 14,
    suggestLineHeight: 24,
    quickSuggestions: { other: true, comments: false, strings: false }
  });

  editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Space, () => editor.trigger('keyboard', 'editor.action.triggerSuggest', {}));
  applySettings();

  project = loadProject();
  selectedNodeId = project.selectedFileId || null;
  renderTree();

  if (project.selectedFileId && nodeById(project.selectedFileId)) openFile(project.selectedFileId);
  else {
    const firstFile = Object.values(project.nodes).find((n) => n.type === 'file');
    if (firstFile) openFile(firstFile.id);
  }

  terminalCwdNodeId = project.rootId;
  updateTerminalPrompt();
  terminalOutputEl.textContent = '';
  appendTerminalOutput('Browser Terminal ready. Type "help" for commands.');
  if (setting('terminal.autoFocusInput')) terminalInputEl.focus();
  setStatus('Ready');
});

languageSelect.addEventListener('change', () => {
  if (!editor || !editor.getModel()) return;

  const selectedLanguage = languageSelect.value;
  updateLanguageDropdownButtonText();
  renderLanguageDropdownMenu();

  if (isJdoodleLanguage(selectedLanguage)) {
    if (selectedNodeId) {
      const node = nodeById(selectedNodeId);
      if (node?.type === 'file') {
        node.language = selectedLanguage;
        queueProjectSave();
      }
    }
    return;
  }

  const model = editor.getModel();
  window.monaco.editor.setModelLanguage(model, languageToMonaco[selectedLanguage] || 'plaintext');

  if (selectedNodeId) {
    const node = nodeById(selectedNodeId);
    if (node?.type === 'file') {
      node.language = selectedLanguage;
      queueProjectSave();
    }
  }
});

newFolderButton.addEventListener('click', () => {
  contextTargetNodeId = selectedNodeId;
  promptNewFolder();
});

newTextButton.addEventListener('click', () => {
  contextTargetNodeId = selectedNodeId;
  promptNewTextFile();
});

newCodeButton.addEventListener('click', () => {
  contextTargetNodeId = selectedNodeId;
  promptNewCodeFile();
});

explorerTree.addEventListener('contextmenu', (event) => {
  const row = event.target.closest('.tree-row');
  if (row) return;
  event.preventDefault();
  openExplorerMenu(event.clientX, event.clientY, null);
});

function runExplorerMenuAction(actionId) {
  if (actionId === 'menuNewFolder') return promptNewFolder();
  if (actionId === 'menuNewText') return promptNewTextFile();
  if (actionId === 'menuNewCode') return promptNewCodeFile();
  if (actionId === 'menuDelete') return deleteNodeWithConfirm();
}

// Capture-phase delegation makes context menu actions reliable across browsers.
explorerContextMenu.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('button[id]');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  runExplorerMenuAction(button.id);
}, true);

// Keep click fallback in case pointer events are suppressed.
explorerContextMenu.addEventListener('click', (event) => {
  const button = event.target.closest('button[id]');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  runExplorerMenuAction(button.id);
});

terminalInputEl.addEventListener('keydown', async (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const command = terminalInputEl.value.trim();
  if (!command) return;

  appendTerminalOutput(`${terminalPromptEl.textContent} ${command}`);
  terminalInputEl.value = '';

  try {
    await executeTerminalCommand(command);
  } catch (err) {
    appendTerminalOutput(err.message || String(err));
  }
});

runButton.addEventListener('click', async () => {
  if (!editor) return;

  const language = languageSelect.value;
  const code = editor.getValue();
  if (setting('run.clearOutputBeforeRun')) setOutput('');

  runButton.disabled = true;
  setStatus(`Running ${language}...`);
  setOutput('Running...');

  try {
    const out = await runSelectedContext(language, code);
    setOutput(out);
    setStatus('Completed');
  } catch (err) {
    setOutput(err.message || String(err), true);
    setStatus('Failed');
  } finally {
    runButton.disabled = false;
  }
});

debugButton.addEventListener('click', async () => {
  if (!editor) return;

  debugButton.disabled = true;
  setStatus('Debugging project...');
  setDebugOutput('Running debug checks...');

  try {
    const report = await debugCurrentProject();
    setDebugOutput(report);
    setStatus('Debug complete');
  } catch (err) {
    setDebugOutput(err.message || String(err), true);
    setStatus('Debug failed');
  } finally {
    debugButton.disabled = false;
  }
});

clearButton.addEventListener('click', () => {
  setOutput('');
  setDebugOutput('Debug output will appear here.');
  terminalOutputEl.textContent = '';
  setStatus('Ready');
});
