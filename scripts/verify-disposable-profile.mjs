#!/usr/bin/env node
/**
 * Disposable-profile acceptance harness for dsh-client-ui-obsidian-memory.
 *
 * Runs the full install → start → uninstall lifecycle against a **throwaway**
 * DSH_HOME so the operator's real profile is never touched, and prints a JSON
 * evidence record. This is the evidence source for the `compatible` entries in
 * `dsh.compatibility.dshReleases` (see docs/COMPATIBILITY.md).
 *
 * What it asserts, per run:
 *   install      the bundle patch composes (`dsh --dump-config` shows the entry)
 *   start/host   all 5 `obsidian_memory_*` tools register AND execute, and the
 *                vault sandbox refuses path traversal
 *   start/client the client half lands in `window.__DSH_BOOT__` and its bundle
 *                is served from `/plugins/<id>/client.js` (behind the launch
 *                token handshake on DSH releases that gate the web surface)
 *   uninstall    package, profile bundle list and node_modules all revert
 *
 * Usage:
 *   node scripts/verify-disposable-profile.mjs --dsh <path/to/dsh/bin.js> \
 *        [--version <label>] [--source <plugin dir>] [--out <report.json>] [--pnpm <bin>]
 *
 * `--dsh` must point at the `@deepseek-ai/dsh` bin.js of the version under
 * test; the harness boots whatever bundle set that CLI resolves.
 *
 * `pnpm` resolution: `dsh plugin add` shells out to `pnpm`, so a shadowed or
 * broken shim on PATH (a stale corepack shim, for instance) fails the run for
 * reasons that have nothing to do with the plugin. The harness therefore
 * probes PATH itself, keeps the first `pnpm` that actually answers
 * `--version`, and prepends its directory so the dsh child process finds the
 * same one. Override with `--pnpm <path>` when the intended binary is not on
 * PATH. The resolved binary is recorded in the report as `pnpm`.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const PLUGIN_ID = 'dsh-client-ui-obsidian-memory'
const ENTRY_ID = 'ui-obsidian-memory'
const TOOL_NAMES = [
  'obsidian_memory_read',
  'obsidian_memory_list',
  'obsidian_memory_search',
  'obsidian_memory_write',
  'obsidian_memory_append',
]

/**
 * Probe plugin source, written into the disposable DSH_HOME and mounted with
 * `--patch`. It is never committed and never runs against a real profile: it
 * reads the live tool registry, exercises every tool, and asserts the vault
 * sandbox refuses traversal.
 */
const PROBE_SOURCE = `
import { writeFileSync } from 'node:fs'
export const name = 'compat-probe'
export const inject = ['tools']
const NAMES = ${JSON.stringify(TOOL_NAMES)}
const call = async (ctx, n, args) => {
  const def = ctx.tools.get(n)
  if (def === undefined) return { ok: false, error: 'not registered' }
  try {
    const value = await def.execute(args, {
      callId: 'probe-' + n, name: n, arguments: args,
      signal: new AbortController().signal,
      deferContext() {}, concludeTurn() {},
    })
    return { ok: true, value }
  } catch (e) { return { ok: false, error: String(e && e.message ? e.message : e) } }
}
export function apply(ctx) {
  setTimeout(async () => {
    const report = { registered: [], missing: [], executions: {} }
    // Never let the probe throw into the host: if boot is already tearing down,
    // ctx.tools is an inactive fiber and the throw would surface as a fatal
    // load failure, masking whatever actually went wrong first.
    try {
      for (const n of NAMES) (ctx.tools.get(n) === undefined ? report.missing : report.registered).push(n)
      report.executions.listRoot = await call(ctx, 'obsidian_memory_list', {})
      report.executions.write = await call(ctx, 'obsidian_memory_write', { file_path: 'notes/probe.md', content: 'probe-content-42' })
      report.executions.read = await call(ctx, 'obsidian_memory_read', { file_path: 'notes/probe.md' })
      report.executions.append = await call(ctx, 'obsidian_memory_append', { file_path: 'notes/probe.md', content: 'appended-line' })
      report.executions.search = await call(ctx, 'obsidian_memory_search', { query: 'probe-content-42' })
      report.executions.traversalBlocked = await call(ctx, 'obsidian_memory_read', { file_path: '../../../../etc/hosts' })
    } catch (e) {
      report.probeError = String(e && e.message ? e.message : e)
    }
    writeFileSync(process.env.PROBE_OUT, JSON.stringify(report, null, 2))
  }, 5000)
}
`

