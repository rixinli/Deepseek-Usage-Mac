# DeepSeek API Monitor

DeepSeek API 余额实时监控桌面应用 — 专为开发者打造的轻量工具。Electron + React + TypeScript + Tailwind CSS。

![DeepSeek API Monitor](icon.png)

## 功能

- 📊 **实时余额监控** — 多币种（CNY/USD/EUR），自动定时刷新
- 🔑 **API Key 管理** — 一键测试连接，本地 JSON 配置存储
- 🎛️ **系统托盘** — 关闭窗口隐藏到托盘，后台持续运行
- 🚀 **开机自启** — macOS LaunchAgent 原生支持
- 🧪 **Mock 模式** — 无需 API Key 即可预览完整 UI
- 🌙 **DevOps Dashboard 暗色主题** — 等宽数据 + 极简卡片

## 安装

### 下载 DMG

| 下载源 | 链接 | 适用 |
|--------|------|------|
| **GitHub** | [Releases](https://github.com/rixinli/Deepseek-Usage-Mac/releases) | 海外用户 |
| **Gitee** | [releases 目录](https://gitee.com/rixinlouis/Deepseek-Usage-Mac/tree/main/deepseek-api-monitor/releases) | 国内用户 🚀 |

下载 `.dmg` 文件后，双击打开，拖拽到 Applications 文件夹。

> 首次打开时：**右键点击 App → 打开**（未签名应用需绕过 Gatekeeper）

### 从源码构建

```bash
git clone <repo-url>
cd Deepseek-Usage/deepseek-api-monitor
npm install
npm run package:mac
```

## 使用

1. 首次启动弹出设置向导 → 输入 DeepSeek API Key
2. `⌘R` 开始监控，余额数据自动刷新
3. `⌘,` 打开偏好设置修改配置
4. 关闭窗口 → 最小化到系统托盘

### 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `⌘R` | 开始/停止监控 |
| `⌘⇧R` | 立即刷新 |
| `⌘,` | 偏好设置 |
| `⌘D` | 切换 Mock 模式 |
| `⌘Q` | 退出 |

## 获取 API Key

访问 [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 创建 API Key。

## 技术栈

- **桌面框架**: Electron 33
- **前端**: React 19 + TypeScript + Tailwind CSS 3.4
- **状态管理**: Zustand
- **设计系统**: DevOps Dashboard
- **构建工具**: electron-vite + electron-builder
- **测试**: Vitest

## License

MIT
