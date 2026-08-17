import { appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
//#region src/tools/fs.ts
function resolveVaultPath(vaultPath, filePath) {
	const resolved = resolve(join(vaultPath, filePath));
	const rel = relative(vaultPath, resolved);
	if (rel.startsWith("..") || rel === "") throw new Error(`Path traversal detected: ${filePath}`);
	return resolved;
}
async function readVaultFile(vaultPath, filePath) {
	const fullPath = resolveVaultPath(vaultPath, filePath);
	return readFile(fullPath, "utf-8");
}
async function listVaultDir(vaultPath, dirPath = "") {
	const fullPath = dirPath ? resolveVaultPath(vaultPath, dirPath) : vaultPath;
	return (await readdir(fullPath, { withFileTypes: true })).map((e) => ({
		name: e.name,
		type: e.isDirectory() ? "directory" : "file"
	}));
}
async function searchVault(vaultPath, query) {
	const results = [];
	const lowerQuery = query.toLowerCase();
	async function walk(dir, baseRel) {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const relPath = baseRel ? `${baseRel}/${entry.name}` : entry.name;
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				if ([
					".git",
					".obsidian",
					"node_modules"
				].includes(entry.name)) continue;
				await walk(fullPath, relPath);
			} else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".txt"))) try {
				const content = await readFile(fullPath, "utf-8");
				const lowerContent = content.toLowerCase();
				let matches = 0;
				let idx = 0;
				while ((idx = lowerContent.indexOf(lowerQuery, idx)) !== -1) {
					matches++;
					idx += lowerQuery.length;
				}
				if (matches > 0) {
					const snippetStart = Math.max(0, lowerContent.indexOf(lowerQuery) - 60);
					const snippetEnd = Math.min(content.length, snippetStart + 200);
					const snippet = content.slice(snippetStart, snippetEnd).replace(/\n/g, " ");
					results.push({
						path: relPath,
						matches,
						snippet: `...${snippet}...`
					});
				}
			} catch {}
		}
	}
	await walk(vaultPath, "");
	return results;
}
async function writeVaultFile(vaultPath, filePath, content) {
	const fullPath = resolveVaultPath(vaultPath, filePath);
	await mkdir(dirname(fullPath), { recursive: true });
	await writeFile(fullPath, content, "utf-8");
}
async function appendVaultFile(vaultPath, filePath, content) {
	const fullPath = resolveVaultPath(vaultPath, filePath);
	await mkdir(dirname(fullPath), { recursive: true });
	await appendFile(fullPath, content, "utf-8");
}
//#endregion
//#region src/index.ts
const name = "ui-obsidian-memory";
const inject = ["tools", "systemPrompt"];
function apply(ctx, config) {
	const vaultPath = config.vaultPath || process.env.OBSIDIAN_VAULT_PATH;
	if (!vaultPath) {
		ctx.logger?.warn?.("[ui-obsidian-memory] No vaultPath configured. Set vaultPath in cordis.patch.yml to enable file access.");
		return;
	}
	if (ctx.systemPrompt) ctx.systemPrompt.section({
		name: "tool:obsidian-memory",
		order: 100,
		text: `You have access to an Obsidian memory vault at ${vaultPath}. Use obsidian_memory_* tools to read, write, list, and search persistent memory files. The vault follows this structure:\n- Codex/AGENTS.md — operating instructions and agent preferences\n- Codex/TODO.md — pending tasks and open loops\n- Codex/people/ — people notes\n- Codex/projects/ — project status\n- Codex/notes/ — general notes\n- Codex/daily/ — daily notes\n\nWhen updating memory, be concise and structured. Do not dump raw chat history.`
	});
	const okRender = (value) => ({
		type: "text",
		text: value.success ? `✅ Wrote ${value.path}` : `❌ Failed to write ${value.path}`
	});
	ctx.tools.register({
		name: "obsidian_memory_read",
		description: "Read a Markdown or text file from the Obsidian memory vault.",
		parameters: {
			type: "object",
			properties: { file_path: {
				type: "string",
				description: "Relative path inside the vault, e.g. \"Codex/AGENTS.md\""
			} },
			required: ["file_path"]
		},
		output: {
			schema: { type: "string" },
			render(_args, value) {
				return [{
					type: "text",
					text: value
				}];
			}
		},
		async execute(args) {
			return readVaultFile(vaultPath, args.file_path);
		}
	});
	ctx.tools.register({
		name: "obsidian_memory_list",
		description: "List files and directories inside the Obsidian memory vault.",
		parameters: {
			type: "object",
			properties: { path: {
				type: "string",
				description: "Relative directory path inside the vault. Defaults to root."
			} }
		},
		output: {
			schema: {
				type: "object",
				properties: { entries: {
					type: "array",
					items: {
						type: "object",
						properties: {
							name: { type: "string" },
							type: { type: "string" }
						},
						required: ["name", "type"]
					}
				} },
				required: ["entries"]
			},
			render(_args, value) {
				return [{
					type: "text",
					text: value.entries.map((e) => `${e.type === "directory" ? "📁" : "📄"} ${e.name}`).join("\n")
				}];
			}
		},
		async execute(args) {
			return { entries: await listVaultDir(vaultPath, args.path || "") };
		}
	});
	ctx.tools.register({
		name: "obsidian_memory_search",
		description: "Full-text search across Markdown files in the Obsidian memory vault.",
		parameters: {
			type: "object",
			properties: { query: {
				type: "string",
				description: "Search term to look for in vault files."
			} },
			required: ["query"]
		},
		output: {
			schema: {
				type: "object",
				properties: { results: {
					type: "array",
					items: {
						type: "object",
						properties: {
							path: { type: "string" },
							matches: { type: "integer" },
							snippet: { type: "string" }
						},
						required: [
							"path",
							"matches",
							"snippet"
						]
					}
				} },
				required: ["results"]
			},
			render(_args, value) {
				if (value.results.length === 0) return [{
					type: "text",
					text: "No matches found."
				}];
				return [{
					type: "text",
					text: value.results.map((r) => `${r.path} (${r.matches} matches)\n  ${r.snippet}`).join("\n\n")
				}];
			}
		},
		async execute(args) {
			return { results: await searchVault(vaultPath, args.query) };
		}
	});
	ctx.tools.register({
		name: "obsidian_memory_write",
		description: "Write or overwrite a file in the Obsidian memory vault.",
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Relative path inside the vault, e.g. \"Codex/notes/idea.md\""
				},
				content: {
					type: "string",
					description: "Full content to write."
				}
			},
			required: ["file_path", "content"]
		},
		output: {
			schema: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					path: { type: "string" }
				},
				required: ["success", "path"]
			},
			render(_args, value) {
				return [okRender(value)];
			}
		},
		async execute(args) {
			await writeVaultFile(vaultPath, args.file_path, args.content);
			return {
				success: true,
				path: args.file_path
			};
		}
	});
	ctx.tools.register({
		name: "obsidian_memory_append",
		description: "Append content to the end of a file in the Obsidian memory vault.",
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description: "Relative path inside the vault."
				},
				content: {
					type: "string",
					description: "Content to append. A newline is inserted automatically."
				}
			},
			required: ["file_path", "content"]
		},
		output: {
			schema: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					path: { type: "string" }
				},
				required: ["success", "path"]
			},
			render(_args, value) {
				return [{
					type: "text",
					text: value.success ? `✅ Appended to ${value.path}` : `❌ Failed to append to ${value.path}`
				}];
			}
		},
		async execute(args) {
			await appendVaultFile(vaultPath, args.file_path, "\n" + args.content);
			return {
				success: true,
				path: args.file_path
			};
		}
	});
	ctx.logger?.info?.(`[ui-obsidian-memory] Registered 5 tools for vault: ${vaultPath}`);
}
//#endregion
export { apply, inject, name };
