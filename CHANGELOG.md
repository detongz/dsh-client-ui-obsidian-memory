# Changelog

## 0.3.0 (2026-08-17)

### Breaking Changes
- **Removed external preview server dependency.** The sidebar panel is now a static info panel (tool reference + vault structure). File access is handled entirely by host-side tools.
- **Removed bundled `cordis.patch.yml`.** The plugin no longer declares `dsh.bundle.patch`. Users must add the plugin via `insert` in their own `cordis.patch.yml`.

### Fixes
- Fixed host plugin `name` to match cordis ID (`ui-obsidian-memory`)
- Fixed `obsidian_memory_append` tool registration to use inline literal (was a `const` variable, caused schema validation issues in some DSH versions)
- Added `required` arrays to all nested JSON Schema objects for stricter validation
- Unified log prefix to `[ui-obsidian-memory]`

### Docs
- Rewrote README (EN & ZH) with correct install steps: `npm install` into DSH profile + `insert` in `cordis.patch.yml`

## 0.2.5 (2026-08-17)

- Attempted hybrid host/client architecture
- Added 5 obsidian_memory_* tools

## 0.1.0 (2026-08-16)

- Initial release
- Sidebar panel rendering Obsidian Codex vault file tree
- Preview server integration (port 3456)
- Offline fallback with hard-coded skeleton
- Chinese and English README
