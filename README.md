# dsh-obsidian-memory

> 🧠 Obsidian Memory sidebar panel for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness/)

Turn your Obsidian vault into a persistent cross-project memory space for DSH (DeepSeek Harness). This plugin renders a file-tree browser inside the DSH sidebar, connecting to a lightweight preview server that exposes your Codex vault over HTTP.

Inspired by [@Saccc_c](https://x.com/Saccc_c)'s Codex memory techniques.

---

## What it does

- **Sidebar panel** — renders inside `sidebar.obsidian-memory` slot in DSH's left column
- **Live vault tree** — fetches file tree from your local preview server (default port `3456`)
- **Click to browse** — expand folders, view markdown files
- **Fallback** — if the preview server is offline, shows a hard-coded skeleton of your vault structure

---

## Architecture

```
┌─────────────────────────────────────┐
│          DSH Web (port 3080)        │
│  ┌─────────────────────────────┐    │
│  │  sidebar.obsidian-memory    │    │
│  │  ┌─────────────────────┐    │    │
│  │  │ 🧠 Obsidian Memory  │    │    │
│  │  │ ├── AGENTS.md       │    │    │
│  │  │ ├── TODO.md         │    │    │
│  │  │ ├── people/         │    │    │
│  │  │ └── projects/       │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
                  │
                  ▼ fetch /api/tree
┌─────────────────────────────────────┐
│    Preview Server (port 3456)       │
│    (from dsh-obsidian-memory/mcp)   │
└─────────────────────────────────────┘
                  │
                  ▼ read FS
┌─────────────────────────────────────┐
│  Obsidian Vault / Codex/            │
│  ├── AGENTS.md                      │
│  ├── TODO.md                        │
│  ├── people/                        │
│  └── projects/                      │
└─────────────────────────────────────┘
```

---

## Installation

### 1. Install the DSH plugin

```bash
npm install dsh-obsidian-memory
# or
pnpm add dsh-obsidian-memory
```

Add to your DSH `cordis.yml` (or `cordis.patch.yml`):

```yaml
- id: ui-obsidian-memory
  name: dsh-obsidian-memory
```

> **Note:** `ui-sidebar` must declare the `sidebar.obsidian-memory` slot (available in DSH ≥ 0.1.0-rc.5).

### 2. Run the preview server

The preview server is a separate component that serves your vault file tree over HTTP.

Clone the server:

```bash
git clone https://github.com/YOUR_USERNAME/dsh-obsidian-memory.git
cd dsh-obsidian-memory/mcp-server
npm install
npm run build
node dist/preview-server.js
```

Or run from your existing vault:

```bash
node /path/to/dsh-obsidian-memory/mcp-server/dist/preview-server.js \
  --vault /path/to/your/Obsidian/Codex
```

Default port is `3456`.

---

## Vault Structure

The plugin expects the following Codex vault structure:

```
Codex/
├── AGENTS.md          # Operating instructions for the AI
├── TODO.md            # Open loops / follow-ups
├── agent/
│   └── open-loops.md
├── notes/
├── people/
└── projects/
```

This mirrors the structure recommended by the Codex memory system.

---

## Development

```bash
git clone https://github.com/YOUR_USERNAME/dsh-obsidian-memory.git
cd dsh-obsidian-memory/plugin
npm install
npm run build
```

The build outputs:
- `lib/index.js` — host entry (noop)
- `lib/client.js` — browser bundle (DSH closure-factory format)
- `lib/types/` — TypeScript declarations

---

## License

MIT
