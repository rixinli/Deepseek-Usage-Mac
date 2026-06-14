/** Electron 主进程入口 */

import { app, BrowserWindow, type WebContents } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'
import { createMenu } from './menu'
import { createTray, destroyTray } from './tray'
import { loadConfig } from './config'

let mainWindow: BrowserWindow | null = null

// ── 窗口属性 ────────────────────────────────────────
const WINDOW_WIDTH = 680
const WINDOW_HEIGHT = 520
const MIN_WIDTH = 500
const MIN_HEIGHT = 350

function getPreloadPath(): string {
  return join(__dirname, '../preload/index.js')
}

function getRendererUrl(): string {
  if (process.env.ELECTRON_RENDERER_URL) {
    return process.env.ELECTRON_RENDERER_URL
  }
  return `file://${join(__dirname, '../renderer/index.html')}`
}

// ── 创建主窗口 ──────────────────────────────────────
function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    title: 'DeepSeek API Monitor',
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    // macOS 原生外观
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    visualEffectState: process.platform === 'darwin' ? 'active' : undefined,
  })

  // 隐藏到托盘（不退出）
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      win.hide()
    }
  })

  // 窗口准备好后显示（避免白屏闪烁）
  win.once('ready-to-show', () => {
    win.show()
  })

  return win
}

// ── 加载配置并通知 renderer ─────────────────────────
async function initApp(win: BrowserWindow): Promise<void> {
  const config = loadConfig()

  // 等待 renderer 准备好后再发送
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('config:loaded', config)

    // 如果配置了自动监控，触发之
    if (config.autoMonitor && config.apiKey) {
      setTimeout(() => {
        win.webContents.send('menu:action', 'start-monitoring')
      }, 500)
    }
  })
}

// ── App 生命周期 ────────────────────────────────────
app.whenReady().then(async () => {
  // 注册 IPC handlers
  registerIpcHandlers()

  // 创建窗口
  mainWindow = createWindow()
  createMenu(mainWindow)
  createTray(mainWindow)

  // 初始化
  await initApp(mainWindow)

  // 加载 renderer
  mainWindow.loadURL(getRendererUrl())

  // macOS: 点击 Dock 图标重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
      createMenu(mainWindow)
      createTray(mainWindow)
      initApp(mainWindow)
      mainWindow.loadURL(getRendererUrl())
    } else {
      mainWindow?.show()
    }
  })
})

// 所有窗口关闭时的行为
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 退出前清理
app.on('before-quit', () => {
  ;(app as unknown as { isQuitting: boolean }).isQuitting = true
  destroyTray()
})

// 防止多实例
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// 全局类型扩展
declare module 'electron' {
  interface App {
    isQuitting?: boolean
  }
}
