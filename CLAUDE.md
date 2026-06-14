# DeepSeek API Monitor

DeepSeek API 余额实时监控桌面应用。Electron + React + TypeScript + Tailwind CSS，macOS 原生风格。

## 快速启动

```bash
cd deepseek-api-monitor
npm install        # 安装依赖
npm run dev        # 开发模式（热更新 + DevTools）
npm run build      # 生产构建
npm run package:mac # 打包 macOS .app / .dmg
npm test           # 运行测试
```

## 项目架构

```
deepseek-api-monitor/
├── electron/                    # Electron 主进程 (Node.js)
│   ├── main.ts                  # 窗口管理、应用生命周期、单实例锁
│   ├── preload.ts               # contextBridge 安全 API 暴露
│   ├── ipc-handlers.ts          # IPC 处理器注册
│   ├── config.ts                # JSON 配置文件读写（替代旧 config.py）
│   ├── auto-start.ts            # macOS LaunchAgent 开机自启
│   ├── menu.ts                  # 原生 macOS 菜单栏 + ⌘快捷键
│   └── tray.ts                  # 系统托盘图标与菜单
│
├── src/                         # Renderer 进程 (React)
│   ├── main.tsx                 # React 入口
│   ├── App.tsx                  # 根组件：布局、生命周期、键盘快捷键
│   ├── components/
│   │   ├── BalanceCard.tsx      # 单币种余额卡片（DevOps Dashboard）
│   │   ├── BalanceDisplay.tsx   # 余额卡片网格容器
│   │   ├── AccountStatus.tsx    # 账户可用性横幅
│   │   ├── StatusBar.tsx        # 底部状态栏
│   │   ├── SettingsDialog.tsx   # 偏好设置模态框 (⌘,)
│   │   ├── SetupWizard.tsx      # 首次设置向导
│   │   ├── ApiKeySection.tsx    # 共享：API Key 输入 + 显示切换
│   │   └── ConnectionTest.tsx   # 共享：测试连接按钮 + 行内结果
│   ├── hooks/
│   │   └── useMonitoring.ts     # setInterval 定时刷新
│   ├── lib/
│   │   ├── api.ts               # DeepSeek REST 客户端 + Mock 模式
│   │   ├── types.ts             # TypeScript 类型定义
│   │   └── format.ts            # 数字/货币格式化
│   ├── store/
│   │   └── index.ts             # Zustand 全局状态管理
│   └── styles/
│       └── index.css            # Tailwind + Design Tokens
│
├── resources/                   # 应用图标 (icon.png / icon.icns / icon.ico)
├── index.html                   # Vite HTML 入口
├── electron.vite.config.ts      # electron-vite 构建配置
├── electron-builder.yml         # electron-builder 打包配置
├── tailwind.config.ts           # Tailwind + DevOps Dashboard 设计令牌
└── vitest.config.ts             # 测试配置
```

## 设计系统 — DevOps Dashboard

| Token | Value | 用途 |
|-------|-------|------|
| `ds-bg` | `#0f172a` (slate-900) | 主背景 |
| `ds-surface` | `#1e293b` (slate-800) | 卡片/面板背景 |
| `ds-border` | `#334155` (slate-700) | 1px 边框 |
| `ds-primary` | `#2dd4bf` (teal-400) | 强调色、状态指示 |
| `ds-accent` | `#0ea5e9` (sky-500) | 焦点环、链接 |

- 数据字体：JetBrains Mono，等宽右对齐
- UI 字体：系统原生 -apple-system
- 卡片：12px 圆角、20px padding、1px 实色边框（无阴影）

## 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| ⌘R | 开始/停止监控 |
| ⌘. | 停止监控 |
| ⌘⇧R | 立即刷新 |
| ⌘, | 偏好设置 |
| ⌘D | 切换 Mock 模式 |
| ⌘Q | 退出 |

## 数据流

```
Renderer (React)                     Main Process (Electron)
┌──────────────────┐                ┌──────────────────────┐
│ Zustand Store    │                │ config.ts            │
│ - config         │◀─── IPC ──────│ (JSON read/write)    │
│ - status         │                │ auto-start.ts        │
│ - balanceData    │                │ (LaunchAgent/shortcut)│
│ - mockMode       │                │ tray.ts + menu.ts    │
│                  │                └──────────────────────┘
│ useMonitoring()  │─── fetch() ──▶ DeepSeek API
│ (setInterval)    │                /user/balance
└──────────────────┘
```

- 配置持久化通过 IPC 走主进程 fs 操作
- API 调用在渲染进程直接用 fetch()，无需 IPC 中转
- 菜单/托盘事件通过 IPC 从主进程发往渲染进程

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS 3.4
- **状态管理**: Zustand
- **桌面框架**: Electron 33 (electron-vite 构建)
- **测试**: Vitest + @testing-library/react
- **打包**: electron-builder → macOS .app / .dmg
