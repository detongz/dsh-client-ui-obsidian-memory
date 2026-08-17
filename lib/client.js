window.__ModuleLoader__.load({
	id: "dsh-client-ui-obsidian-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/private/tmp/dsh-inspect/dsh-client-ui-obsidian-memory/src/client/ObsidianMemoryPanel.module.css.mjs
		const css = ".K_0wZG_panel{border-top:1px solid var(--border-color,#e0e0e0);color:var(--text-normal,#333);padding:8px 12px;font-size:13px}.K_0wZG_header{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;font-weight:600;display:flex}.K_0wZG_iconBtn{cursor:pointer;color:var(--text-muted,#666);background:0 0;border:none;border-radius:4px;padding:2px 4px;font-size:14px}.K_0wZG_iconBtn:hover{background:var(--background-modifier-hover,#eee)}.K_0wZG_error{color:#dc2626;background:#fef2f2;border-radius:4px;margin-bottom:6px;padding:4px 6px;font-size:11px}.K_0wZG_breadcrumb{color:var(--text-muted,#666);white-space:nowrap;text-overflow:ellipsis;margin-bottom:6px;font-size:11px;overflow:hidden}.K_0wZG_sep{color:var(--text-muted,#666);margin:0 2px}.K_0wZG_crumbBtn{color:var(--text-muted,#666);cursor:pointer;background:0 0;border:none;padding:0;font-size:11px}.K_0wZG_crumbBtn:hover{color:var(--text-normal,#333);text-decoration:underline}.K_0wZG_tree{margin:0 0 8px;padding:0;font-size:12px;list-style:none}.K_0wZG_tree li{margin:1px 0}.K_0wZG_row{cursor:pointer;text-align:left;width:100%;color:var(--text-normal,#333);background:0 0;border:none;border-radius:4px;align-items:center;gap:6px;padding:3px 6px;font-size:12px;display:flex}.K_0wZG_row:hover{background:var(--background-modifier-hover,#eee)}.K_0wZG_rowLabel{text-overflow:ellipsis;white-space:nowrap;flex:1;overflow:hidden}.K_0wZG_empty{color:var(--text-muted,#666);padding:4px 6px;font-size:11px;font-style:italic}.K_0wZG_actions{gap:6px;margin-bottom:8px;display:flex}.K_0wZG_actionBtn{border:1px solid var(--border-color,#e0e0e0);background:var(--background-primary,#fff);color:var(--text-normal,#333);cursor:pointer;border-radius:4px;flex:1;padding:4px 8px;font-size:11px}.K_0wZG_actionBtn:hover{background:var(--background-modifier-hover,#eee)}.K_0wZG_section{border-top:1px solid var(--border-color,#e0e0e0);margin-bottom:8px;padding-top:8px}.K_0wZG_sectionTitle{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px;font-size:10px;font-weight:600}.K_0wZG_quickLinks{flex-direction:column;gap:2px;display:flex}.K_0wZG_linkBtn{cursor:pointer;text-align:left;width:100%;color:var(--text-normal,#333);background:0 0;border:none;border-radius:4px;align-items:center;gap:6px;padding:3px 6px;font-size:12px;display:flex}.K_0wZG_linkBtn:hover{background:var(--background-modifier-hover,#eee)}.K_0wZG_toolList{margin:0;padding:0;font-size:11px;list-style:none}.K_0wZG_toolList li{color:var(--text-normal,#333);padding:1px 0}.K_0wZG_toolList code{background:var(--background-modifier-form-field,#f5f5f5);border-radius:3px;padding:1px 3px;font-family:monospace;font-size:10px}.K_0wZG_info{color:var(--text-muted,#666);padding:4px 0;font-size:11px}";
		const tagId = "dsh-client-ui-obsidian-memory/ObsidianMemoryPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-client-ui-obsidian-memory";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ObsidianMemoryPanel_module_css_default = {
			"empty": "K_0wZG_empty",
			"quickLinks": "K_0wZG_quickLinks",
			"panel": "K_0wZG_panel",
			"crumbBtn": "K_0wZG_crumbBtn",
			"section": "K_0wZG_section",
			"iconBtn": "K_0wZG_iconBtn",
			"sectionTitle": "K_0wZG_sectionTitle",
			"info": "K_0wZG_info",
			"sep": "K_0wZG_sep",
			"row": "K_0wZG_row",
			"actionBtn": "K_0wZG_actionBtn",
			"tree": "K_0wZG_tree",
			"header": "K_0wZG_header",
			"linkBtn": "K_0wZG_linkBtn",
			"actions": "K_0wZG_actions",
			"rowLabel": "K_0wZG_rowLabel",
			"error": "K_0wZG_error",
			"toolList": "K_0wZG_toolList",
			"breadcrumb": "K_0wZG_breadcrumb"
		};
		//#endregion
		//#region src/client/ObsidianMemoryPanel.tsx
		/**
		* Obsidian Memory sidebar panel — vault directory browser.
		* Uses DSH's built-in workspaces.listDirectory / openPath / pickDirectory.
		*/
		const STORAGE_KEY = "obsidian-memory:vaultPath";
		function getSavedVaultPath() {
			try {
				return localStorage.getItem(STORAGE_KEY);
			} catch {
				return null;
			}
		}
		function setSavedVaultPath(path) {
			try {
				localStorage.setItem(STORAGE_KEY, path);
			} catch {}
		}
		function ObsidianMemoryPanel({ workspaces, config }) {
			const configuredVault = config?.vaultPath || getSavedVaultPath();
			const [currentPath, setCurrentPath] = (0, react.useState)(configuredVault);
			const [listing, setListing] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const load = (0, react.useCallback)(async (path) => {
				setLoading(true);
				setError("");
				try {
					const result = await workspaces.listDirectory(path);
					setListing(result);
					if (path) setCurrentPath(path);
				} catch (e) {
					setError(e?.rpcError?.message || e?.message || "Failed to list directory");
				} finally {
					setLoading(false);
				}
			}, [workspaces]);
			(0, react.useEffect)(() => {
				if (currentPath) load(currentPath);
				else load();
			}, []);
			const enter = (entry) => {
				load(entry.path);
			};
			const goUp = () => {
				if (listing && listing.crumbs.length > 1) {
					const parent = listing.crumbs[listing.crumbs.length - 2];
					load(parent.path);
				} else load();
			};
			const pickVault = async () => {
				const path = await workspaces.pickDirectory();
				if (path) {
					setSavedVaultPath(path);
					setCurrentPath(path);
					load(path);
				}
			};
			const openCurrent = () => {
				if (listing) workspaces.openPath(listing.path).catch(() => {});
			};
			const openFile = (absPath) => {
				workspaces.openPath(absPath).catch(() => {});
			};
			const isVault = configuredVault && listing?.path === configuredVault;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ObsidianMemoryPanel_module_css_default.panel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "🧠 Obsidian Memory" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ObsidianMemoryPanel_module_css_default.iconBtn,
							onClick: () => load(currentPath || void 0),
							title: "Refresh",
							children: "↻"
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ObsidianMemoryPanel_module_css_default.error,
						children: error
					}),
					listing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ObsidianMemoryPanel_module_css_default.breadcrumb,
						children: listing.crumbs.map((crumb, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [i > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ObsidianMemoryPanel_module_css_default.sep,
							children: " / "
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ObsidianMemoryPanel_module_css_default.crumbBtn,
							onClick: () => load(crumb.path),
							children: crumb.name === listing.home ? "🏠" : crumb.name
						})] }, crumb.path))
					}),
					listing && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
						className: ObsidianMemoryPanel_module_css_default.tree,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: ObsidianMemoryPanel_module_css_default.row,
								onClick: goUp,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "📂" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ObsidianMemoryPanel_module_css_default.rowLabel,
									children: ".."
								})]
							}) }),
							listing.entries.filter((e) => !e.hidden).map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: ObsidianMemoryPanel_module_css_default.row,
								onClick: () => enter(entry),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "📁" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ObsidianMemoryPanel_module_css_default.rowLabel,
									children: entry.name
								})]
							}) }, entry.path)),
							listing.entries.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
								className: ObsidianMemoryPanel_module_css_default.empty,
								children: "Empty directory"
							})
						]
					}),
					loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ObsidianMemoryPanel_module_css_default.info,
						children: "Loading…"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.actions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ObsidianMemoryPanel_module_css_default.actionBtn,
							onClick: pickVault,
							children: "📂 Select Vault"
						}), listing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ObsidianMemoryPanel_module_css_default.actionBtn,
							onClick: openCurrent,
							children: "📂 Open Folder"
						})]
					}),
					isVault && configuredVault && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.section,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ObsidianMemoryPanel_module_css_default.sectionTitle,
							children: "Quick Open"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ObsidianMemoryPanel_module_css_default.quickLinks,
							children: [["AGENTS.md", `${configuredVault}/AGENTS.md`], ["TODO.md", `${configuredVault}/TODO.md`]].map(([name, path]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: ObsidianMemoryPanel_module_css_default.linkBtn,
								onClick: () => openFile(path),
								children: ["📄 ", name]
							}, name))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.section,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ObsidianMemoryPanel_module_css_default.sectionTitle,
							children: "Memory Tools"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
							className: ObsidianMemoryPanel_module_css_default.toolList,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_read" }) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_list" }) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_search" }) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_write" }) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: "obsidian_memory_append" }) })
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
		const inject = [
			"slots",
			"workspaces",
			"locale"
		];
		/**
		* Factory that creates the props injected into the sidebar occupant.
		* Captures workspaces and config from the cordis context closure.
		*/
		function injected(ctx) {
			return {
				workspaces: ctx.workspaces,
				config: ctx.config
			};
		}
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
				locale: NS,
				inject: () => injected(ctx)
			}, ObsidianMemoryPanel));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map