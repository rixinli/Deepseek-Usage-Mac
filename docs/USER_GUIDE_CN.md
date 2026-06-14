# DeepSeek API Monitor — 用户指南

跨平台桌面应用（macOS / Windows），实时监控 DeepSeek API 账户余额。

## 获取 API Key

1. 打开 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 点击左侧「API Keys」→「创建 API Key」，复制生成的 Key

> ⚠️ API Key 相当于账户密码，请勿泄露。

---

## 安装

### macOS

下载 `DeepSeek_API_Monitor.app.zip`，解压拖入「应用程序」文件夹。首次打开时右键点击 App →「打开」。

### Windows

下载安装包或绿色版 EXE 直接运行。

---

## 使用说明

### 首次设置

首次启动会弹出欢迎窗口，输入 API Key、选择偏好，点击「开始监控」即可。

### 日常使用

所有操作通过**菜单栏**和**键盘快捷键**完成：

| 操作 | 快捷键 | 菜单位置 |
|------|--------|----------|
| 开始/停止监控 | ⌘R (Ctrl+R) | 监控 → 开始/停止监控 |
| 立即刷新 | ⌘⇧R (Ctrl+Shift+R) | 监控 → 立即刷新 |
| 偏好设置 | ⌘, (Ctrl+,) | DeepSeek → 偏好设置 |
| Mock 模式 | ⌘D (Ctrl+D) | 监控 → Mock 模式 |
| 隐藏窗口 | ⌘W (Ctrl+W) | — |
| 退出 | ⌘Q (Ctrl+Q) | DeepSeek → 退出 |

### 偏好设置 (⌘,)

- **API Key**: 输入/修改密钥，可测试连接
- **Monitoring**: 刷新间隔（30-600 秒，推荐 120-300）
- **Startup**: 登录时自动启动、启动后自动监控

---

## 配置文件

macOS: `~/Library/Application Support/DeepSeek API Monitor/deepseek_config.ini`
Windows: `%APPDATA%\DeepSeek API Monitor\deepseek_config.ini`

删除此文件可重置所有配置。

---

## 常见问题

### 显示「API Key 无效」？
在 [DeepSeek 平台](https://platform.deepseek.com/api_keys) 确认 Key 是否有效。

### 显示「网络错误」？
检查网络连接，确认能访问 `https://api.deepseek.com`。

### macOS 开机自启动不生效？
打开偏好设置 (⌘,)，取消「登录时自动启动」后重新勾选保存。

---

## 版本

v2.5.0 · MIT License
