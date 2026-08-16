/**
 * Obsidian Memory slot contract — the canonical type for the
 * `sidebar.obsidian-memory` slot declared by ui-sidebar.
 */

import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls ui-sidebar's SlotMap merge into this program.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'

/** Registrant-private injected share for the Obsidian Memory panel.
 *  Currently empty: the panel fetches its own data from the preview server.
 */
export type ObsidianMemoryPanelInjected = Record<string, never>

/**
 * Full component props: slot owner state (wide) plus the standard locale seat.
 */
export type ObsidianMemoryPanelProps =
  { wide: boolean }
  & PropsLocale<'obsidian-memory'>