function parseArgs(argv) {
  const out = { source: process.cwd() }
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]
    const value = argv[i + 1]
    if (key === '--dsh') out.dsh = value
    else if (key === '--version') out.version = value
    else if (key === '--source') out.source = resolve(value)
    else if (key === '--out') out.out = value
    else if (key === '--pnpm') out.pnpm = resolve(value)
    else throw new Error(`unknown argument: ${key}`)
  }
  if (out.dsh === undefined) throw new Error('--dsh <path to @deepseek-ai/dsh/lib/bin.js> is required')
  out.dsh = resolve(out.dsh)
  out.version = out.version ?? 'unknown'
  return out
}

/**
 * Return the first `pnpm` on PATH that can report a version, together with the
 * PATH to hand to child processes. A shim that exits non-zero (broken corepack,
 * version-manager stub) is skipped instead of silently poisoning the install.
 */
function resolvePnpm(explicit) {
  const candidates = explicit !== undefined
    ? [explicit]
    : (process.env.PATH ?? '').split(delimiter).filter(Boolean).map((d) => join(d, 'pnpm'))

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8' })
    if (probe.status !== 0) continue
    const version = (probe.stdout ?? '').trim().split('\n').pop()
    if (version === '') continue
    const dir = dirname(candidate)
    const path = (process.env.PATH ?? '').split(delimiter).filter((d) => d !== dir && d !== '')
    return { bin: candidate, version, path: [dir, ...path].join(delimiter) }
  }
  if (explicit !== undefined) throw new Error(`--pnpm ${explicit} did not answer --version`)
  return null
}

const opts = parseArgs(process.argv.slice(2))
const pnpm = resolvePnpm(opts.pnpm)
/** Child env: same PATH, but with the working pnpm's directory first. */
const childEnv = { ...process.env, ...(pnpm === null ? {} : { PATH: pnpm.path }) }
const checks = {}
const fail = (name, detail) => { checks[name] = { pass: false, detail } }
const pass = (name, detail) => { checks[name] = { pass: true, detail } }

const home = mkdtempSync(join(tmpdir(), 'dsh-compat-'))
const profileDir = join(home, 'profiles', 'web')
const port = 3400 + Math.floor(Math.random() * 400)
const probeOut = join(home, 'probe-report.json')
const report = {
  plugin: PLUGIN_ID,
  dshVersion: opts.version,
  dshHome: home,
  port,
  pnpm: pnpm === null ? null : { bin: pnpm.bin, version: pnpm.version },
  checks,
}

