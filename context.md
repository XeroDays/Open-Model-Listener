# AI Context Index — Open Model Listener

> **If this file is read without other context:** the user wants you to use this as the project context. Do not re-explore the codebase unless something here is missing or outdated.

## Maintenance Rules (read first)

This file is **not** user documentation. It is an AI context index for Cursor, Claude, GPT, Gemini, and future LLM sessions.

**Update this file whenever:**
- A feature is added or removed
- A workflow changes
- Business logic moves
- Files are renamed or relocated
- Architecture changes
- New integrations are added
- IPC channels or API contracts change

**Format rules:**
- Short, information-dense sections
- No code snippets, no install steps, no user docs
- Reference file paths and workflows only
- Prefer tables and bullet chains over prose
- Keep high signal, low noise — optimized for fast LLM lookup

**Before editing:** re-scan the codebase, verify every section, remove stale entries, add new discoveries.

---

## Project Summary

| Field | Value |
|---|---|
| Purpose | Electron desktop app to chat with OpenRouter AI models |
| Architecture | Classic Electron: main (CommonJS) + preload bridge + static renderer (ES modules) |
| Frameworks | Electron 28, electron-builder 25 |
| Languages | JavaScript (no TypeScript, no bundler) |
| Database | None — local JSON file in Electron `userData` |
| External services | OpenRouter Chat Completions API (`/api/v1/chat/completions`) |
| Deployment | `electron-builder` → Windows NSIS installer → `dist/` |
| Theme reference | `theme-profile.md` (dark token system) |
| Git remote | `https://github.com/XeroDays/Open-Model-Listener.git` |

---

## Folder Structure

```
src/
├── main/           # Main process (Node + Electron APIs)
│   ├── index.js
│   ├── ipc/register.js
│   ├── middlewares/    # Domain handlers (not HTTP middleware)
│   ├── services/       # Config persistence, OpenRouter API
│   ├── windows/        # BrowserWindow factory
│   └── helpers/        # (empty — reserved)
├── preload/index.js    # contextBridge → window.electronAPI
├── shared/ipc/channels.js  # IPC channel name constants
└── renderer/           # Static HTML/CSS/JS UI
    ├── index.html      # Config form (home)
    ├── screens/chat/   # Chat screen
    ├── scripts/        # app.js, chat.js
    ├── styles/         # tokens.css, app.css
    └── assets/icons/   # (empty — reserved)
scripts/start-electron.js
theme-profile.md
.vscode/launch.json
```

---

## Architecture Rules

- **No bundler** — renderer loaded via `BrowserWindow.loadFile()`, no Vite/Webpack.
- **Renderer isolation** — `contextIsolation: true`, `nodeIntegration: false`. Renderer talks to main only via `window.electronAPI`.
- **IPC contract** — channel names defined once in `src/shared/ipc/channels.js` (prefix `oml:`).
- **Middleware = domain handlers** — files in `src/main/middlewares/` bridge IPC to services; not Express-style HTTP middleware.
- **Services own logic** — config persistence (`config-service`), API calls (`ai-service`). Middlewares do not call `fetch` directly.
- **Multi-screen navigation** — separate HTML files + `window.location.href`, not a client-side router.
- **Theme tokens** — all UI colors/spacing from `theme-profile.md` → `tokens.css` → `var(--token)`. No hardcoded hex in components.
- **Config storage** — `user-config.json` in `app.getPath("userData")`, not project root.
- **Chat context** — renderer holds full `messages[]` array; every request sends entire history for multi-turn context.
- **Streaming** — main → renderer via `sender.send` (one-way push), not `ipcMain.handle` return values.
- **OpenRouter reasoning** — only one of `reasoning.effort` OR `reasoning.max_tokens` per request (mutually exclusive).
- **Thinking display** — reasoning tokens streamed separately via `oml:chat-reasoning-delta`; shown in collapsible panel in chat UI; display-only (not stored in `messages[]`).

---

## Feature Registry

### App Bootstrap

Purpose: Start Electron, register IPC, open main window.

Entry Points:
- `package.json` → `src/main/index.js`
- `scripts/start-electron.js`

Primary Files:
- `src/main/index.js`
- `src/main/windows/main-window.js`
- `src/main/ipc/register.js`

