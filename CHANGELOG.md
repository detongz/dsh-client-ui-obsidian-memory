# Changelog

## 0.4.2 (2026-09-17)

### Fixed

- **Panel no longer crashes on mount in the web profile.** It previously called
  `uiWorkspace.listDirectory()` with no path on mount, which surfaces DSH's
  `directoryPicker.list needs the browse capability; the composed picker serves
  "native"` error. The panel now only lists once a vault path is known, shows the
  "Select Vault" prompt otherwise, and reports the browse-capability limitation
  in plain copy instead of a raw error. `pickDirectory` failures are caught and
  explained the same way.

### Notes

- The browser-side vault view is gated by DSH's `directoryPicker` `browse`
  capability, which the **web profile** does not provide (it only serves
  `native`). The host half reads/writes the vault directly via Node `fs`, so the
  `obsidian_memory_*` tools work everywhere; only the in-browser tree is gated.
  On a native / desktop DSH the panel shows the vault tree as intended. A
  host→client typert Remote would lift the web-profile limit but needs the
  `dsh-typert-generator` codegen tooling and would add a runtime dependency, so
  it is intentionally not wired to protect the STORE compatibility restored in
  0.4.0.

## 0.4.1 (2026-09-17)

### Changed

- **The sidebar panel now actually renders.** The client half previously
  registered against a `sidebar.obsidian-memory` slot that the official
  `dsh-client-ui-sidebar` never declared, so the panel never mounted. It now
  registers a global panel icon in the `sidebar.panellist` slot
  (`id: "obsidian-memory"`, `order: 50`, label "Obsidian Memory") and the vault
  browser in the layout's `main` slot under the same key. Clicking the sidebar
  icon calls `ctx.layout.selectPanel("obsidian-memory")` and opens the panel in
  the central column.

### Compatibility

- On DSH versions released before the `sidebar.panellist` list slot and the
  keyed `main` slot existed, both `ctx.slots.inject` calls are inert: the plugin
  still loads, the five `obsidian_memory_*` tools still work, and only the
  sidebar icon is absent. No crash, no install failure.
- Verified on `0.1.6-alpha.1` (9/9 via `scripts/verify-disposable-profile.mjs`);
  the `dsh.compatibility.dshReleases` matrix from 0.4.0 is unchanged.

## 0.4.0 (2026-09-16)

### Added

- **`dsh.compatibility.dshReleases` matrix.** Per-version compatibility is now
  declared explicitly in `package.json` using exact full SemVer keys and the
  values `compatible` / `incompatible` / `unknown`. Eight DSH releases are
  declared `compatible` (`0.1.1-rc.2`, `0.1.2-alpha.5`, `0.1.2-rc.1`,
  `0.1.5-alpha.1`, `0.1.5-alpha.2`, `0.1.5-rc.1`, `0.1.5-rc.2`,
  `0.1.6-alpha.1`); `0.1.3-alpha.1` and `0.1.3-alpha.2` are declared `unknown`
  because they could not be tested (no published artifact; a failing CLI
  install). A range-only claim is not installable evidence, so nothing is
  inferred from the peer ranges.
- **`engines.node: ">=22"`**, the runtime exercised end to end. DSH itself does
  not start on Node 18 (`node:util` has no `parseEnv`) or Node 20 (silent
  exit), so no lower floor is claimed.
- **`scripts/verify-disposable-profile.mjs`** — a disposable-`DSH_HOME`
  acceptance harness that runs install → start → uninstall and asserts nine
  checks: scaffold, install, start, host tool registration, host tool
  execution, vault sandbox, client boot graph, client bundle, and uninstall. It
  never touches a real profile. Exposed as `npm run verify:compat`.
- **`docs/COMPATIBILITY.md`** — the evidence record: the verified matrix, what
  each check asserts, the two version-dependent behaviours the harness absorbs,
  the Node evidence, and the explicit limits of the claims.
- README (EN + ZH) now document requirements, the verified DSH range, the
  permissions and risk surface (file access, no network, `prepare` lifecycle
  script), and the reproduction command.

### Fixed

- **The build is now byte-reproducible.** `lib/` previously depended on the
  absolute path of the checkout, so the committed bundle could not be
  reproduced from a different directory:
  - rolldown's `//#region` comment embedded the CSS virtual module id
    (`\0dsh-css:/Users/…/ObsidianMemoryPanel.module.css.mjs`);
  - lightningcss mixed `filename` into its `[hash]` CSS-module prefix, so class
    names changed with the path (`K_0wZG_panel` → `_1vBFta_panel` → …);
  - its export order was not stable, which reordered the emitted class map.

  The virtual id and the lightningcss `filename` are now project-root-relative,
  and CSS-module exports are sorted. Verified identical sha256 across three
  consecutive builds and two additional checkout paths.
- **Corrected the README's sidebar claim.** The panel registers against
  `sidebar.obsidian-memory`, which official `dsh-client-ui-sidebar` does not
  declare — only `sidebar.brand.mark`, `sidebar.brand.name`,
  `sidebar.panellist`, `sidebar.workspaces`, `sidebar.settings` and
  `sidebar.footer.action`. The panel therefore does not render on any tested
  version. Previously both READMEs stated it appears; they now disclose it as a
  known issue and note the five tools are unaffected. Re-targeting the panel is
  tracked separately as a panel-behaviour change (shipped in 0.4.1).

## 0.3.2 (2026-08-17)

### Fixed
- **Restored `dsh.bundle` manifest + bundled `cordis.patch.yml`** — the plugin is
  installable again via `dsh plugin add` (regressed in 0.3.0, which removed the
  bundle patch; `dsh plugin add` then installed the package as a plain
  dependency and never activated it).
- **Fixed client loader id.** The client bundle stamped
  `@deepseek-ai/dsh-client-ui-obsidian-memory` into `__ModuleLoader__.load`,
  but the package name is `dsh-client-ui-obsidian-memory`; the DSH client
  module loader keys factories by the loader entry's name, so a standalone
  install failed to register the bundle ("bundle … loaded without
  registering"). The build now derives the id from `package.json`'s `name`.
- **Peer ranges corrected** to the harness's actual `0.1.0-rc.x` line
  (`>=0.1.0-rc.5`), with an explicit prerelease branch per the awesome-list
  peer-range guidance.
- **Repo hygiene**: un-tracked `node_modules/` (was committed), committed the
  built `lib/` artifacts so git-based installs are self-contained, added a
  `prepare` script.

### Docs
- Install instructions now use `dsh plugin add` (one-command install).

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
