---
name: electron-packaging-pitfalls
description: Electron 项目从开发到打包的常见坑和修复方案，汇总自 DeepSeek API Monitor v3 实战经验
metadata:
  type: reference
  platform: macOS + Electron 33 + electron-vite 2.3 + React 19
  date: 2026-06-14
---

# Electron 打包常见坑 & 修复手册

> 来源：DeepSeek API Monitor 从 Python/tkinter → Electron/React 完整重写过程中的实战问题。

---

## 1. Electron 二进制安装不完整

**现象：** `npm install` 成功后 `npx electron --version` 报错 "Electron failed to install correctly"，或 `open .app` 报 "incorrect executable format"。

**根因：** `electron` 包的 postinstall 脚本下载 zip 后解压可能失败，导致 `dist/Electron.app/Contents/Frameworks/` 目录缺失，只剩一个空壳 `MacOS/Electron` 二进制。

**排查：**
```bash
ls node_modules/electron/dist/Electron.app/Contents/Frameworks/
# 如果只有 MacOS/ 和 Resources/，没有 Frameworks/ → 安装不完整
```

**修复：**
```bash
# 1. 找到缓存的 zip
CACHE_ZIP=$(find ~/Library/Caches/electron -name "electron-*.zip" | head -1)

# 2. 删除损坏的 dist，手动解压
rm -rf node_modules/electron/dist
mkdir -p node_modules/electron/dist
unzip -q "$CACHE_ZIP" -d node_modules/electron/dist/

# 3. 确保 path.txt 无尾随换行
printf "Electron.app/Contents/MacOS/Electron" > node_modules/electron/path.txt

# 4. 验证
npx electron --version
```

**关键点：** `path.txt` 不能有尾随 `\n`，否则路径会变成 `Electron\n` 导致 `ENOENT`。

---

## 2. 渲染进程中使用 `process.platform` 导致白屏

**现象：** Electron 窗口一片空白，DevTools Console 无任何输出（React 渲染树直接崩溃）。

**根因：** 在 `contextIsolation: true` + `nodeIntegration: false` 的渲染进程中，Node.js 全局变量（`process`、`__dirname` 等）不可用。JSX 中直接写 `{ process.platform === 'darwin' ? ... }` 会抛出 `ReferenceError`，React 整个树崩溃。

**错误写法：**
```tsx
// ❌ 渲染进程中 process 不可用
style={{ paddingTop: process.platform === 'darwin' ? '38px' : '0px' }}
```

**正确写法：**
```tsx
// ✅ 通过 preload IPC 获取平台信息，存入 Zustand store
const platform = useStore(s => s.platform)
style={{ paddingTop: platform === 'darwin' ? '38px' : '0px' }}
```

**排查：** 用 `grep -rn 'process\.' src/` 扫描所有渲染进程代码。

---

## 3. 自定义菜单缺少"编辑"菜单导致 ⌘C/⌘V 失效

**现象：** 输入框中无法使用 Cmd+C/Cmd+V/Cmd+X，但系统其他应用的剪贴板正常。

**根因：** Electron macOS 应用中，标准剪贴板快捷键需要通过菜单项的 `role` 属性来激活。如果用 `Menu.buildFromTemplate()` 替换了默认菜单但没加编辑菜单，这些快捷键会被框架拦截后丢弃。

**修复 — 必须在菜单模板中加入：**
```ts
{
  label: '编辑',
  submenu: [
    { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
    { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
    { type: 'separator' },
    { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
    { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
    { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
    { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
  ],
}
```

**注意：** `role: 'cut'/'copy'/'paste'` 必须配合对应的 accelerator 使用，否则在 macOS 上不生效。

---

## 4. `<body>` 上的 `select-none` 阻止输入框交互

**现象：** 输入框可以聚焦但不能选择文本、右键菜单异常。

**根因：** 在 `<body>` 标签上设置 Tailwind 的 `select-none` 类（`user-select: none`），会影响所有子元素的文本交互行为。

**修复：** 将 `select-none` 从 `<body>` 移除，只加在不需要选择的特定元素上（如状态栏标签）。

---

## 5. `titleBarStyle: 'hiddenInset'` 导致窗口不可拖拽

**现象：** 窗口无法通过标题栏拖拽移动。

**根因：** 隐藏原生标题栏后，macOS 不再自动提供拖拽区域，必须在 Web 内容中手动用 `-webkit-app-region: drag` 指定。

**修复：**
```tsx
{/* 在页面顶部添加可拖拽区域 */}
<div
  className="h-[38px] absolute top-0 left-0 right-0 z-10"
  style={{ WebkitAppRegion: 'drag' as any }}
/>
```

**注意：** 拖拽区域内的按钮/输入框需要 `-webkit-app-region: no-drag` 才能正常交互。拖拽区域的父容器需要有 `position: relative`。

---

## 6. DevTools 忘记关掉就打包

