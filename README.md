# dsh-client-ui-obsidian-memory

> 🧠 把 Obsidian 变成 DeepSeek Harness 的持久记忆库

在 DSH 侧边栏里直接浏览你的 Obsidian Codex vault，让 AI 记住你的人员、项目、决策和待办事项。

Inspired by [@Saccc_c](https://x.com/Saccc_c)'s Codex memory techniques.

---

## 快速开始（3 分钟跑起来）

### 第 1 步：准备你的 Obsidian Vault

在你的 Obsidian vault 根目录下创建 `Codex/` 文件夹，结构如下：

```
Codex/
├── AGENTS.md          ← AI 的操作说明书（必须）
├── TODO.md            ← 待跟进事项
├── agent/
│   └── open-loops.md  ← 尚未收尾的工作
├── notes/             ← 随手笔记
├── people/            ← 关键人物信息
└── projects/          ← 项目状态
```

**AGENTS.md 示例内容：**

```markdown
# Codex 记忆库操作说明

当了解到以下信息时，更新对应文件：
- 人员 → `people/<name>.md`
- 项目进展 → `projects/<name>.md`
- 决策 → 追加到对应项目文件
- 待办 → `TODO.md` 或 `agent/open-loops.md`

不要存储密钥或敏感隐私信息。
```

### 第 2 步：启动 Preview Server

这个轻量服务器把你的 vault 文件树暴露给 DSH 读取：

```bash
# 方式 A：用 npx 直接跑（推荐）
npx dsh-client-ui-obsidian-memory-server --vault /path/to/your/Obsidian/Codex

# 方式 B：从源码跑
git clone https://github.com/detongz/dsh-client-ui-obsidian-memory.git
cd dsh-client-ui-obsidian-memory/mcp-server
npm install && npm run build
node dist/preview-server.js --vault /path/to/your/Obsidian/Codex
```

默认端口 `3456`。看到 `Preview server listening on http://127.0.0.1:3456` 即成功。

### 第 3 步：在 DSH 里安装插件

```bash
# 进入你的 deepseek-harness 目录
cd /path/to/deepseek-harness

# 安装插件
npm install dsh-client-ui-obsidian-memory

# 或者如果你用 pnpm
pnpm add dsh-client-ui-obsidian-memory
```

在 `packages/bundle/web-app/cordis.patch.yml` 里添加：

```yaml
    - id: ui-obsidian-memory
      name: dsh-client-ui-obsidian-memory
```

> **前置要求**：你的 DSH 版本需要包含 `ui-sidebar` 对 `sidebar.obsidian-memory` slot 的支持（我们已向 deepseek-harness 提交了相关 PR，若未合并可参考下方「手动补丁」）。

### 第 4 步：重启 DSH Web

```bash
npm run build:web   # 或 pnpm run build:web
# 然后重启 dsh web
dsh web
```

打开 `http://127.0.0.1:3080`，在左侧边栏底部即可看到 **🧠 Obsidian Memory** 面板。

---

## 它长什么样

```
┌─────────────────────────────┐
│  DeepSeek Harness Sidebar   │
│                             │
│  [New Session]              │
│  Workspaces ...             │
│                             │
│  🧠 OBSIDIAN MEMORY    ↻    │
│  📄 AGENTS.md               │
│  📄 TODO.md                 │
│  📁 agent                   │
│  📁 notes                   │
│  📁 people                  │
│  📁 projects                │
│                             │
│  ⚙️ Settings                │
└─────────────────────────────┘
```

- 点击 **↻** 刷新文件树
- 点击 **📁** 展开/收起文件夹
- 点击 **📄** 可触发文件打开（需接入 dsh workspace API）

---

## 架构

```
┌─────────────────────────────┐
│ DSH Web (port 3080)         │
│  ┌───────────────────────┐  │
│  │ sidebar.obsidian-memory│  │
│  │  ┌─────────────────┐  │  │
│  │  │ 🧠 Obsidian     │  │  │
│  │  │    Memory Panel │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└──────────┬──────────────────┘
           │ fetch /api/tree
┌──────────▼──────────────────┐
│ Preview Server (port 3456)  │
│ (本仓库的 mcp-server/)      │
└──────────┬──────────────────┘
           │ read FS
┌──────────▼──────────────────┐
│ Obsidian Vault / Codex/     │
└─────────────────────────────┘
```

| 组件 | 职责 |
|------|------|
| **DSH Plugin** (`dsh-client-ui-obsidian-memory`) | 浏览器端：侧边栏面板、文件树渲染 |
| **Preview Server** (`mcp-server/`) | Node 端：读取本地 vault，提供 `/api/tree` HTTP API |
| **Obsidian Vault** | 数据源：Markdown 文件 + 文件夹 |

---

## 故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| 面板显示 "Preview server offline (port 3456)" | preview server 没启动 | 运行 `npx dsh-client-ui-obsidian-memory-server --vault <path>` |
| 面板完全不出现 | slot 未注册 | 确认 `cordis.patch.yml` 里有 `ui-obsidian-memory` 行，且 DSH 版本支持该 slot |
| 文件树为空 | vault 路径错误或目录为空 | 检查 `--vault` 路径指向的是 `Codex/` 文件夹 |
| 点击文件没反应 | `window.dshOpenFile` 未注入 | 这是已知限制，需要 DSH 提供文件打开 API |

---

## 开发

```bash
git clone https://github.com/detongz/dsh-client-ui-obsidian-memory.git
cd dsh-client-ui-obsidian-memory/plugin
npm install
npm run build        # 输出 lib/client.js
npm run watch        # 开发模式自动重建
```

构建产物说明：
- `lib/index.js` — host 入口（空实现，DSH 要求）
- `lib/client.js` — browser bundle（DSH closure-factory 格式，含 CSS 内联）

---

## 手动补丁（如果你的 DSH 尚未合并 slot 支持）

如果你用的 DSH 版本还没有 `sidebar.obsidian-memory` slot，需要手动给 `ui-sidebar` 打补丁：

**`packages/client/ui-sidebar/src/client/contract/slots.ts`**

在 `SlotMap` 里添加：

```ts
'sidebar.obsidian-memory': { kind: 'single'; scope: 'root'; owner: ObsidianMemoryOwnerProps }
```

并添加接口：

```ts
export interface ObsidianMemoryOwnerProps {
  wide: boolean
}
```

**`packages/client/ui-sidebar/src/client/SidebarRoot.tsx`**

在 `regionArea` 之后插入：

```tsx
{wide && (
  <div className={css.regionArea} style={{ flex: '0 0 auto', maxHeight: '280px', overflow: 'auto' }}>
    {renderSlot('sidebar.obsidian-memory', { wide })}
  </div>
)}
```

然后重新构建 `ui-sidebar` 和 `web`。

---

## License

MIT