Workflow:
App Start → `index.js` → `registerIpcHandlers()` → `createMainWindow()` → load `renderer/index.html`

---

### Configuration Form (Home Screen)

Purpose: Collect and persist OpenRouter API key, model name, reasoning level.

Entry Points:
- `src/renderer/index.html`
- `src/renderer/scripts/app.js`

Primary Files:
- `src/renderer/index.html`
- `src/renderer/scripts/app.js`
- `src/main/middlewares/config-middleware.js`
- `src/main/services/config-service.js`

Related Files:
- `src/renderer/styles/app.css`
- `src/preload/index.js` (`saveConfig`, `getConfig`)

Dependencies:
- IPC: `oml:save-config`, `oml:get-config`
- Config keys: `apiKey`, `model`, `reasoning`

Workflow:
Config Form → `saveConfig` IPC → `config-middleware` → `config-service.set()` → `user-config.json` → navigate to `screens/chat/index.html`

Defaults:
- Model: `openai/gpt-oss-120b:free`
- Reasoning: `None`

---

### Chat with AI Model

Purpose: Multi-turn streaming conversation with configured OpenRouter model.

Entry Points:
- `src/renderer/screens/chat/index.html`
- `src/renderer/scripts/chat.js`

Primary Files:
- `src/renderer/scripts/chat.js`
- `src/main/middlewares/chat-middleware.js`
- `src/main/services/ai-service.js`

Related Files:
- `src/renderer/screens/chat/styles/chat.css`
- `src/preload/index.js` (`chatSend`, `onChatDelta`, `onChatReasoningDelta`, `onChatDone`, `onChatError`)

Dependencies:
- Config service (apiKey, model, reasoning)
- OpenRouter streaming API
- IPC: `oml:chat-send`, `oml:chat-delta`, `oml:chat-reasoning-delta`, `oml:chat-done`, `oml:chat-error`

Workflow:
User types message → push to `messages[]` → `chatSend` IPC → `chat-middleware` → load config → `ai-service.streamChat()` → reasoning SSE → collapsible thinking panel → content SSE → AI response bubble → on done, store assistant `content` only in `messages[]`

Send shortcut: Ctrl+Enter

Thinking panel: toggle expand/collapse; auto-collapses when response content starts; label shows char count

---

### Collapsible Thinking Panel

Purpose: Show model reasoning during/after generation in a collapsible dropdown above each AI reply.

Entry Points:
- `src/renderer/scripts/chat.js` → `createAiMessageBlock()`

Primary Files:
- `src/renderer/scripts/chat.js`
- `src/renderer/screens/chat/styles/chat.css`
- `src/main/services/ai-service.js` (parses `delta.reasoning`, `delta.reasoning_content`, `delta.reasoning_details`)

Related Files:
- `src/main/middlewares/chat-middleware.js`
- `src/preload/index.js` (`onChatReasoningDelta`)

Dependencies:
- IPC: `oml:chat-reasoning-delta`
- Reasoning level must be non-None for reasoning-capable models

Workflow:
Reasoning SSE → `onReasoningDelta` → `CHAT_REASONING_DELTA` → append to thinking panel → user toggles open/close → content SSE → auto-collapse panel → final response in `.msg-ai`

---

### Dark Theme System

Purpose: Consistent dark UI tokens for all screens.

Entry Points:
- `theme-profile.md` (AI/human reference)
- `src/renderer/styles/tokens.css` (CSS variables)

Primary Files:
- `theme-profile.md`
- `src/renderer/styles/tokens.css`

Related Files:
- `src/renderer/styles/app.css`
- `src/renderer/screens/chat/styles/chat.css`

---

## Workflow Registry

### Save Configuration

Trigger: User submits config form on home screen.

Flow:
`app.js` form submit → `electronAPI.saveConfig({ apiKey, model, reasoning })` → `ipc/register.js` → `config-middleware.SaveConfig` → `config-service.set()` × 3 → write `user-config.json` → redirect to chat screen

Files:
- `src/renderer/scripts/app.js`
- `src/main/ipc/register.js`
- `src/main/middlewares/config-middleware.js`
- `src/main/services/config-service.js`

---

### Load Saved Configuration

Trigger: Home screen `DOMContentLoaded`.

