window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-obsidian-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Volumes/Kingstone/workspace/dsh-obsidian-memory/plugin/src/client/ObsidianMemoryPanel.module.css.mjs
		const css = ".UVjcUW_panel{border-top:1px solid var(--border-color,#e0e0e0);padding:8px 12px}.UVjcUW_header{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;font-weight:600;display:flex}.UVjcUW_refresh{cursor:pointer;background:0 0;border:none;border-radius:4px;padding:2px 4px;font-size:14px}.UVjcUW_refresh:hover{background:var(--background-modifier-hover,#eee)}.UVjcUW_tree{margin:0;padding:0;font-size:13px;list-style:none}.UVjcUW_tree ul{margin:0;padding-left:0;list-style:none}.UVjcUW_tree li{margin:2px 0}.UVjcUW_file{cursor:pointer;color:var(--text-normal,#333);border-radius:4px;align-items:center;gap:6px;padding:3px 6px;display:flex}.UVjcUW_file:hover{background:var(--background-modifier-hover,#eee)}.UVjcUW_dir{cursor:pointer;color:var(--text-normal,#333);border-radius:4px;align-items:center;gap:6px;padding:3px 6px;font-weight:500;display:flex}.UVjcUW_dir:hover{background:var(--background-modifier-hover,#eee)}.UVjcUW_error{color:#dc2626;background:#fef2f2;border-radius:4px;margin-bottom:6px;padding:4px;font-size:11px}";
		const tagId = "@deepseek-ai/dsh-client-ui-obsidian-memory/ObsidianMemoryPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-obsidian-memory";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ObsidianMemoryPanel_module_css_default = {
			"tree": "UVjcUW_tree",
			"header": "UVjcUW_header",
			"panel": "UVjcUW_panel",
			"dir": "UVjcUW_dir",
			"error": "UVjcUW_error",
			"file": "UVjcUW_file",
			"refresh": "UVjcUW_refresh"
		};
		//#endregion
		//#region src/client/ObsidianMemoryPanel.tsx
		/**
		* Obsidian Memory sidebar panel — shows Codex vault file tree.
		*/
		function ObsidianMemoryPanel() {
			const [files, setFiles] = (0, react.useState)([]);
			const [expanded, setExpanded] = (0, react.useState)(/* @__PURE__ */ new Set([""]));
			const [error, setError] = (0, react.useState)("");
			const load = async () => {
				try {
					const res = await fetch("http://127.0.0.1:3456/api/tree");
					if (!res.ok) throw new Error("preview server not running");
					const data = await res.json();
					setFiles(data.files || []);
					setError("");
				} catch (e) {
					setError("Preview server offline (port 3456)");
					setFiles([
						{
							name: "AGENTS.md",
							path: "AGENTS.md",
							type: "file"
						},
						{
							name: "TODO.md",
							path: "TODO.md",
							type: "file"
						},
						{
							name: "agent",
							path: "agent",
							type: "dir"
						},
						{
							name: "notes",
							path: "notes",
							type: "dir"
						},
						{
							name: "people",
							path: "people",
							type: "dir"
						},
						{
							name: "projects",
							path: "projects",
							type: "dir"
						}
					]);
				}
			};
			(0, react.useEffect)(() => {
				load();
			}, []);
			const toggleDir = (path) => {
				const next = new Set(expanded);
				if (next.has(path)) next.delete(path);
				else next.add(path);
				setExpanded(next);
			};
			const renderTree = (parentPath, depth) => {
				const children = files.filter((f) => {
					const idx = f.path.lastIndexOf("/");
					return (idx === -1 ? "" : f.path.substring(0, idx)) === parentPath;
				});
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: ObsidianMemoryPanel_module_css_default.tree,
					style: { paddingLeft: depth * 12 },
					children: children.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [child.type === "dir" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.dir,
						onClick: () => toggleDir(child.path),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: expanded.has(child.path) ? "📂" : "📁" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: child.name })]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.file,
						onClick: () => {
							window.dshOpenFile?.(`Codex/${child.path}`);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "📄" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: child.name })]
					}), child.type === "dir" && expanded.has(child.path) && renderTree(child.path, depth + 1)] }, child.path))
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ObsidianMemoryPanel_module_css_default.panel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "🧠 Obsidian Memory" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ObsidianMemoryPanel_module_css_default.refresh,
							onClick: load,
							children: "↻"
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ObsidianMemoryPanel_module_css_default.error,
						children: error
					}),
					renderTree("", 0)
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** `obsidian-memory` namespace dictionaries. */
		/** Simplified Chinese dictionary. */
		const zh = { "panel.title": "Obsidian Memory" };
		/** English dictionary, checked complete against the zh key set. */
		const en = { "panel.title": "Obsidian Memory" };
		//#endregion
		//#region src/client/index.ts
		/** Dictionary namespace owned by this plugin. */
		const NS = "obsidian-memory";
		/** Required services (cordis fiber inject). */
		const inject = ["slots", "locale"];
		/**
		* Register the Obsidian Memory panel into the sidebar-owned slot.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-obsidian-memory: dictionaries");
			ctx.slots.inject("sidebar.obsidian-memory", () => ctx.slots.register({
				name: "sidebar.obsidian-memory",
				locale: NS
			}, ObsidianMemoryPanel));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map