function dsh(args, extraEnv = {}) {
  return spawnSync(process.execPath, [opts.dsh, ...args], {
    cwd: home,
    env: { ...childEnv, DSH_HOME: home, ...extraEnv },
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
}

// ---------------------------------------------------------------- scaffolding
mkdirSync(home, { recursive: true })
const scaffold = dsh(['--profile', 'web', '--dump-config'])
if (scaffold.status !== 0 || !existsSync(join(profileDir, 'package.json'))) {
  fail('scaffold', scaffold.stderr?.slice(0, 400) ?? 'no profile produced')
  finish()
}
pass('scaffold', 'web profile created in a disposable DSH_HOME')

// --------------------------------------------------------------- 1) install
// pnpm refuses to write to a workspace root without -w; the profile directory
// is exactly that, so the flag is part of the documented install path here.
const install = dsh(['plugin', '--profile', 'web', 'add', '-w', `file:${opts.source}`])
const installedManifest = existsSync(join(profileDir, 'package.json'))
  ? JSON.parse(readFileSync(join(profileDir, 'package.json'), 'utf8'))
  : {}
if (install.status !== 0 || !installedManifest.dependencies?.[PLUGIN_ID]) {
  fail('install', (install.stderr || install.stdout || 'pnpm add failed').slice(0, 400))
  finish()
}

const composed = dsh(['--profile', 'web', '--dump-config'])
const composedText = `${composed.stdout ?? ''}${composed.stderr ?? ''}`
if (!composedText.includes(`- id: ${ENTRY_ID}`) || !composedText.includes(`name: ${PLUGIN_ID}`)) {
  fail('install', 'bundle patch did not compose the host entry into the profile tree')
  finish()
}
if (!installedManifest.dsh?.profile?.bundles?.includes(PLUGIN_ID)) {
  fail('install', 'plugin missing from dsh.profile.bundles after reconcile')
  finish()
}
pass('install', 'package installed, added to dsh.profile.bundles, entry composed')

// ------------------------------------------------------ 2) start (runtime)
// A throwaway vault plus a probe plugin mounted through --patch. The probe is
// generated here and only ever lives inside the disposable DSH_HOME.
const vault = join(home, 'vault', 'Codex')
mkdirSync(join(vault, 'notes'), { recursive: true })
writeFileSync(join(vault, 'AGENTS.md'), '# probe vault\n')
writeFileSync(
  join(profileDir, 'cordis.patch.yml'),
  `- id: ${ENTRY_ID}\n  config:\n    vaultPath: ${vault}\n`,
)

const probeDir = join(home, 'probe')
mkdirSync(probeDir, { recursive: true })
writeFileSync(join(probeDir, 'package.json'), '{"type":"module"}\n')
writeFileSync(join(probeDir, 'probe.js'), PROBE_SOURCE)
const patchPath = join(probeDir, 'overlay.yml')
writeFileSync(patchPath, `- insert:\n    - id: compat-probe\n      name: ${join(probeDir, 'probe.js')}\n`)

const child = spawn(
  process.execPath,
  [opts.dsh, '--profile', 'web', '--patch', patchPath, '--port', String(port), '--no-open'],
  { cwd: home, env: { ...childEnv, DSH_HOME: home, PROBE_OUT: probeOut }, stdio: ['ignore', 'pipe', 'pipe'] },
)
let bootLog = ''
child.stdout.on('data', (d) => { bootLog += d })
child.stderr.on('data', (d) => { bootLog += d })

const session = await openSession(port, () => bootLog, 120_000)
let probe = null
for (let i = 0; i < 90 && probe === null; i++) {
  await sleep(1000)
  if (existsSync(probeOut)) probe = JSON.parse(readFileSync(probeOut, 'utf8'))
}

if (session === null) {
  fail('start', `web profile never served an authenticated index | log: ${bootLog.slice(-400)}`)
} else {
  pass('start', `web profile served the index route (${session.cookie === '' ? 'no auth token in this version' : 'token handshake + session cookie'})`)
}

if (probe === null) {
  fail('host-tools', `probe produced no report | log: ${bootLog.slice(-400)}`)
} else {
  // A probe-level throw means the registry could not be read at all (usually a
  // boot that failed before the plugin's fiber went active) — surface it
  // verbatim rather than reporting "nothing registered".
  const probeError = probe.probeError === undefined ? '' : ` | probe error: ${probe.probeError}`
  const missing = probe.missing ?? []
  missing.length === 0 && probeError === ''
    ? pass('host-tools', `all ${TOOL_NAMES.length} tools registered`)
    : fail('host-tools', `not registered: ${missing.join(', ') || '(registry unreadable)'}${probeError}`)

  const e = probe.executions ?? {}
  if (probeError !== '') {
    // No executions were recorded at all, so neither check has anything to
    // judge. Saying "passed" here would be a false positive.
    fail('host-execute', `not exercised: ${probeError}`)
    fail('sandbox', `not exercised: ${probeError}`)
  } else {
    const bad = Object.entries(e).filter(([k, v]) => k !== 'traversalBlocked' && v.ok !== true)
    bad.length === 0
      ? pass('host-execute', 'read/list/search/write/append all returned canonical values')
      : fail('host-execute', `failed calls: ${bad.map(([k, v]) => `${k}: ${v.error}`).join('; ')}`)

    e.traversalBlocked?.ok === false && String(e.traversalBlocked.error).includes('traversal')
      ? pass('sandbox', 'path traversal outside the vault is refused')
      : fail('sandbox', 'path traversal was NOT refused')
  }
}

if (session !== null) {
  session.html.includes(PLUGIN_ID)
    ? pass('client-graph', 'client half present in window.__DSH_BOOT__')
    : fail('client-graph', 'plugin id absent from the boot graph')

  const bundle = await fetchClientBundle(session, port)
  if (bundle === null) {
    fail('client-bundle', 'no route in the index document carries this plugin\'s client half')
  } else if (bundle.status !== 200) {
    fail('client-bundle', `bundle route returned ${bundle.status}`)
  } else {
    // Tolerate formatting: the registration is `load({ id: "<plugin>", factory: ...`.
    const registered = new RegExp(`__ModuleLoader__\\.load\\(\\{\\s*id:\\s*"${PLUGIN_ID}"`).test(bundle.body)
    registered
      ? pass('client-bundle', `served the client half (${bundle.body.length} bytes via ${describeRoute(bundle.via)})`)
      : fail('client-bundle', `served ${bundle.body.length} bytes but no loader registration for ${PLUGIN_ID}`)
  }
}

child.kill('SIGTERM')
await sleep(1500)
try { child.kill('SIGKILL') } catch { /* already gone */ }

// ------------------------------------------------------------- 3) uninstall
// Drop the operator-style override first so it cannot be mistaken for plugin
// residue.
writeFileSync(join(profileDir, 'cordis.patch.yml'), '[]\n')
const remove = dsh(['plugin', '--profile', 'web', 'remove', PLUGIN_ID])
const afterManifest = JSON.parse(readFileSync(join(profileDir, 'package.json'), 'utf8'))
const residue = []
if (remove.status !== 0) residue.push('pnpm remove failed')
if (afterManifest.dependencies?.[PLUGIN_ID]) residue.push('still in dependencies')
if (afterManifest.dsh?.profile?.bundles?.includes(PLUGIN_ID)) residue.push('still in dsh.profile.bundles')
if (existsSync(join(profileDir, 'node_modules', PLUGIN_ID))) residue.push('node_modules entry left behind')
if ((dsh(['--profile', 'web', '--dump-config']).stdout ?? '').includes(ENTRY_ID)) residue.push('host entry still composed')

residue.length === 0
  ? pass('uninstall', 'package, bundle list, node_modules and composed tree all reverted')
  : fail('uninstall', residue.join('; '))

finish()

// --------------------------------------------------------------- utilities
function finish() {
  report.passed = Object.values(checks).every((c) => c.pass)
  report.checks = checks
  const text = JSON.stringify(report, null, 2)
  if (opts.out) writeFileSync(opts.out, `${text}\n`)
  console.log(text)
  // Cleanup runs last and never fails the run: hardened or sandboxed hosts can
  // refuse a bulk delete, and that must not cost us the evidence record.
  try {
    rmSync(home, { recursive: true, force: true })
  } catch (error) {
    console.error(`note: disposable DSH_HOME left at ${home} (${String(error?.message ?? error)})`)
  }
  process.exit(report.passed ? 0 : 1)
}

/**
 * Fetch the plugin's client half.
 *
 * The route shape is version-dependent, so it is read back out of the served
 * index instead of being assumed:
 *   - older releases expose one file per plugin at `/plugins/<id>/client.js`;
 *   - newer releases concatenate every plugin's client half behind a single
 *     `/plugins/??a/client.js,b/client.js&rev=<hash>` request and stop answering
 *     the per-plugin route entirely.
 * In both cases the response body must carry this plugin's loader registration.
 */
/** Short, human-readable label for a bundle route (the combined one is huge). */
function describeRoute(path) {
  if (!path.includes('??')) return path
  const halves = (path.match(/client\.js/g) ?? []).length
  return `/plugins/?? (combined client bundle of ${halves} halves)`
}

async function fetchClientBundle(session, portNumber) {  const request = async (path) => {
    const res = await fetch(
      path.startsWith('http') ? path : `http://127.0.0.1:${portNumber}${path}`,
      { headers: session.cookie === '' ? {} : { cookie: session.cookie } },
    ).catch(() => null)
    return res === null ? null : { status: res.status, body: await res.text(), via: path }
  }

  const direct = await request(`/plugins/${PLUGIN_ID}/client.js`)
  if (direct !== null && direct.status === 200) return direct

  const listed = [...session.html.matchAll(/<(?:script|link)[^>]*\b(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1].replace(/&amp;/g, '&'))
    .find((value) => value.includes('plugins/') && value.includes(`${PLUGIN_ID}/client.js`))

  if (listed === undefined) return direct
  return await request(listed)
}

/**
 * Wait for the web profile to serve the *authenticated* index route.
 *
 * Newer DSH releases gate the web surface behind a launch token: `dsh web`
 * prints `http://host:port/?token=<launchToken>`, and only `GET /?token=` with a
 * matching Host answers 303 + `Set-Cookie`. Later requests carry that cookie.
 * Node's fetch has no cookie jar and would follow the 303 into a 401, so the
 * handshake is done by hand and the cookie is replayed.
 *
 * Older releases serve the app with no token at all; that path is taken when no
 * token shows up in the boot log.
 *
 * @returns `{ html, cookie }`, or `null` if the deadline passes first.
 */
async function openSession(portNumber, log, timeoutMs) {
  const base = `http://127.0.0.1:${portNumber}`
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const token = (log().match(/[?&]token=(\S+)/) ?? [])[1] ?? null

    if (token === null) {
      const res = await fetch(`${base}/`).catch(() => null)
      if (res?.ok === true) {
        const html = await res.text()
        if (html.includes('__DSH_BOOT__')) return { html, cookie: '' }
      }
    } else {
      const handshake = await fetch(`${base}/?token=${token}`, { redirect: 'manual' }).catch(() => null)
      const cookie = (handshake?.headers.getSetCookie?.() ?? [])
        .map((c) => c.split(';')[0])
        .join('; ')
      if (handshake?.status === 303 && cookie !== '') {
        const res = await fetch(`${base}/`, { headers: { cookie } }).catch(() => null)
        if (res?.ok === true) return { html: await res.text(), cookie }
      }
    }
    await sleep(500)
  }
  return null
}
