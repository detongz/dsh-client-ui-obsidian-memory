/**
 * Host-side tool plugin for Obsidian Memory.
 * Registers obsidian_memory_* tools so AI can read/write/search the vault.
 * Schemas are standard JSON Schema (not DSH author DSL) since we register
 * raw ToolDefinition objects without defineTool().
 */

import type { MemoryConfig } from './tools/fs.ts'
import {
  readVaultFile,
  listVaultDir,
  searchVault,
  writeVaultFile,
  appendVaultFile,
} from './tools/fs.ts'

export const name = 'tool-obsidian-memory'
export const inject = ['tools', 'systemPrompt']

export function apply(ctx: any, config: MemoryConfig): void {
  const vaultPath = config.vaultPath || process.env.OBSIDIAN_VAULT_PATH

  if (!vaultPath) {
    ctx.logger?.warn?.(
      '[tool-obsidian-memory] No vaultPath configured. ' +
        'Set vaultPath in cordis.patch.yml or OBSIDIAN_VAULT_PATH env var.',
    )
    return
  }

  if (ctx.systemPrompt) {
    ctx.systemPrompt.section({
      name: 'tool:obsidian-memory',
      order: 100,
      text:
        `You have access to an Obsidian memory vault at ${vaultPath}. ` +
        `Use obsidian_memory_* tools to read, write, list, and search persistent memory files. ` +
        `The vault follows this structure:\n` +
        `- Codex/AGENTS.md — operating instructions and agent preferences\n` +
        `- Codex/TODO.md — pending tasks and open loops\n` +
        `- Codex/people/ — people notes\n` +
        `- Codex/projects/ — project status\n` +
        `- Codex/notes/ — general notes\n` +
        `- Codex/daily/ — daily notes\n\n` +
        `When updating memory, be concise and structured. Do not dump raw chat history.`,
    })
  }

  // obsidian_memory_read
  ctx.tools.register({
    name: 'obsidian_memory_read',
    description: 'Read a Markdown or text file from the Obsidian memory vault.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Relative path inside the vault, e.g. "Codex/AGENTS.md"',
        },
      },
      required: ['file_path'],
    },
    output: {
      schema: { type: 'string' },
      render(_args: any, value: string) {
        return [{ type: 'text', text: value }]
      },
    },
    async execute(args: any) {
      return readVaultFile(vaultPath, args.file_path)
    },
  })

  // obsidian_memory_list
  ctx.tools.register({
    name: 'obsidian_memory_list',
    description: 'List files and directories inside the Obsidian memory vault.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative directory path inside the vault. Defaults to root.',
        },
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
        },
      },
      render(_args: any, value: { entries: Array<{ name: string; type: string }> }) {
        const lines = value.entries.map((e) => `${e.type === 'directory' ? '📁' : '📄'} ${e.name}`)
        return [{ type: 'text', text: lines.join('\n') }]
      },
    },
    async execute(args: any) {
      const entries = await listVaultDir(vaultPath, args.path || '')
      return { entries }
    },
  })

  // obsidian_memory_search
  ctx.tools.register({
    name: 'obsidian_memory_search',
    description: 'Full-text search across Markdown files in the Obsidian memory vault.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term to look for in vault files.',
        },
      },
      required: ['query'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                matches: { type: 'integer' },
                snippet: { type: 'string' },
              },
            },
          },
        },
      },
      render(_args: any, value: { results: Array<{ path: string; matches: number; snippet: string }> }) {
        if (value.results.length === 0) {
          return [{ type: 'text', text: 'No matches found.' }]
        }
        const lines = value.results.map((r) => `${r.path} (${r.matches} matches)\n  ${r.snippet}`)
        return [{ type: 'text', text: lines.join('\n\n') }]
      },
    },
    async execute(args: any) {
      const results = await searchVault(vaultPath, args.query)
      return { results }
    },
  })

  // obsidian_memory_write
  ctx.tools.register({
    name: 'obsidian_memory_write',
    description: 'Write or overwrite a file in the Obsidian memory vault.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Relative path inside the vault, e.g. "Codex/notes/idea.md"',
        },
        content: {
          type: 'string',
          description: 'Full content to write.',
        },
      },
      required: ['file_path', 'content'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          path: { type: 'string' },
        },
      },
      render(_args: any, value: { success: boolean; path: string }) {
        return [
          {
            type: 'text',
            text: value.success ? `✅ Wrote ${value.path}` : `❌ Failed to write ${value.path}`,
          },
        ]
      },
    },
    async execute(args: any) {
      await writeVaultFile(vaultPath, args.file_path, args.content)
      return { success: true, path: args.file_path }
    },
  })

  // obsidian_memory_append
  const appendSchema = {
    name: 'obsidian_memory_append',
    description: 'Append content to the end of a file in the Obsidian memory vault.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Relative path inside the vault.',
        },
        content: {
          type: 'string',
          description: 'Content to append. A newline is inserted automatically.',
        },
      },
      required: ['file_path', 'content'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          path: { type: 'string' },
        },
      },
      render(_args: any, value: { success: boolean; path: string }) {
        return [
          {
            type: 'text',
            text: value.success ? `✅ Appended to ${value.path}` : `❌ Failed to append to ${value.path}`,
          },
        ]
      },
    },
    async execute(args: any) {
      await appendVaultFile(vaultPath, args.file_path, '\n' + args.content)
      return { success: true, path: args.file_path }
    },
  }
  ctx.logger?.info?.(`[tool-obsidian-memory] Registering ${appendSchema.name} with params: ${JSON.stringify(appendSchema.parameters)}`)
  ctx.tools.register(appendSchema)

  ctx.logger?.info?.(`[tool-obsidian-memory] Registered 5 tools for vault: ${vaultPath}`)
}
