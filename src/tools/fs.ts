import { readFile, writeFile, appendFile, readdir, stat } from 'node:fs/promises'
import { join, resolve, relative } from 'node:path'

export interface MemoryConfig {
  vaultPath: string
}

/** Resolve a relative path inside the vault, with traversal guard. */
export function resolveVaultPath(vaultPath: string, filePath: string): string {
  const resolved = resolve(join(vaultPath, filePath))
  const rel = relative(vaultPath, resolved)
  if (rel.startsWith('..') || rel === '') {
    throw new Error(`Path traversal detected: ${filePath}`)
  }
  return resolved
}

/** Read a file from the vault. */
export async function readVaultFile(vaultPath: string, filePath: string): Promise<string> {
  const fullPath = resolveVaultPath(vaultPath, filePath)
  return readFile(fullPath, 'utf-8')
}

/** List entries in a vault directory. */
export async function listVaultDir(
  vaultPath: string,
  dirPath: string = '',
): Promise<Array<{ name: string; type: 'file' | 'directory' }>> {
  const fullPath = dirPath ? resolveVaultPath(vaultPath, dirPath) : vaultPath
  const entries = await readdir(fullPath, { withFileTypes: true })
  return entries.map((e) => ({ name: e.name, type: e.isDirectory() ? 'directory' : 'file' }))
}

/** Recursively search vault files for query string. */
export async function searchVault(
  vaultPath: string,
  query: string,
): Promise<Array<{ path: string; matches: number; snippet: string }>> {
  const results: Array<{ path: string; matches: number; snippet: string }> = []
  const lowerQuery = query.toLowerCase()

  async function walk(dir: string, baseRel: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const relPath = baseRel ? `${baseRel}/${entry.name}` : entry.name
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        // Skip common non-content directories
        if (['.git', '.obsidian', 'node_modules'].includes(entry.name)) continue
        await walk(fullPath, relPath)
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
        try {
          const content = await readFile(fullPath, 'utf-8')
          const lowerContent = content.toLowerCase()
          let matches = 0
          let idx = 0
          while ((idx = lowerContent.indexOf(lowerQuery, idx)) !== -1) {
            matches++
            idx += lowerQuery.length
          }
          if (matches > 0) {
            const snippetStart = Math.max(0, lowerContent.indexOf(lowerQuery) - 60)
            const snippetEnd = Math.min(content.length, snippetStart + 200)
            const snippet = content.slice(snippetStart, snippetEnd).replace(/\n/g, ' ')
            results.push({ path: relPath, matches, snippet: `...${snippet}...` })
          }
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  await walk(vaultPath, '')
  return results
}

/** Write or overwrite a file in the vault. */
export async function writeVaultFile(vaultPath: string, filePath: string, content: string): Promise<void> {
  const fullPath = resolveVaultPath(vaultPath, filePath)
  await writeFile(fullPath, content, 'utf-8')
}

/** Append content to a file in the vault. */
export async function appendVaultFile(vaultPath: string, filePath: string, content: string): Promise<void> {
  const fullPath = resolveVaultPath(vaultPath, filePath)
  await appendFile(fullPath, content, 'utf-8')
}
