/** `obsidian-memory` namespace dictionaries. */

/** Simplified Chinese dictionary. */
export const zh = {
  'panel.title': 'Obsidian Memory',
} satisfies Record<string, string>

/** The obsidian-memory namespace key union. */
export type ObsidianMemoryKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'panel.title': 'Obsidian Memory',
} satisfies Record<ObsidianMemoryKey, string>
