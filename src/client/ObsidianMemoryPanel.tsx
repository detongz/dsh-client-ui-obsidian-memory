/**
 * Obsidian Memory sidebar panel — static info, no external server.
 */
import css from './ObsidianMemoryPanel.module.css'

export function ObsidianMemoryPanel() {
  return (
    <div className={css.panel}>
      <div className={css.header}>
        <span>🧠 Obsidian Memory</span>
      </div>

      <div className={css.section}>
        <div className={css.sectionTitle}>Available Tools</div>
        <ul className={css.toolList}>
          <li><code>obsidian_memory_read</code> — read a file</li>
          <li><code>obsidian_memory_list</code> — list directory</li>
          <li><code>obsidian_memory_search</code> — full-text search</li>
          <li><code>obsidian_memory_write</code> — write/overwrite</li>
          <li><code>obsidian_memory_append</code> — append to file</li>
        </ul>
      </div>

      <div className={css.section}>
        <div className={css.sectionTitle}>Vault Structure</div>
        <pre className={css.codeBlock}>
{`Codex/
├── AGENTS.md
├── TODO.md
├── people/
├── projects/
├── notes/
└── daily/`}
        </pre>
      </div>

      <div className={css.section}>
        <div className={css.sectionTitle}>Usage Tips</div>
        <ul className={css.tipList}>
          <li>Ask AI to "read my AGENTS.md" to load context</li>
          <li>Say "append to TODO" to track open loops</li>
          <li>Use "search my notes for ..." to find content</li>
          <li>AI will auto-summarize and save key decisions</li>
        </ul>
      </div>
    </div>
  )
}
