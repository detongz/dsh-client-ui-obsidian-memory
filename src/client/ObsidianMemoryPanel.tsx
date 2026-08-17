/**
 * Obsidian Memory sidebar panel — vault directory browser.
 * Uses DSH's built-in workspaces.listDirectory / openPath / pickDirectory.
 */
import { useState, useEffect, useCallback } from 'react'
import css from './ObsidianMemoryPanel.module.css'

interface DirectoryEntry {
  name: string
  path: string
  hidden: boolean
}

interface DirectoryListing {
  path: string
  home: string
  crumbs: DirectoryEntry[]
  entries: DirectoryEntry[]
  truncated: boolean
}

interface WorkspacesFace {
  listDirectory(path?: string, signal?: AbortSignal): Promise<DirectoryListing>
  openPath(path: string): Promise<void>
  pickDirectory(): Promise<string | null>
}

interface PanelProps {
  wide?: boolean
  workspaces: WorkspacesFace
  config?: { vaultPath?: string }
}

const STORAGE_KEY = 'obsidian-memory:vaultPath'

function getSavedVaultPath(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setSavedVaultPath(path: string) {
  try {
    localStorage.setItem(STORAGE_KEY, path)
  } catch {
    // ignore
  }
}

export function ObsidianMemoryPanel({ workspaces, config }: PanelProps) {
  const configuredVault = config?.vaultPath || getSavedVaultPath()
  const [currentPath, setCurrentPath] = useState<string | null>(configuredVault)
  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (path?: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await workspaces.listDirectory(path)
      setListing(result)
      if (path) setCurrentPath(path)
    } catch (e: any) {
      setError(e?.rpcError?.message || e?.message || 'Failed to list directory')
    } finally {
      setLoading(false)
    }
  }, [workspaces])

  useEffect(() => {
    if (currentPath) {
      load(currentPath)
    } else {
      // Start at home directory
      load()
    }
  }, [])

  const enter = (entry: DirectoryEntry) => {
    load(entry.path)
  }

  const goUp = () => {
    if (listing && listing.crumbs.length > 1) {
      const parent = listing.crumbs[listing.crumbs.length - 2]
      load(parent.path)
    } else {
      load()
    }
  }

  const pickVault = async () => {
    const path = await workspaces.pickDirectory()
    if (path) {
      setSavedVaultPath(path)
      setCurrentPath(path)
      load(path)
    }
  }

  const openCurrent = () => {
    if (listing) {
      workspaces.openPath(listing.path).catch(() => {})
    }
  }

  const openFile = (absPath: string) => {
    workspaces.openPath(absPath).catch(() => {})
  }

  const isVault = configuredVault && listing?.path === configuredVault

  return (
    <div className={css.panel}>
      <div className={css.header}>
        <span>🧠 Obsidian Memory</span>
        <button className={css.iconBtn} onClick={() => load(currentPath || undefined)} title="Refresh">
          ↻
        </button>
      </div>

      {error && <div className={css.error}>{error}</div>}

      {/* Breadcrumb */}
      {listing && (
        <div className={css.breadcrumb}>
          {listing.crumbs.map((crumb, i) => (
            <span key={crumb.path}>
              {i > 0 && <span className={css.sep}> / </span>}
              <button
                className={css.crumbBtn}
                onClick={() => load(crumb.path)}
              >
                {crumb.name === listing.home ? '🏠' : crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Directory listing */}
      {listing && (
        <ul className={css.tree}>
          {/* Up button */}
          <li>
            <button className={css.row} onClick={goUp}>
              <span>📂</span>
              <span className={css.rowLabel}>..</span>
            </button>
          </li>

          {listing.entries.filter(e => !e.hidden).map(entry => (
            <li key={entry.path}>
              <button className={css.row} onClick={() => enter(entry)}>
                <span>📁</span>
                <span className={css.rowLabel}>{entry.name}</span>
              </button>
            </li>
          ))}

          {listing.entries.length === 0 && (
            <li className={css.empty}>Empty directory</li>
          )}
        </ul>
      )}

      {loading && <div className={css.info}>Loading…</div>}

      {/* Actions */}
      <div className={css.actions}>
        <button className={css.actionBtn} onClick={pickVault}>
          📂 Select Vault
        </button>
        {listing && (
          <button className={css.actionBtn} onClick={openCurrent}>
            📂 Open Folder
          </button>
        )}
      </div>

      {/* Quick links when inside vault */}
      {isVault && configuredVault && (
        <div className={css.section}>
          <div className={css.sectionTitle}>Quick Open</div>
          <div className={css.quickLinks}>
            {[
              ['AGENTS.md', `${configuredVault}/AGENTS.md`],
              ['TODO.md', `${configuredVault}/TODO.md`],
            ].map(([name, path]) => (
              <button key={name} className={css.linkBtn} onClick={() => openFile(path)}>
                📄 {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tool reference */}
      <div className={css.section}>
        <div className={css.sectionTitle}>Memory Tools</div>
        <ul className={css.toolList}>
          <li><code>obsidian_memory_read</code></li>
          <li><code>obsidian_memory_list</code></li>
          <li><code>obsidian_memory_search</code></li>
          <li><code>obsidian_memory_write</code></li>
          <li><code>obsidian_memory_append</code></li>
        </ul>
      </div>
    </div>
  )
}
