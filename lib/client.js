window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-obsidian-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Volumes/Kingstone/workspace/dsh-obsidian-memory/plugin/src/client/ObsidianMemoryPanel.module.css.mjs
		const css = ".UVjcUW_panel{border-top:1px solid var(--border-color,#e0e0e0);color:var(--text-normal,#333);padding:8px 12px;font-size:13px}.UVjcUW_header{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:12px;font-weight:600;display:flex}.UVjcUW_section{margin-bottom:12px}.UVjcUW_sectionTitle{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px;font-size:11px;font-weight:600}.UVjcUW_toolList{margin:0;padding:0;font-size:12px;list-style:none}.UVjcUW_toolList li{color:var(--text-normal,#333);padding:2px 0}.UVjcUW_toolList code{background:var(--background-modifier-form-field,#f5f5f5);border-radius:3px;padding:1px 4px;font-family:monospace;font-size:11px}.UVjcUW_codeBlock{background:var(--background-modifier-form-field,#f5f5f5);border-radius:4px;margin:0;padding:6px 8px;font-family:monospace;font-size:11px;line-height:1.5;overflow-x:auto}.UVjcUW_tipList{margin:0;padding:0;font-size:12px;list-style:none}.UVjcUW_tipList li{color:var(--text-normal,#333);padding:2px 0}.UVjcUW_tipList li:before{content:\"• \";color:var(--text-muted,#666)}";
		const tagId = "@deepseek-ai/dsh-client-ui-obsidian-memory/ObsidianMemoryPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-obsidian-memory";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ObsidianMemoryPanel_module_css_default = {
			"sectionTitle": "UVjcUW_sectionTitle",
			"codeBlock": "UVjcUW_codeBlock",
			"tipList": "UVjcUW_tipList",
			"section": "UVjcUW_section",
			"toolList": "UVjcUW_toolList",
			"panel": "UVjcUW_panel",
			"header": "UVjcUW_header"
		};
		//#endregion
		//#region src/client/ObsidianMemoryPanel.tsx
		/**
		* Obsidian Memory sidebar panel — static info, no external server.
		*/
		function ObsidianMemoryPanel() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ObsidianMemoryPanel_module_css_default.panel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ObsidianMemoryPanel_module_css_default.header,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "🧠 Obsidian Memory" })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.section,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ObsidianMemoryPanel_module_css_default.sectionTitle,
							children: "Available Tools"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
							className: ObsidianMemoryPanel_module_css_default.toolList,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_read" }), " — read a file"] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_list" }), " — list directory"] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_search" }), " — full-text search"] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_write" }), " — write/overwrite"] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_append" }), " — append to file"] })
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.section,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ObsidianMemoryPanel_module_css_default.sectionTitle,
							children: "Vault Structure"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
							className: ObsidianMemoryPanel_module_css_default.codeBlock,
							children: `Codex/
├── AGENTS.md
├── TODO.md
├── people/
├── projects/
├── notes/
└── daily/`
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.section,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ObsidianMemoryPanel_module_css_default.sectionTitle,
							children: "Usage Tips"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
							className: ObsidianMemoryPanel_module_css_default.tipList,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Ask AI to \"read my AGENTS.md\" to load context" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Say \"append to TODO\" to track open loops" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Use \"search my notes for ...\" to find content" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "AI will auto-summarize and save key decisions" })
							]
						})]
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