**现象：** 打包后的 .app 启动时自动弹出 DevTools 面板。

**根因：** 开发调试时在 `main.ts` 的 `ready-to-show` 事件中加了 `win.webContents.openDevTools()`，忘记在打包前移除。

**最佳实践：** 用环境变量控制：
```ts
win.once('ready-to-show', () => {
  win.show()
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' })
  }
})
```

---

## 7. 架构不匹配 — arm64 装到 Intel Mac 上

**现象：** `open /Applications/MyApp.app` 报 "incorrect executable format"。

**根因：** 构建时指定了 `--arm64`，但目标机器是 Intel (x86_64)。`uname -m` 返回值取决于 shell 进程的架构而非硬件。

**正确检测硬件架构：**
```bash
# 检测真实硬件（不受 Rosetta shell 影响）
sysctl -n machdep.cpu.brand_string   # → "Intel(R) Core(TM) i9-9880H..."
# 或
sysctl -n sysctl.proc_translated     # → 1 = Rosetta, 0/error = native
```

**electron-builder 跨架构打包：**
```bash
# 同时打两个架构
npx electron-builder --mac dmg --x64 --arm64

# 或者打 universal (fat binary)
npx electron-builder --mac dmg --universal
```

---

## 8. 单实例锁阻止开发重启

**现象：** 杀掉 `npm run dev` 后重新启动，新的 Electron 窗口打不开。

**根因：** `app.requestSingleInstanceLock()` 阻止多实例。旧进程未被完全杀死（尤其是 GPU/Network helper 进程），锁文件残留。

**修复：**
```bash
# 彻底清理
pkill -9 -f "Electron.*your-app-name"
pkill -9 -f "electron-vite"
lsof -ti:5173 | xargs kill -9
sleep 2
# 清理锁文件
rm -f ~/Library/Application\ Support/your-app-name/SingletonLock
```

---

## 9. electron-vite 入口文件命名

**现象：** electron-vite build 报 "An entry point is required" 或 "No electron app entry file found: out/main/index.js"。

**根因：** electron-vite 硬编码了输出文件名必须是 `index.js`（`out/main/index.js`、`out/preload/index.js`）。

**正确的 electron.vite.config.ts：**
```ts
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/main.ts') },
        output: { entryFileNames: '[name].js' },  // → index.js
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/preload.ts') },
        output: { entryFileNames: '[name].js' },
      },
    },
  },
  // ...
})
```

**关键：** `entryFileNames: '[name].js'` 确保输出 `index.js` 而不是 `main.js`。electron-vite 内部直接用 `join(root, 'out', 'main', 'index.js')` 查找入口，不读 `package.json` 的 `main` 字段。

---

## 10. electron-vite 2.x 与 Vite 版本兼容

**现象：** `npm install` 报 `ERESOLVE unable to resolve dependency tree`。

**根因：** `electron-vite@2.3.0` 的 peer dependency 是 `vite@^4.0.0 || ^5.0.0`，不兼容 Vite 6。

**修复：** `package.json` 中固定 `"vite": "^5.4.0"`。

---

## 11. npm 工作目录混乱

**现象：** `npm run dev` 报 `Missing script: "dev"`。

**根因：** 项目重构后根目录的 `package.json` 被删除，但 `cd` 未进入子目录 `deepseek-api-monitor/` 就执行了 npm 命令。

**预防：** 在 README 和 CLAUDE.md 中明确标注启动命令的完整路径：
```bash
cd deepseek-api-monitor && npm run dev
```

---

## 12. Electron 打包后的代码签名警告

**现象：** electron-builder 输出 "skipped macOS application code signing"。

**影响：** macOS Gatekeeper 会阻止直接双击打开。用户需右键 → 打开绕过。不影响功能，但发布时需要 Apple Developer ID 签名。

**本地绕过命令：**
```bash
# 移除 quarantine 标记（仅本地使用）
xattr -cr "/Applications/DeepSeek API Monitor.app"

# 或重新签名
codesign --force --deep --sign - "/Applications/DeepSeek API Monitor.app"
```

---

## 打包前检查清单

- [ ] `grep -rn 'process\.' src/` — 渲染进程无 Node.js API 直接引用
- [ ] `grep -rn 'openDevTools' electron/` — 无遗留调试代码
- [ ] 菜单模板包含带 `role: 'cut'/'copy'/'paste'` 的编辑菜单
- [ ] `<body>` 无 `select-none` / 全局禁用交互的 CSS
- [ ] `hiddenInset` 配合 `-webkit-app-region: drag` 使用
- [ ] `electron.vite.config.ts` 中 `entryFileNames: '[name].js'`
- [ ] `package.json` 中 `vite` 版本兼容 `electron-vite`
- [ ] 用 `sysctl -n machdep.cpu.brand_string` 确认目标架构
- [ ] `cp -R` 时确保目标路径用引号包裹（空格路径）
