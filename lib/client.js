window.__ModuleLoader__.load({
	id: "dsh-client-ui-obsidian-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:src/client/ObsidianMemoryPanel.module.css.mjs
		const css = ".qfzMWq_panel{border-top:1px solid var(--border-color,#e0e0e0);color:var(--text-normal,#333);padding:8px 12px;font-size:13px}.qfzMWq_header{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;font-weight:600;display:flex}.qfzMWq_iconBtn{cursor:pointer;color:var(--text-muted,#666);background:0 0;border:none;border-radius:4px;padding:2px 4px;font-size:14px}.qfzMWq_iconBtn:hover{background:var(--background-modifier-hover,#eee)}.qfzMWq_error{color:#dc2626;background:#fef2f2;border-radius:4px;margin-bottom:6px;padding:4px 6px;font-size:11px}.qfzMWq_hint{color:var(--text-muted,#666);background:var(--background-modifier-form-field,#f5f5f5);border:1px dashed var(--border-color,#e0e0e0);border-radius:4px;margin-bottom:8px;padding:6px 8px;font-size:11px;line-height:1.5}.qfzMWq_breadcrumb{color:var(--text-muted,#666);white-space:nowrap;text-overflow:ellipsis;margin-bottom:6px;font-size:11px;overflow:hidden}.qfzMWq_sep{color:var(--text-muted,#666);margin:0 2px}.qfzMWq_crumbBtn{color:var(--text-muted,#666);cursor:pointer;background:0 0;border:none;padding:0;font-size:11px}.qfzMWq_crumbBtn:hover{color:var(--text-normal,#333);text-decoration:underline}.qfzMWq_tree{margin:0 0 8px;padding:0;font-size:12px;list-style:none}.qfzMWq_tree li{margin:1px 0}.qfzMWq_row{cursor:pointer;text-align:left;width:100%;color:var(--text-normal,#333);background:0 0;border:none;border-radius:4px;align-items:center;gap:6px;padding:3px 6px;font-size:12px;display:flex}.qfzMWq_row:hover{background:var(--background-modifier-hover,#eee)}.qfzMWq_rowLabel{text-overflow:ellipsis;white-space:nowrap;flex:1;overflow:hidden}.qfzMWq_empty{color:var(--text-muted,#666);padding:4px 6px;font-size:11px;font-style:italic}.qfzMWq_actions{gap:6px;margin-bottom:8px;display:flex}.qfzMWq_actionBtn{border:1px solid var(--border-color,#e0e0e0);background:var(--background-primary,#fff);color:var(--text-normal,#333);cursor:pointer;border-radius:4px;flex:1;padding:4px 8px;font-size:11px}.qfzMWq_actionBtn:hover{background:var(--background-modifier-hover,#eee)}.qfzMWq_section{border-top:1px solid var(--border-color,#e0e0e0);margin-bottom:8px;padding-top:8px}.qfzMWq_sectionTitle{color:var(--text-muted,#666);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px;font-size:10px;font-weight:600}.qfzMWq_quickLinks{flex-direction:column;gap:2px;display:flex}.qfzMWq_linkBtn{cursor:pointer;text-align:left;width:100%;color:var(--text-normal,#333);background:0 0;border:none;border-radius:4px;align-items:center;gap:6px;padding:3px 6px;font-size:12px;display:flex}.qfzMWq_linkBtn:hover{background:var(--background-modifier-hover,#eee)}.qfzMWq_toolList{margin:0;padding:0;font-size:11px;list-style:none}.qfzMWq_toolList li{color:var(--text-normal,#333);padding:1px 0}.qfzMWq_toolList code{background:var(--background-modifier-form-field,#f5f5f5);border-radius:3px;padding:1px 3px;font-family:monospace;font-size:10px}.qfzMWq_info{color:var(--text-muted,#666);padding:4px 0;font-size:11px}";
		const tagId = "dsh-client-ui-obsidian-memory/ObsidianMemoryPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-client-ui-obsidian-memory";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ObsidianMemoryPanel_module_css_default = {
			"actionBtn": "qfzMWq_actionBtn",
			"actions": "qfzMWq_actions",
			"breadcrumb": "qfzMWq_breadcrumb",
			"crumbBtn": "qfzMWq_crumbBtn",
			"empty": "qfzMWq_empty",
			"error": "qfzMWq_error",
			"header": "qfzMWq_header",
			"hint": "qfzMWq_hint",
			"iconBtn": "qfzMWq_iconBtn",
			"info": "qfzMWq_info",
			"linkBtn": "qfzMWq_linkBtn",
			"panel": "qfzMWq_panel",
			"quickLinks": "qfzMWq_quickLinks",
			"row": "qfzMWq_row",
			"rowLabel": "qfzMWq_rowLabel",
			"section": "qfzMWq_section",
			"sectionTitle": "qfzMWq_sectionTitle",
			"sep": "qfzMWq_sep",
			"toolList": "qfzMWq_toolList",
			"tree": "qfzMWq_tree"
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
					const msg = e?.rpcError?.message || e?.message || "";
					if (/browse capability|directoryPicker|waiting for service|not activated/i.test(msg)) setError("This DSH profile cannot browse the host filesystem. Open the plugin in a native/desktop DSH (or a bridge that provides the browse capability) to view the vault.");
					else setError(msg || "Failed to list directory");
				} finally {
					setLoading(false);
				}
			}, [workspaces]);
			(0, react.useEffect)(() => {
				if (currentPath) load(currentPath);
			}, []);
			const enter = (entry) => {
				load(entry.path);
			};
			const goUp = () => {
				if (listing && listing.crumbs.length > 1) {
					const parent = listing.crumbs[listing.crumbs.length - 2];
					load(parent.path);
				} else if (currentPath) load(currentPath);
			};
			const pickVault = async () => {
				try {
					const path = await workspaces.pickDirectory();
					if (path) {
						setSavedVaultPath(path);
						setCurrentPath(path);
						load(path);
					}
				} catch (e) {
					const msg = e?.rpcError?.message || e?.message || "";
					setError(/browse capability|directoryPicker|waiting for service|not activated/i.test(msg) ? "The directory picker is unavailable in this profile. Set vaultPath in the host config, or open in a native DSH." : msg || "Failed to open the directory picker");
				}
			};
			const openInHost = (absPath) => {
				const w = workspaces;
				if (typeof w.openPath === "function") w.openPath(absPath).catch(() => {});
				else navigator.clipboard?.writeText(absPath).catch(() => {});
			};
			const openCurrent = () => {
				if (listing) openInHost(listing.path);
			};
			const openFile = (absPath) => {
				openInHost(absPath);
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
					!configuredVault && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ObsidianMemoryPanel_module_css_default.hint,
						children: [
							"No Obsidian vault selected yet. Click ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: "📂 Select Vault" }),
							" below to choose the folder this plugin should browse. Your choice is remembered on this device."
						]
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
		//#region src/client/ObsidianMemoryIcon.tsx
		function ObsidianMemoryIcon({ size, active }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				style: {
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					width: size,
					height: size,
					fontSize: Math.max(12, Math.round(size * .8)),
					lineHeight: 1,
					opacity: active ? 1 : .72,
					filter: active ? "none" : "grayscale(0.25)",
					transition: "opacity 120ms ease, filter 120ms ease"
				},
				children: "🧠"
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
		/**
		* Panel id shared by the sidebar entry and the main-slot occupant. The sidebar
		* row calls `ctx.layout.selectPanel(PANEL_ID)`; the layout renders the `main`
		* occupant whose `key` matches, so the two MUST stay equal.
		*/
		const PANEL_ID = "obsidian-memory";
		/** Required services (cordis fiber inject).
		*  NOTE: `config` is intentionally NOT injected. The client half runs in the
		*  browser where cordis does not provide a `config` service (it exists only on
		*  the host fiber), so injecting it leaves the entry "pending (waiting for
		*  service: config)" and the plugin never activates. The vault path is instead
		*  resolved on the client from localStorage / the directory picker, and (planned)
		*  from a host-provided typert Remote. */
		const inject = [
			"slots",
			"uiWorkspace",
			"locale"
		];
		/**
		* Factory that creates the props injected into the main-panel occupant.
		* The directory browser service is `uiWorkspace` on the client (renamed from
		* the older `workspaces` name). `listDirectory` / `pickDirectory` /
		* `createDirectory` live there; `openPath` does not exist client-side, so the
		* panel degrades file "open" to clipboard copy.
		*
		* The vault path is NOT read from `ctx.config` (unavailable on the client);
		* the panel resolves it from localStorage / the directory picker instead.
		*/
		function injected(ctx) {
			return { workspaces: ctx.uiWorkspace };
		}
		/**
		* Register the Obsidian Memory sidebar icon and its main panel.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-obsidian-memory: dictionaries");
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: 50,
				label: "Obsidian Memory"
			}, ObsidianMemoryIcon));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
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