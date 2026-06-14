# 发布指南 — GitHub + Gitee 仓库 & Release

## 1. GitHub 仓库

### 创建仓库
在浏览器打开 https://github.com/new，创建 `Deepseek-Usage-Mac` 仓库（Public），**不要**勾选 Initialize with README。

### 推送代码
```bash
cd /Users/louis/works/Deepseek-Usage-Mac
git remote add origin git@github.com:<你的用户名>/Deepseek-Usage-Mac.git
git branch -M main
git push -u origin main
```

## 2. Gitee 镜像仓库

### 创建 Gitee 仓库
在浏览器打开 https://gitee.com/projects/new，创建同名 `Deepseek-Usage-Mac` 仓库（Public），不要初始化任何文件。

### 配置双推送
```bash
git remote add gitee git@gitee.com:<你的用户名>/Deepseek-Usage-Mac.git
git push -u gitee main
```

### 后续同步策略
每次发布时同时推两个 remote：
```bash
git push origin main && git push gitee main
```

或者设置一个 push URL 包含两个目标：
```bash
git remote set-url origin --add git@gitee.com:<你的用户名>/Deepseek-Usage-Mac.git
```

## 3. GitHub Release

### 手动创建 Release
1. 本地打包：
```bash
cd deepseek-api-monitor
npm run build
rm -rf release/mac release/*.dmg release/*.blockmap
npx electron-builder --mac dmg --x64
```

2. 在 GitHub 仓库页面 → Releases → Create a new release
3. Tag: `v3.0.0`
4. Title: `DeepSeek API Monitor v3.0 — Electron/React 重写`
5. 上传 `release/DeepSeek-API-Monitor-3.0.0-x64.dmg`
6. Release notes:

```markdown
## DeepSeek API Monitor v3.0

完全重写：Python/tkinter → Electron + React + TypeScript + Tailwind

### 新特性
- 🎨 DevOps Dashboard 暗色主题 — 等宽数据 + 极简卡片
- ⌘V 剪贴板修复 — 原生 macOS 编辑菜单
- ⏱ 倒计时计数器 — 实时显示距下次刷新秒数
- 🖱 窗口拖拽 — hiddenInset 标题栏可拖拽
- 🧪 Mock 模式 — 无需 API Key 预览完整 UI
- 🍎 arm64 + x64 双架构 DMG

### 安装
1. 下载 `DeepSeek-API-Monitor-3.0.0-x64.dmg`
2. 双击打开，拖拽到 Applications
3. 首次打开：右键 → 打开（绕过 Gatekeeper）

### 技术栈
Electron 33 · React 19 · TypeScript · Tailwind CSS · Zustand
```

## 4. Gitee Release 同步

Gitee 不支持直接上传二进制附件到 Release（免费版限制）。替代方案：

### 方案 A：Gitee Pages + 直链
1. 启用 Gitee Pages（仓库 → 服务 → Gitee Pages）
2. 把 DMG 推到 `release/` 目录下
3. README 中链接指向 GitHub Release

### 方案 B：仅 GitHub Release
Gitee README 中写：
```markdown
## 下载
最新版本请前往 [GitHub Releases](https://github.com/<用户名>/Deepseek-Usage-Mac/releases) 下载 DMG。
```

## 5. 自动发布（可选 GitHub Actions）

创建 `.github/workflows/release.yml`：

```yaml
name: Build & Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd deepseek-api-monitor && npm ci
      - run: cd deepseek-api-monitor && npm run build
      - run: cd deepseek-api-monitor && npx electron-builder --mac dmg --x64
      - uses: softprops/action-gh-release@v1
        with:
          files: deepseek-api-monitor/release/*.dmg
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Tag push 自动触发：
```bash
git tag v3.0.0 && git push origin v3.0.0
```
