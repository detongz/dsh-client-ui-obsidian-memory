/**
 * End-to-end test for Obsidian Memory tools.
 * Run: node --import tsx/esm test-tools.mjs
 */

import { readVaultFile, listVaultDir, searchVault, writeVaultFile, appendVaultFile } from './src/tools/fs.ts'

const vaultPath = '/Users/zdt/Documents/Obsidian Vault'

async function test() {
  console.log('=== Obsidian Memory Tools Test ===\n')

  // 1. List Codex directory
  console.log('1. listVaultDir("Codex"):')
  const entries = await listVaultDir(vaultPath, 'Codex')
  console.log(entries.map(e => `  ${e.type === 'directory' ? '📁' : '📄'} ${e.name}`).join('\n'))
  console.log()

  // 2. Read AGENTS.md
  console.log('2. readVaultFile("Codex/AGENTS.md"):')
  const agentsContent = await readVaultFile(vaultPath, 'Codex/AGENTS.md')
  console.log('  First 200 chars:', agentsContent.slice(0, 200).replace(/\n/g, ' '))
  console.log()

  // 3. Write a test note
  console.log('3. writeVaultFile("Codex/notes/test-note.md"):')
  await writeVaultFile(vaultPath, 'Codex/notes/test-note.md', '# Test Note\n\nCreated by tool test at ' + new Date().toISOString())
  console.log('  ✅ Written')
  console.log()

  // 4. Append to test note
  console.log('4. appendVaultFile("Codex/notes/test-note.md"):')
  await appendVaultFile(vaultPath, 'Codex/notes/test-note.md', '\n## Update\n\nAppended content.')
  console.log('  ✅ Appended')
  console.log()

  // 5. Read back test note
  console.log('5. readVaultFile("Codex/notes/test-note.md"):')
  const testContent = await readVaultFile(vaultPath, 'Codex/notes/test-note.md')
  console.log('  Content:', testContent.replace(/\n/g, ' '))
  console.log()

  // 6. Search
  console.log('6. searchVault("memory"):')
  const results = await searchVault(vaultPath, 'memory')
  console.log('  Found', results.length, 'matches:')
  results.forEach(r => console.log(`    - ${r.path} (${r.matches} matches)`))
  console.log()

  // 7. Cleanup
  console.log('7. Cleanup: removing test-note.md')
  const { unlink } = await import('node:fs/promises')
  await unlink(new URL('Codex/notes/test-note.md', 'file://' + vaultPath + '/').pathname)
  console.log('  ✅ Removed')

  console.log('\n=== All tests passed! ===')
}

test().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
