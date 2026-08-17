/**
 * Obsidian Memory sidebar panel — shows vault status and tool info.
 */
import { useEffect, useState } from 'react'
import css from './ObsidianMemoryPanel.module.css'

interface FileEntry {
  name: string
  path: string
  type: 'file' | 'dir'
}

export function ObsidianMemoryPanel() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://127.0.0.1:3456/api/tree')
      if (!res.ok) throw new Error('preview server not running')
      const data = await res.json()
      setFiles(data.files || [])
      setError('')
    } catch (e) {
      setError('Preview server offline — showing static structure')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className={css.panel}>
      <div className={css.header}>
        <span>🧠 Obsidian Memory</span>
        <button className={css.refresh} onClick={load}>↻</button>
      </div>

      {loading && <div className={css.info}>Loading…</div>}

      {error && (
        <div>
          <div className={css.error}>{error}</div>
          <div className={css.info}>
            <p><strong>Available tools:</strong></p>
            <ul className={css.toolList}>
              <li>obsidian_memory_read</li>
              <li>obsidian_memory_list</li>
              <li>obsidian_memory_search</li>
              <li>obsidian_memory_write</li>
              <li>obsidian_memory_append</li>
            </ul>
            <p>Configure vaultPath in cordis.patch.yml to enable file access.</p>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <ul className={css.tree}>
          {files.map(f => (
            <li key={f.path} className={f.type === 'dir' ? css.dir : css.file}>
              <span>{f.type === 'dir' ? '📁' : '📄'}</span>
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
