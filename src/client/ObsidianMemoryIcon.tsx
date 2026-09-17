/**
 * Obsidian Memory sidebar panel icon.
 *
 * Rendered inside the sidebar's global panel row (the `sidebar.panellist`
 * slot). The sidebar owns the row button and its click handler, which calls
 * `ctx.layout.selectPanel('obsidian-memory')` — that opens the vault browser
 * registered in the layout's `main` slot (see `index.ts`). This component only
 * paints the glyph at the requested size and reflects the selected state.
 */
interface IconProps {
  /** Requested square edge in pixels. */
  size: number
  /** Whether this panel is the currently selected main panel. */
  active: boolean
}

export function ObsidianMemoryIcon({ size, active }: IconProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.8)),
        lineHeight: 1,
        opacity: active ? 1 : 0.72,
        filter: active ? 'none' : 'grayscale(0.25)',
        transition: 'opacity 120ms ease, filter 120ms ease',
      }}
    >
      🧠
    </span>
  )
}
