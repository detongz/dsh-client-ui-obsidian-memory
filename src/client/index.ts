/**
 * Obsidian Memory panel plugin, browser half.
 * Registers the `sidebar.obsidian-memory` slot occupant that renders
 * the Codex vault file tree in the sidebar column.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the sidebar slot declarations into this program.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
// Type-only: pulls ctx.locale into this program.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { ObsidianMemoryPanel } from './ObsidianMemoryPanel.tsx'
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

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale']

/**
 * Register the Obsidian Memory panel into the sidebar-owned slot.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-obsidian-memory: dictionaries')

  ctx.slots.inject('sidebar.obsidian-memory', () => ctx.slots.register({
    name: 'sidebar.obsidian-memory',
    locale: NS,
  }, ObsidianMemoryPanel))
}