Flow:
`app.js` → `electronAPI.getConfig(key)` × 3 → `config-middleware.GetConfig` → `config-service.get()` → pre-fill form fields

Files:
- `src/renderer/scripts/app.js`
- `src/main/middlewares/config-middleware.js`
- `src/main/services/config-service.js`

---

### Send Chat Message (Streaming)

Trigger: User clicks Send or Ctrl+Enter on chat screen.

Flow:
`chat.js` → append user bubble + push to `messages[]` → `electronAPI.chatSend({ messages })` → `chat-middleware.SendMessage` → read config → `buildReasoningOptions()` → `ai-service.streamChat()` → OpenRouter SSE → `CHAT_REASONING_DELTA` (thinking panel) + `CHAT_DELTA` (response) → `CHAT_DONE` → store assistant `content` in `messages[]` (reasoning not persisted)

Files:
- `src/renderer/scripts/chat.js`
- `src/main/middlewares/chat-middleware.js`
- `src/main/services/ai-service.js`
- `src/main/services/config-service.js`

---

### Chat Error Handling

Trigger: OpenRouter HTTP error, stream error, or missing config.

Flow:
`ai-service` logs `[ai-service]` error → `onError` callback → `chat-middleware` logs `[chat-middleware]` error → `sender.send(CHAT_ERROR)` → renderer shows error bubble, removes incomplete AI block (thinking panel + response)

Files:
- `src/main/services/ai-service.js`
- `src/main/middlewares/chat-middleware.js`
- `src/renderer/scripts/chat.js`

---

## File Responsibility Map

| Responsibility | File |
|---|---|
| App bootstrap | `src/main/index.js` |
| Window creation | `src/main/windows/main-window.js` |
| IPC handler registration | `src/main/ipc/register.js` |
| IPC channel constants | `src/shared/ipc/channels.js` |
| Preload bridge (renderer API) | `src/preload/index.js` |
| Config save/load (middleware) | `src/main/middlewares/config-middleware.js` |
| Chat send (middleware) | `src/main/middlewares/chat-middleware.js` |
| Reasoning level mapping | `src/main/middlewares/chat-middleware.js` → `buildReasoningOptions()` |
| Config persistence (key/value JSON) | `src/main/services/config-service.js` |
| OpenRouter streaming API | `src/main/services/ai-service.js` |
| Reasoning delta parsing | `src/main/services/ai-service.js` → `extractReasoningDeltas()` |
| Thinking panel UI | `src/renderer/scripts/chat.js`, `src/renderer/screens/chat/styles/chat.css` |
| Health check placeholder | `src/main/middlewares/app-middleware.js` |
| Home screen UI + form logic | `src/renderer/index.html`, `src/renderer/scripts/app.js` |
| Chat screen UI + message logic | `src/renderer/screens/chat/index.html`, `src/renderer/scripts/chat.js` |
| Global styles + form styles | `src/renderer/styles/app.css` |
| Chat-specific styles | `src/renderer/screens/chat/styles/chat.css` |
| Markdown + LaTeX rendering | `src/renderer/scripts/rich-render.js`, `src/renderer/vendor/marked.esm.js`, `src/renderer/vendor/katex/` |
| CSS design tokens | `src/renderer/styles/tokens.css` |
| Theme token reference (AI) | `theme-profile.md` |
| Dev launcher | `scripts/start-electron.js` |
| Debug config (Play button) | `.vscode/launch.json` |
| Windows build config | `package.json` → `build` block |

---

## Data Flow Map

### Config Flow
```
Renderer (app.js)
  → preload (saveConfig / getConfig)
  → ipcMain.handle
  → config-middleware
  → config-service
  → user-config.json (Electron userData)
```

### Chat Flow (request)
```
Renderer (chat.js) — holds messages[]
  → preload (chatSend)
  → ipcMain.handle (CHAT_SEND)
  → chat-middleware.SendMessage
  → config-service.get(apiKey, model, reasoning)
  → ai-service.streamChat
  → fetch OpenRouter API
```

### Chat Flow (streaming response)
```
OpenRouter SSE
  → ai-service (parse data: lines — content + reasoning)
  → chat-middleware (safeSend)
  → sender.send(CHAT_REASONING_DELTA | CHAT_DELTA | CHAT_DONE | CHAT_ERROR)
  → preload subscribe
  → chat.js (thinking panel / response bubble / error)
```

