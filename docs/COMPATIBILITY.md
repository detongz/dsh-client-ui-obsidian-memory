# DSH compatibility evidence

This document records *how* each entry under `dsh.compatibility.dshReleases` in
`package.json` was produced. Every `compatible` claim below comes from a real
install → start → uninstall run in a **disposable `DSH_HOME`**; nothing is
inferred from a version range.

## How the declaration works

DSH STORE reads `dsh.compatibility.dshReleases` out of the manifest at a fixed
Commit:

```json
"dsh": {
  "compatibility": {
    "dshReleases": {
      "0.1.5-rc.1": "compatible"
    }
  }
}
```

- Keys are **exact full SemVer DSH versions** (never ranges, never the `rc.7` /
  `rc.8` legacy aliases).
- Values are exactly one of `compatible`, `incompatible`, `unknown`.
- A version that is absent from the map is treated as `unknown`.
- The store unlists an entry when **none** of its rolling latest-three window is
  an exact `compatible` record, so the map is kept current for the window that
  exists at release time.

## Verified matrix

Harness: `scripts/verify-disposable-profile.mjs`, Node **22.22.2**, pnpm
**9.2.0**, macOS arm64. Each run asserts 9 checks: `scaffold`, `install`,
`start`, `host-tools`, `host-execute`, `sandbox`, `client-graph`,
`client-bundle`, `uninstall`.

| DSH version | Result | Web auth | Client half served via |
|---|---|---|---|
| `0.1.1-rc.2` | 9/9 pass | none | `/plugins/<id>/client.js` (13 430 B) |
| `0.1.2-alpha.5` | 9/9 pass | launch token | combined `/plugins/??` (46 halves) |
| `0.1.2-rc.1` | 9/9 pass | launch token | combined `/plugins/??` (46 halves) |
| `0.1.5-alpha.1` | 9/9 pass | launch token | combined `/plugins/??` (53 halves) |
| `0.1.5-alpha.2` | 9/9 pass | launch token | combined `/plugins/??` (53 halves) |
| `0.1.5-rc.1` | 9/9 pass | launch token | combined `/plugins/??` (53 halves) |
| `0.1.5-rc.2` | 9/9 pass | launch token | combined `/plugins/??` (53 halves) |
| `0.1.6-alpha.1` | 9/9 pass | launch token | combined `/plugins/??` (56 halves) |

What "9/9 pass" means concretely, per version:

- `install` — `dsh plugin add` wrote the package into the profile, appended it to
  `dsh.profile.bundles`, and `dsh --dump-config` composed the `ui-obsidian-memory`
  entry from the bundled `cordis.patch.yml`.
- `start` — the web profile served the index route.
- `host-tools` / `host-execute` — a probe plugin mounted with `--patch` read the
  live tool registry and called all five tools; `read`, `list`, `search`, `write`
  and `append` all returned canonical values.
- `sandbox` — `obsidian_memory_read` on `../../../../etc/hosts` was refused with
  `Path traversal detected`.
- `client-graph` — the plugin id appears in `window.__DSH_BOOT__`.
- `client-bundle` — the served JavaScript contains this plugin's
  `__ModuleLoader__.load({ id: "dsh-client-ui-obsidian-memory", … })`
  registration.
- `uninstall` — package, `dsh.profile.bundles` entry, `node_modules`, and the
  composed host entry all reverted.

### Two version-dependent behaviours the harness had to absorb

Both were discovered by running the harness, not assumed:

1. **Web launch token.** From `0.1.2-*` onward `dsh web` gates the web surface
   behind a launch token. `GET /?token=<token>` answers `303` with a
   `Set-Cookie`; later requests carry that cookie. Node's `fetch` has no cookie
   jar and follows the redirect into a `401`, so the harness performs the
   handshake explicitly. `0.1.1-rc.2` needs none of this.
2. **Client bundle route.** `0.1.1-rc.2` serves one file per plugin at
   `/plugins/<id>/client.js`. `0.1.2+` concatenates every plugin's client half
   behind a single `/plugins/??a/client.js,b/client.js&rev=<hash>` request and no
   longer answers the per-plugin route, so the harness reads the URL back out of
   the served index instead of hard-coding it.

## Declared as `unknown`

| DSH version | Reason |
|---|---|
| `0.1.3-alpha.1` | No artifact for this version exists on the official npm registry (`npm view @deepseek-ai/dsh@0.1.3-alpha.1` fails; only `0.1.3-alpha.2` was published). It cannot be installed, so no honest verdict is possible. |
| `0.1.3-alpha.2` | Its own CLI failed to install in the verification environment (a native `node-gyp` build error raised while installing `@deepseek-ai/dsh@0.1.3-alpha.2`, before this plugin was involved). Unknown for lack of a testable harness, not because of a known defect. |

Declaring `unknown` is deliberate: the store's rule is that an unreadable or
untestable target is not evidence of incompatibility, and it must not be written
as either `compatible` or `incompatible`.

## Node.js runtime

`engines.node` is set to the runtime that was actually exercised end to end:
Node **22.22.2**.

Two lower lines were attempted against `0.1.5-rc.1` and DSH itself did not come
up, so no lower floor can be claimed:

| Node | Outcome |
|---|---|
| `18.20.8` | DSH fails to load: `SyntaxError: The requested module 'node:util' does not provide an export named 'parseEnv'` (thrown from `@deepseek-ai/dsh-app-boot`, before this plugin loads). |
| `20.16.0` | DSH exits silently and scaffolds nothing. |

DSH does not publish an `engines` field of its own, so there is no upstream
range to mirror.

## Limits of this evidence

- This is **one disposable web profile per run on one machine**. It is
  installation, activation and lifecycle evidence — not a security audit, and
  not a substitute for the store's own review.
- Other DSH profiles (`tui`, `headless`, `desktop`) were not exercised; only the
  `web` profile was.
- The harness asserts that the client half is *loaded and served*. It does not
  assert that the sidebar panel becomes visible — see the known issue below.

## Known issue: the sidebar panel does not render

The client half registers its panel against the slot `sidebar.obsidian-memory`
(`src/client/index.ts`). Official `@deepseek-ai/dsh-client-ui-sidebar` declares
only `sidebar.brand.mark`, `sidebar.brand.name`, `sidebar.panellist`,
`sidebar.workspaces`, `sidebar.settings` and `sidebar.footer.action` — the
`sidebar.obsidian-memory` slot is not among them on any tested version, so the
occupant is never rendered and **no sidebar panel appears**.

The five `obsidian_memory_*` tools are unaffected: they are registered by the
host half and were verified working on every version in the matrix above.

A fix would mean re-targeting the panel at a slot the official shell does
declare (most likely the `sidebar.panellist` list, which points at a main
panel). That is a behavioural change to the panel, not a manifest fix, and is
out of scope for this compatibility release.

## Reproducing

```bash
# one DSH version
node scripts/verify-disposable-profile.mjs \
  --dsh /path/to/node_modules/@deepseek-ai/dsh/lib/bin.js \
  --version 0.1.5-rc.1 \
  --out evidence-0.1.5-rc.1.json
```

The harness never touches a real profile: it mints a fresh `DSH_HOME` under the
system temp directory, and deletes it on the way out. `--pnpm <path>` selects a
specific pnpm when a broken shim shadows the working one.
