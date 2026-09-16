# dsh-client-ui-obsidian-memory

> 🧠 Obsidian Memory for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness/) — persistent memory via local Markdown vault

A DSH plugin that gives your AI agent **persistent memory** backed by a local Obsidian (or plain Markdown) vault. It registers 5 file-system tools (`obsidian_memory_*`) and renders a sidebar panel showing vault status and tool reference.

Inspired by [@Saccc_c](https://x.com/Saccc_c)'s Codex memory techniques.

![Obsidian Memory Panel](assets/screenshot-panel.png)

---

## What it does

- **5 memory tools** — AI can read, list, search, write, and append to your local vault
- **Sidebar panel** — a vault directory browser, registered against the `sidebar.obsidian-memory` slot (⚠️ see [Known issues](#known-issues) — it does not render on current DSH)
- **No external server** — talks directly to the file system via DSH's host runtime
- **Codex-compatible** — works with the `Codex/` directory structure recommended by the community

### Available Tools

| Tool | Action |
|------|--------|
| `obsidian_memory_read` | Read a Markdown or text file |
| `obsidian_memory_list` | List files and directories |
| `obsidian_memory_search` | Full-text search across `.md` and `.txt` files |
| `obsidian_memory_write` | Write or overwrite a file |
| `obsidian_memory_append` | Append content to the end of a file |

---

## Quick Start

### 1. Prepare your vault

Create a `Codex/` folder anywhere on your machine (e.g. inside an Obsidian vault):

```
~/Documents/Obsidian Vault/
└── Codex/
    ├── AGENTS.md      ← AI operating instructions
    ├── TODO.md        ← pending tasks / open loops
    ├── people/
    ├── projects/
    ├── notes/
    └── daily/
```

### 2. Install the plugin

One command, from anywhere:

```bash
dsh plugin add dsh-client-ui-obsidian-memory        # npm release (recommended)
# or install straight from source:
dsh plugin add detongz/dsh-client-ui-obsidian-memory
```

> The plugin ships a `dsh.bundle` manifest, so `dsh plugin add` both installs
> the package **and** activates it as a profile layer (the bundled
> `cordis.patch.yml` inserts the `ui-obsidian-memory` entry). No manual
> `cordis.patch.yml` edit is needed to load the plugin.

### 3. Configure your vault path

Point the plugin at your `Codex/` folder. In your profile's `cordis.patch.yml`:

```yaml
- id: ui-obsidian-memory
  config:
    vaultPath: /Users/YOURNAME/Documents/Obsidian Vault/Codex
```

Replace `vaultPath` with the **absolute path** to your `Codex/` folder.
Alternatively set the environment variable `OBSIDIAN_VAULT_PATH`.

### 4. Restart DSH

```bash
dsh web   # or however you launch DSH
```

After restart:
- The **5 tools** are available to the AI when `vaultPath` is configured
- The sidebar panel does **not** currently appear — see [Known issues](#known-issues)

---

## Requirements & compatibility

| Requirement | Verified |
|---|---|
| Node.js | **≥ 22** (verified on 22.22.2). DSH itself does not start on Node 18 (`node:util` has no `parseEnv`) or Node 20 (silent exit), so no lower floor is claimed. |
| DSH | `0.1.1-rc.2`, `0.1.2-alpha.5`, `0.1.2-rc.1`, `0.1.5-alpha.1`, `0.1.5-alpha.2`, `0.1.5-rc.1`, `0.1.5-rc.2`, `0.1.6-alpha.1` — all verified 9/9 |
| DSH profile | `web` (only the web profile was exercised) |

The exact per-version verdict lives in `package.json` under
`dsh.compatibility.dshReleases`. Every `compatible` entry is backed by a real
install → start → uninstall run in a throwaway `DSH_HOME`; `0.1.3-alpha.1` and
`0.1.3-alpha.2` are declared `unknown` because they could not be tested (no
published artifact; a failing CLI install). See
[docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) for the full matrix, the evidence
method and the reproduction command.

### Permissions and risk

The plugin runs with the DSH host process's privileges and touches the file
system directly:

- **File access** — reads and writes inside the directory given by `vaultPath`.
  Paths are sandboxed: `..` traversal outside the vault is refused.
- **Network** — none. The plugin makes no outbound requests and bundles no
  server.
- **Commands / credentials** — none.
- **Lifecycle scripts** — `prepare` (runs `npm run build`). Declared explicitly;
  it only ever runs `rolldown` locally. The built `lib/` is committed, so a
  git-based install is self-contained.

Read access to a vault means the AI can read anything inside `vaultPath`. Point
it at a dedicated `Codex/` folder rather than a whole personal vault.

---

## Known issues

### The sidebar panel does not render

The client half registers its panel against the slot
`sidebar.obsidian-memory`. Official `@deepseek-ai/dsh-client-ui-sidebar` declares
only `sidebar.brand.mark`, `sidebar.brand.name`, `sidebar.panellist`,
`sidebar.workspaces`, `sidebar.settings` and `sidebar.footer.action` — the
`sidebar.obsidian-memory` slot is not among them, so the occupant is never
rendered on any DSH version tested here.

**The five `obsidian_memory_*` tools are unaffected** and work on every version
listed above. Re-targeting the panel at a slot the official shell does declare
(most likely the `sidebar.panellist` list) is tracked separately — it changes
panel behaviour, not compatibility.

### Build reproducibility (fixed in 0.4.0)

Before 0.4.0 the committed `lib/` depended on the absolute path of the checkout:
rolldown's `//#region` comment embedded the CSS virtual module id, lightningcss
mixed the `filename` into its `[hash]` CSS-module prefix, and its export order
was not stable. `npm run build` now produces byte-identical output from any
directory, so the committed bundle matches a rebuild at the same Commit.

---

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `vaultPath` | `string` | — | Absolute path to your Codex/ vault directory |

Environment variable fallback (optional):
```bash
export OBSIDIAN_VAULT_PATH=/Users/YOURNAME/Documents/Obsidian Vault/Codex
```

If neither `vaultPath` in config nor the env var is set, the plugin logs a warning and skips tool registration.

---

## Architecture

```
┌─────────────────────────────────────────┐
│ DSH Web (browser)                       │
│  ┌─────────────────────────────────┐    │
│  │ sidebar.obsidian-memory          │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │ 🧠 Obsidian Memory      │    │    │
│  │  │  — tool reference       │    │    │
│  │  │  — vault structure      │    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│ DSH Host (Node.js)                      │
│  • reads / writes local files           │
│  • registers 5 obsidian_memory_* tools  │
└─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│ Local File System                       │
│  ~/Documents/Obsidian Vault/Codex/      │
└─────────────────────────────────────────┘
```

| Component | Role |
|-----------|------|
| **Host** (`lib/index.js`) | Node side: registers tools, reads/writes vault files |
| **Client** (`lib/client.js`) | Browser side: sidebar panel with static tool reference |
| **Vault** | Data source: local Markdown files |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Plugin not in Settings → Plugins | `dsh plugin add` installed an older version (pre-0.3.2) as a plain dependency | Reinstall: `dsh plugin add dsh-client-ui-obsidian-memory@latest` |
| Tools not available to AI | `vaultPath` not configured | Set `vaultPath` in `cordis.patch.yml` or env var |
| Sidebar panel not visible | Official DSH does not declare the `sidebar.obsidian-memory` slot | Known issue — see [Known issues](#known-issues); the tools still work |
| "Path traversal detected" error | AI tried to access files outside vault | All paths are sandboxed to `vaultPath` |

---

## Development

```bash
git clone https://github.com/detongz/dsh-client-ui-obsidian-memory.git
cd dsh-client-ui-obsidian-memory
npm install
npm run build        # outputs lib/index.js + lib/client.js (byte-reproducible)
npm run watch        # dev mode with auto-rebuild
```

Build artifacts:
- `lib/index.js` — host entry (tool registration + file I/O)
- `lib/client.js` — browser bundle (DSH closure-factory format, CSS inlined)

### Compatibility harness

`scripts/verify-disposable-profile.mjs` runs the full install → start (host tools
+ client bundle) → uninstall lifecycle against a **throwaway `DSH_HOME`** and
prints a JSON evidence record. It never touches a real profile.

```bash
node scripts/verify-disposable-profile.mjs \
  --dsh /path/to/node_modules/@deepseek-ai/dsh/lib/bin.js \
  --version 0.1.5-rc.1 \
  --out evidence-0.1.5-rc.1.json
```

Optional flags: `--source <plugin dir>` (defaults to the cwd) and
`--pnpm <path>`. It exits non-zero unless all nine checks pass. Results feeding
`dsh.compatibility.dshReleases` are recorded in
[docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).

---

## License

MIT
