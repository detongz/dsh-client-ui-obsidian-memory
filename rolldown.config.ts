import { defineConfig, type Plugin } from 'rolldown'
import { readFile } from 'node:fs/promises'
import { transform } from 'lightningcss'
import { basename, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

/**
 * Builds must be byte-reproducible regardless of where the checkout lives.
 * Two outputs would otherwise embed the checkout's absolute path: rolldown's
 * `//#region` comment carries the virtual module id, and lightningcss mixes the
 * `filename` into the `[hash]` CSS-module prefix. Both are fed a
 * project-root-relative POSIX path instead, so the committed `lib/` matches a
 * rebuild on any machine.
 */
const PROJECT_ROOT = process.cwd()

const stableId = (absolutePath: string) => relative(PROJECT_ROOT, absolutePath).split(sep).join('/')

/**
 * The plugin's package name — the module-table key the bundle must register
 * under. The DSH client module loader keys factories by the loader entry's
 * name (the `name:` in cordis.patch.yml, which resolves to this package),
 * so the `__ModuleLoader__.load` id MUST equal package.json's `name`.
 * Deriving it here keeps the two in lockstep.
 */
const PLUGIN_ID = JSON.parse(
  await readFile(new URL('./package.json', import.meta.url), 'utf-8'),
).name as string

function cssModulesInline(id: string): Plugin {
  /** virtual id -> on-disk path; the id itself stays checkout-independent. */
  const onDisk = new Map<string, string>()
  return {
    name: 'dsh-css-modules-inline',
    async resolveId(source, importer) {
      if (!source.endsWith('.module.css')) return null
      const absolute = importer
        ? fileURLToPath(new URL(source, pathToFileURL(importer)))
        : resolve(source)
      const virtualId = CSS_VIRTUAL_PREFIX + stableId(absolute) + CSS_VIRTUAL_SUFFIX
      onDisk.set(virtualId, absolute)
      return virtualId
    },
    async load(virtualId) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const stable = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      const absolute = onDisk.get(virtualId) ?? resolve(PROJECT_ROOT, stable)
      const source = await readFile(absolute)
      const { code, exports: cssExports } = transform({
        filename: stable,
        code: source,
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      const classMap: Record<string, string> = {}
      // lightningcss hands back the CSS-module exports in a nondeterministic
      // order, which would otherwise reorder the emitted object literal and
      // break byte-reproducibility of the committed bundle.
      for (const local of Object.keys(cssExports ?? {}).sort()) {
        classMap[local] = cssExports![local].name
      }
      return [
        `const css = ${JSON.stringify(code.toString())};`,
        `const tagId = ${JSON.stringify(`${id}/${basename(absolute)}`)};`,
        `if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {`,
        `  const tag = document.createElement('style');`,
        `  tag.dataset.plugin = ${JSON.stringify(id)};`,
        `  tag.dataset.pluginCss = tagId;`,
        `  tag.textContent = css;`,
        `  document.head.appendChild(tag);`,
        `}`,
        `export default ${JSON.stringify(classMap)};`,
      ].join('\n')
    },
  }
}

const CLIENT_EXTERNALS = [
  '@deepseek-ai/dsh-client-runtime/client',
  '@deepseek-ai/dsh-client-locale/client',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-sidebar/client',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-layout/client',
  'react',
  'react/jsx-runtime',
]

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'esm',
    },
    external: [],
  },
  {
    input: 'src/client/index.ts',
    output: {
      file: 'lib/client.js',
      format: 'cjs',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      sourcemap: true,
    },
    external: CLIENT_EXTERNALS,
    plugins: [cssModulesInline(PLUGIN_ID)],
  },
])
