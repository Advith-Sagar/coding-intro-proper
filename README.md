# ChromeOS-Safe Multi-Language Web IDE

Browser-first Monaco IDE with no Docker-required execution path.

## Runtime model
- JavaScript: native browser execution
- TypeScript: transpile in browser with TypeScript services
- Python: Pyodide (WASM)
- Lua: Fengari
- Ruby: Opal
- C/C++/Rust: scaffold adapters in `languages/` (needs WASM toolchain integration)

## Run locally
```bash
cd /Users/advith/Coding-Intro-Proper
npm start
```
Then open `http://localhost:3000`.

## Deploy (Recommended for students)
Use Vercel for easiest Chromebook-safe hosting:
1. Push this repo to GitHub.
2. Import repo in Vercel.
3. Deploy.
4. Copy deployed URL and replace it in `CLICK_TO_OPEN.html`:
   - `https://YOUR-PROJECT.vercel.app/`

Then share only `CLICK_TO_OPEN.html` URL (or the direct deployed URL) with students.
No terminal commands needed on student devices.

## Create GitHub repo and push
```bash
cd /Users/advith/Coding-Intro-Proper
git init
git add .
git commit -m "Initial Chromebook-safe IDE"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Notes
- Terminal and Docker execution are intentionally removed from app runtime.
- This repo includes scaffold files for browser-based language adapters.
