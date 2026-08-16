# dsh-client-ui-obsidian-memory

> 🧠 Obsidian Memory sidebar panel for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness/)

A DSH client plugin that renders a file-tree browser inside the sidebar, connecting to a local preview server which exposes your Obsidian Codex vault over HTTP.

Inspired by [@Saccc_c](https://x.com/Saccc_c)'s Codex memory techniques.

![Obsidian Memory Panel](assets/screenshot-panel.png)

---

## What it does

- **Sidebar panel** — renders inside the `sidebar.obsidian-memory` slot in DSH's left column
- **Live vault tree** — fetches file tree from a local preview server (default port `3456`)
- **Click to browse** — expand folders, view markdown files
- **Fallback** — if the preview server is offline, shows a hard-coded skeleton of your vault structure

---

## Quick Start

### 1. Install the plugin

```bash
cd /path/to/deepseek-harness
npm install dsh-client-ui-obsidian-memory
# or
pnpm add dsh-client-ui-obsidian-memory
```

Add to your DSH `cordis.patch.yml` (or `cordis.yml`):

```yaml
- id: ui-obsidian-memory
  name: dsh-client-ui-obsidian-memory
```

> **Prerequisite:** `ui-sidebar` must declare the `sidebar.obsidian-memory` child slot. This is available in DSH ≥ 0.1.0-rc.5. If your DSH version does not include it yet, see the **Manual Patch** section below.

Then rebuild and restart:

```bash
npm run build:web
dsh web
```

### 2. Start the preview server

The preview server reads your local vault and exposes it via HTTP.

```bash
# If you have the server from this repo
cd dsh-obsidian-memory/mcp-server
npm install && npm run build
node dist/preview-server.js --vault /path/to/your/Obsidian/Codex
```

Default port is `3456`. The panel will auto-connect on page load.

---

## Architecture

```
┌─────────────────────────────┐
│ DSH Web (port 3080)         │
│  ┌───────────────────────┐  │
│  │ sidebar.obsidian-memory│  │
│  │  ┌─────────────────┐  │  │
│  │  │ 🧠 Obsidian     │  │  │
│  │  │    Memory Panel │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└──────────┬──────────────────┘
           │ fetch /api/tree
┌──────────▼──────────────────┐
│ Preview Server (port 3456)  │
│ (mcp-server in this repo)   │
└──────────┬──────────────────┘
           │ read FS
┌──────────▼──────────────────┐
│ Obsidian Vault / Codex/     │
└─────────────────────────────┘
```

| Component | Role |
|-----------|------|
| **DSH Plugin** (`dsh-client-ui-obsidian-memory`) | Browser side: sidebar panel, file tree rendering |
| **Preview Server** (`mcp-server/`) | Node side: reads local vault, serves `/api/tree` HTTP API |
| **Obsidian Vault** | Data source: Markdown files + folders |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Panel shows "Preview server offline (port 3456)" | Preview server not running | Start it: `node dist/preview-server.js --vault <path>` |
| Panel does not appear at all | Slot not registered | Verify `cordis.patch.yml` contains the `ui-obsidian-memory` row |
| File tree is empty | Wrong vault path or empty dir | Check `--vault` points to the `Codex/` folder |
| Clicking a file does nothing | `window.dshOpenFile` not injected | Known limitation — requires DSH workspace file-open API |

---

## Manual Patch (if DSH does not yet have the slot)

If your DSH version does not include the `sidebar.obsidian-memory` slot declaration in `ui-sidebar`, apply this patch:

**`packages/client/ui-sidebar/src/client/contract/slots.ts`**

Add to `SlotMap`:

```ts
'sidebar.obsidian-memory': { kind: 'single'; scope: 'root'; owner: ObsidianMemoryOwnerProps }
```

Add interface:

```ts
export interface ObsidianMemoryOwnerProps {
  wide: boolean
}
```

**`packages/client/ui-sidebar/src/client/SidebarRoot.tsx`**

After the `regionArea` div, insert:

```tsx
{wide && (
  <div className={css.regionArea} style={{ flex: '0 0 auto', maxHeight: '280px', overflow: 'auto' }}>
    {renderSlot('sidebar.obsidian-memory', { wide })}
  </div>
)}
```

Then rebuild `ui-sidebar` and `web`.

---

## Development

```bash
git clone https://github.com/detongz/dsh-client-ui-obsidian-memory.git
cd dsh-client-ui-obsidian-memory/plugin
npm install
npm run build        # outputs lib/client.js
npm run watch        # dev mode with auto-rebuild
```

Build artifacts:
- `lib/index.js` — host entry (noop, required by DSH)
- `lib/client.js` — browser bundle (DSH closure-factory format, CSS inlined)

---

## License

MIT