---

## Integration Registry

### OpenRouter

| Field | Value |
|---|---|
| Purpose | AI chat completions (streaming) |
| Endpoint | `https://openrouter.ai/api/v1/chat/completions` |
| Auth | Bearer token from user config (`apiKey`) |
| Files | `src/main/services/ai-service.js`, `src/main/middlewares/chat-middleware.js` |
| Entry point | `ai-service.streamChat()` |
| Headers | `Authorization`, `HTTP-Referer`, `X-Title` |
| Streaming | SSE `data:` lines, `[DONE]` terminator |
| Reasoning request | Optional `reasoning` object — effort OR max_tokens, never both |
| Reasoning response | `delta.reasoning`, `delta.reasoning_content`, or `delta.reasoning_details[].text` |

Reasoning level mapping (`chat-middleware.buildReasoningOptions`):

| UI Label | API payload |
|---|---|
| None | `{ effort: "none", exclude: true }` |
| Low | `{ effort: "low" }` |
| Medium | `{ effort: "medium" }` |
| High | `{ effort: "high" }` |
| Ultra High | `{ max_tokens: 16000 }` |

---

## IPC Channel Registry

| Channel | Direction | Purpose |
|---|---|---|
| `oml:ping` | invoke → return | Health check |
| `oml:save-config` | invoke → return | Save apiKey, model, reasoning |
| `oml:get-config` | invoke → return | Read config by key |
| `oml:chat-send` | invoke → return | Start streaming chat |
| `oml:chat-delta` | main → renderer push | Stream response content delta |
| `oml:chat-reasoning-delta` | main → renderer push | Stream reasoning/thinking delta |
| `oml:chat-done` | main → renderer push | Stream complete |
| `oml:chat-error` | main → renderer push | Error message |

---

## Dependency Impact Map

### config-service.js
Changing may impact: config form save/load, chat API key/model/reasoning retrieval

### config-middleware.js
Changing may impact: home screen form, IPC save/get handlers

### ai-service.js
Changing may impact: all chat streaming, error logging, OpenRouter request format

### chat-middleware.js
Changing may impact: reasoning level mapping, chat error forwarding, stream push to renderer

### channels.js
Changing may impact: preload, register.js, chat-middleware — all IPC wiring must stay in sync

### preload/index.js
Changing may impact: all renderer scripts (`app.js`, `chat.js`)

### tokens.css / theme-profile.md
Changing may impact: all UI screens and future components

---

## Known Conventions

- **Naming:** IPC channels prefixed `oml:`; middleware files suffixed `-middleware.js`; services suffixed `-service.js`
- **Module system:** CommonJS in main/preload; ES modules (`type="module"`) in renderer scripts
- **Screen pattern:** `screens/<name>/index.html` + `../../scripts/<name>.js` + local `styles/<name>.css`
- **Empty reserved dirs:** `src/main/helpers/`, `src/renderer/screens/` (placeholder), `src/renderer/assets/icons/`, `build/`
- **Logging:** `[service-name]` or `[middleware-name]` prefix in `console.error` for API failures
- **CSP:** `default-src 'self'; script-src 'self'; style-src 'self'` on all HTML pages
- **No tests** currently in project
- **No .env** — API key stored via config form, not environment variables
- **Rich chat rendering** — `rich-render.js` uses vendored `marked` (Markdown) + KaTeX (math); renders after stream completes; supports headings, lists, fenced code blocks, inline code, LaTeX

---

## Config Keys (user-config.json)

| Key | Type | Example |
|---|---|---|
| `apiKey` | string | OpenRouter API key |
| `model` | string | `openai/gpt-oss-120b:free` |
| `reasoning` | string | `None`, `Low`, `Medium`, `High`, `Ultra High` |

Storage path: `app.getPath("userData")/user-config.json`

---

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Dev launch via `scripts/start-electron.js` |
| `npm run build` | electron-builder (all platforms) |
| `npm run build:win` | Windows NSIS installer |

Debug: VS Code/Cursor Play button → `.vscode/launch.json` → "Debug Main Process"
