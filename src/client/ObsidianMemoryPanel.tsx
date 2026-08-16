/**
 * Obsidian Memory sidebar panel — shows Codex vault file tree.
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['']))
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3456/api/tree')
      if (!res.ok) throw new Error('preview server not running')
      const data = await res.json()
      setFiles(data.files || [])
      setError('')
    } catch (e) {
      setError('Preview server offline (port 3456)')
      // Fallback: show hard-coded structure
      setFiles([
        { name: 'AGENTS.md', path: 'AGENTS.md', type: 'file' },
        { name: 'TODO.md', path: 'TODO.md', type: 'file' },
        { name: 'agent', path: 'agent', type: 'dir' },
        { name: 'notes', path: 'notes', type: 'dir' },
        { name: 'people', path: 'people', type: 'dir' },
        { name: 'projects', path: 'projects', type: 'dir' },
      ])
    }
  }

  useEffect(() => { load() }, [])

  const toggleDir = (path: string) => {
    const next = new Set(expanded)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    setExpanded(next)
  }

  const renderTree = (parentPath: string, depth: number) => {
    const children = files.filter(f => {
      const idx = f.path.lastIndexOf('/')
      const parent = idx === -1 ? '' : f.path.substring(0, idx)
      return parent === parentPath
    })

    return (
      <ul className={css.tree} style={{ paddingLeft: depth * 12 }}>
        {children.map(child => (
          <li key={child.path}>
            {child.type === 'dir' ? (
              <div
                className={css.dir}
                onClick={() => toggleDir(child.path)}
              >
                <span>{expanded.has(child.path) ? '📂' : '📁'}</span>
                <span>{child.name}</span>
              </div>
            ) : (
              <div
                className={css.file}
                onClick={() => {
                  // @ts-ignore — dsh workspace API
                  window.dshOpenFile?.(`Codex/${child.path}`)
                }}
              >
                <span>📄</span>
                <span>{child.name}</span>
              </div>
            )}
            {child.type === 'dir' && expanded.has(child.path) && renderTree(child.path, depth + 1)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={css.panel}>
      <div className={css.header}>
        <span>🧠 Obsidian Memory</span>
        <button className={css.refresh} onClick={load}>↻</button>
      </div>
      {error && <div className={css.error}>{error}</div>}
      {renderTree('', 0)}
    </div>
  )
}
