/** Preload 脚本 — 暴露安全的 IPC API 给 Renderer */

import { contextBridge, ipcRenderer } from 'electron'
import type { ConfigData } from './config'

const electronAPI = {
  // Config
  loadConfig: (): Promise<ConfigData> => ipcRenderer.invoke('config:load'),
  saveConfig: (partial: Partial<ConfigData>): Promise<boolean> =>
    ipcRenderer.invoke('config:save', partial),

  // Auto-start
  getStartupStatus: (): Promise<boolean> => ipcRenderer.invoke('startup:status'),
  setStartupEnabled: (enabled: boolean): Promise<boolean> =>
    ipcRenderer.invoke('startup:set', enabled),

  // App info
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  getPlatform: (): Promise<string> => ipcRenderer.invoke('app:platform'),

  // Shell
  openExternal: (url: string): void => {
    ipcRenderer.invoke('shell:openExternal', url)
  },

  // Menu events (main → renderer)
  onMenuAction: (callback: (action: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string): void =>
      callback(action)
    ipcRenderer.on('menu:action', handler)
    return () => {
      ipcRenderer.removeListener('menu:action', handler)
    }
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for renderer
export type ElectronAPI = typeof electronAPI
