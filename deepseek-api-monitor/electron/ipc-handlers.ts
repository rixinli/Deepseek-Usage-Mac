/** IPC 处理器注册 — 桥接 renderer ↔ main process */

import { ipcMain, shell } from 'electron'
import { loadConfig, saveConfig, type ConfigData } from './config'
import { isStartupEnabled, setStartupEnabled } from './auto-start'

export function registerIpcHandlers(): void {
  // ── 配置 ──────────────────────────────────────────
  ipcMain.handle('config:load', async (): Promise<ConfigData> => {
    return loadConfig()
  })

  ipcMain.handle('config:save', async (_event, partial: Partial<ConfigData>): Promise<boolean> => {
    return saveConfig(partial)
  })

  // ── 开机自启动 ────────────────────────────────────
  ipcMain.handle('startup:status', async (): Promise<boolean> => {
    return isStartupEnabled()
  })

  ipcMain.handle('startup:set', async (_event, enabled: boolean): Promise<boolean> => {
    return setStartupEnabled(enabled)
  })

  // ── 应用信息 ──────────────────────────────────────
  ipcMain.handle('app:version', async (): Promise<string> => {
    return '3.0.0'
  })

  ipcMain.handle('app:platform', async (): Promise<string> => {
    return process.platform
  })

  // ── 外部链接 ──────────────────────────────────────
  ipcMain.handle('shell:openExternal', async (_event, url: string): Promise<void> => {
    await shell.openExternal(url)
  })
}
