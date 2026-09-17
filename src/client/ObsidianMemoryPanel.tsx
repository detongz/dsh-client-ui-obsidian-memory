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
      const msg: string = e?.rpcError?.message || e?.message || ''
      if (/browse capability|directoryPicker|waiting for service|not activated/i.test(msg)) {
        setError(
          'This DSH profile cannot browse the host filesystem. ' +
          'Open the plugin in a native/desktop DSH (or a bridge that provides the browse capability) to view the vault.',
        )
      } else {
        setError(msg || 'Failed to list directory')
      }
    } finally {
      setLoading(false)
    }
  }, [workspaces])

  // Only list when we already know a vault path. Calling listDirectory with no
  // path hits the directory picker, which is capability-gated in the web profile
  // and throws "needs the browse capability" — so we must not do it on mount.
  useEffect(() => {
    if (currentPath) {
      load(currentPath)
    }
  }, [])

  const enter = (entry: DirectoryEntry) => {
    load(entry.path)
  }

  const goUp = () => {
    if (listing && listing.crumbs.length > 1) {
      const parent = listing.crumbs[listing.crumbs.length - 2]
      load(parent.path)
    } else if (currentPath) {
      load(currentPath)
    }
  }

  const pickVault = async () => {
    try {
      const path = await workspaces.pickDirectory()
      if (path) {
        setSavedVaultPath(path)
        setCurrentPath(path)
        load(path)
      }
    } catch (e: any) {
      const msg: string = e?.rpcError?.message || e?.message || ''
      setError(
        /browse capability|directoryPicker|waiting for service|not activated/i.test(msg)
          ? 'The directory picker is unavailable in this profile. Set vaultPath in the host config, or open in a native DSH.'
          : (msg || 'Failed to open the directory picker'),
      )
    }
  }

  // There is no client-side `openPath`: opening a host path in the native
  // file manager is a host capability. Degrade gracefully — if a future
  // service exposes it, use it; otherwise copy the path to the clipboard so
  // the operator still gets the location.
  const openInHost = (absPath: string) => {
    const w = workspaces as unknown as { openPath?: (p: string) => Promise<void> }
    if (typeof w.openPath === 'function') {
      w.openPath(absPath).catch(() => {})
    } else {
      navigator.clipboard?.writeText(absPath).catch(() => {})
    }
  }

  const openCurrent = () => {
    if (listing) openInHost(listing.path)
  }

  const openFile = (absPath: string) => {
    openInHost(absPath)
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

      {/* No vault selected yet — prompt the operator to pick one. */}
      {!configuredVault && (
        <div className={css.hint}>
          No Obsidian vault selected yet. Click <b>📂 Select Vault</b> below to
          choose the folder this plugin should browse. Your choice is remembered
          on this device.
        </div>
      )}

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
