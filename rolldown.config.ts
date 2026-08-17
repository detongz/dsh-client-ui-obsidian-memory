import { defineConfig, type Plugin } from 'rolldown'
import { readFile } from 'node:fs/promises'
import { transform } from 'lightningcss'
import { basename } from 'node:path'

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

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
  return {
    name: 'dsh-css-modules-inline',
    async resolveId(source, importer) {
      if (!source.endsWith('.module.css')) return null
      const abs = importer
        ? new URL(source, 'file://' + importer).pathname
        : source
      return CSS_VIRTUAL_PREFIX + abs + CSS_VIRTUAL_SUFFIX
    },
    async load(virtualId) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const fileId = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      const source = await readFile(fileId)
      const { code, exports: cssExports } = transform({
        filename: fileId,
        code: source,
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      const classMap: Record<string, string> = {}
      for (const [local, exp] of Object.entries(cssExports ?? {})) {
        classMap[local] = exp.name
      }
      return [
        `const css = ${JSON.stringify(code.toString())};`,
        `const tagId = ${JSON.stringify(`${id}/${basename(fileId)}`)};`,
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
