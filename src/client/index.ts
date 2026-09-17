/**
 * Obsidian Memory panel plugin, browser half.
 *
 * Adds a global sidebar panel entry (the `sidebar.panellist` slot) whose icon
 * opens the vault browser in the layout's `main` slot, and registers that main
 * panel. The official sidebar only declares `sidebar.panellist` (panel icons)
 * among its additive seats, so the panel is mounted there rather than against
 * a bespoke `sidebar.obsidian-memory` slot the shell does not provide.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the sidebar slot declarations into this program.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
// Type-only: pulls ctx.locale into this program.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { ObsidianMemoryPanel } from './ObsidianMemoryPanel.tsx'
import { ObsidianMemoryIcon } from './ObsidianMemoryIcon.tsx'
import { en, zh, type ObsidianMemoryKey } from './locales.ts'

export type { ObsidianMemoryKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Obsidian Memory panel copy. */
    'obsidian-memory': ObsidianMemoryKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'obsidian-memory'

/**
 * Panel id shared by the sidebar entry and the main-slot occupant. The sidebar
 * row calls `ctx.layout.selectPanel(PANEL_ID)`; the layout renders the `main`
 * occupant whose `key` matches, so the two MUST stay equal.
 */
const PANEL_ID = 'obsidian-memory'

/** Required services (cordis fiber inject).
 *  NOTE: `config` is intentionally NOT injected. The client half runs in the
 *  browser where cordis does not provide a `config` service (it exists only on
 *  the host fiber), so injecting it leaves the entry "pending (waiting for
 *  service: config)" and the plugin never activates. The vault path is instead
 *  resolved on the client from localStorage / the directory picker, and (planned)
 *  from a host-provided typert Remote. */
export const inject = ['slots', 'uiWorkspace', 'locale']

/**
 * Factory that creates the props injected into the main-panel occupant.
 * The directory browser service is `uiWorkspace` on the client (renamed from
 * the older `workspaces` name). `listDirectory` / `pickDirectory` /
 * `createDirectory` live there; `openPath` does not exist client-side, so the
 * panel degrades file "open" to clipboard copy.
 *
 * The vault path is NOT read from `ctx.config` (unavailable on the client);
 * the panel resolves it from localStorage / the directory picker instead.
 */
function injected(ctx: ClientContext) {
  return {
    workspaces: (ctx as any).uiWorkspace,
  }
}

/**
 * Register the Obsidian Memory sidebar icon and its main panel.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'obsidian-memory: dictionaries')

  // Sidebar panel icon — the row opens the main panel below when clicked.
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 50,
    label: 'Obsidian Memory',
  }, ObsidianMemoryIcon))

  // Main panel — the vault directory browser.
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
    inject: () => injected(ctx),
  }, ObsidianMemoryPanel))
}
