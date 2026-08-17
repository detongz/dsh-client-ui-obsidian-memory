window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-obsidian-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Volumes/Kingstone/workspace/dsh-obsidian-memory/plugin/src/client/ObsidianMemoryPanel.module.css.mjs
		const css = ".UVjcUW_panel{border-top:1px solid var(--border-color,#e0e0e0);padding:8px 12px}.UVjcUW_header{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;font-weight:600;display:flex}.UVjcUW_refresh{cursor:pointer;background:0 0;border:none;border-radius:4px;padding:2px 4px;font-size:14px}.UVjcUW_refresh:hover{background:var(--background-modifier-hover,#eee)}.UVjcUW_tree{margin:0;padding:0;font-size:13px;list-style:none}.UVjcUW_tree ul{margin:0;padding-left:0;list-style:none}.UVjcUW_tree li{margin:2px 0}.UVjcUW_file{cursor:pointer;color:var(--text-normal,#333);border-radius:4px;align-items:center;gap:6px;padding:3px 6px;display:flex}.UVjcUW_file:hover{background:var(--background-modifier-hover,#eee)}.UVjcUW_dir{cursor:pointer;color:var(--text-normal,#333);border-radius:4px;align-items:center;gap:6px;padding:3px 6px;font-weight:500;display:flex}.UVjcUW_dir:hover{background:var(--background-modifier-hover,#eee)}.UVjcUW_error{color:#dc2626;background:#fef2f2;border-radius:4px;margin-bottom:6px;padding:4px;font-size:11px}.UVjcUW_info{color:var(--text-muted,#666);font-size:12px;line-height:1.5}.UVjcUW_info p{margin:4px 0}.UVjcUW_toolList{margin:4px 0;padding:0;font-size:12px;list-style:none}.UVjcUW_toolList li{color:var(--text-normal,#333);padding:2px 0;font-family:monospace}";
		const tagId = "@deepseek-ai/dsh-client-ui-obsidian-memory/ObsidianMemoryPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-obsidian-memory";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ObsidianMemoryPanel_module_css_default = {
			"header": "UVjcUW_header",
			"error": "UVjcUW_error",
			"refresh": "UVjcUW_refresh",
			"file": "UVjcUW_file",
			"dir": "UVjcUW_dir",
			"panel": "UVjcUW_panel",
			"tree": "UVjcUW_tree",
			"toolList": "UVjcUW_toolList",
			"info": "UVjcUW_info"
		};
		//#endregion
		//#region src/client/ObsidianMemoryPanel.tsx
		/**
		* Obsidian Memory sidebar panel — shows vault status and tool info.
		*/
		function ObsidianMemoryPanel() {
			const [files, setFiles] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(true);
			const load = async () => {
				setLoading(true);
				setError("");
				try {
					const res = await fetch("http://127.0.0.1:3456/api/tree");
					if (!res.ok) throw new Error("preview server not running");
					const data = await res.json();
					setFiles(data.files || []);
					setError("");
				} catch (e) {
					setError("Preview server offline — showing static structure");
					setFiles([]);
				} finally {
					setLoading(false);
				}
			};
			(0, react.useEffect)(() => {
				load();
			}, []);
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
					loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ObsidianMemoryPanel_module_css_default.info,
						children: "Loading…"
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ObsidianMemoryPanel_module_css_default.error,
						children: error
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.info,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Available tools:" }) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
								className: ObsidianMemoryPanel_module_css_default.toolList,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "obsidian_memory_read" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "obsidian_memory_list" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "obsidian_memory_search" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "obsidian_memory_write" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "obsidian_memory_append" })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Configure vaultPath in cordis.patch.yml to enable file access." })
						]
					})] }),
					files.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: ObsidianMemoryPanel_module_css_default.tree,
						children: files.map((f) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: f.type === "dir" ? ObsidianMemoryPanel_module_css_default.dir : ObsidianMemoryPanel_module_css_default.file,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: f.type === "dir" ? "📁" : "📄" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: f.name })]
						}, f.path))
					})
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