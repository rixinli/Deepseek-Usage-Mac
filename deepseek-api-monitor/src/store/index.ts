/** Zustand Store — 应用唯一状态源 */

import { create } from 'zustand'
import type { AppConfig, BalanceResponse, StatusType } from '@/lib/types'
import { getApiQuota, isMockMode, setMockMode } from '@/lib/api'

// ── 完整 Store 类型 ─────────────────────────────────
interface MonitorStore {
  // Config
  apiKey: string
  baseUrl: string
  refreshInterval: number
  startupEnabled: boolean
  startupAsked: boolean
  autoMonitor: boolean

  // Runtime
  status: StatusType
  statusText: string
  isMonitoring: boolean

  // Data
  balanceData: BalanceResponse | null
  lastError: string | null
  lastRefreshTime: number | null

  // Mock
  mockMode: boolean

  // UI
  showSettings: boolean
  showWizard: boolean
  appVersion: string
  platform: string

  // ── Actions ──────────────────────────────────────
  setApiKey: (key: string) => void
  setRefreshInterval: (interval: number) => void
  setStatus: (text: string, type: StatusType) => void
  startMonitoring: () => void
  stopMonitoring: () => void
  toggleMockMode: () => void
  toggleSettings: () => void
  dismissWizard: () => void

  // Async actions
  refreshOnce: () => Promise<void>
  loadConfig: (cfg: Partial<AppConfig>) => void
  setAppInfo: (version: string, platform: string) => void
}

export const useStore = create<MonitorStore>((set, get) => ({
  // ── Initial state ────────────────────────────────
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  refreshInterval: 120,
  startupEnabled: false,
  startupAsked: false,
  autoMonitor: false,

  status: 'idle',
  statusText: '就绪',
  isMonitoring: false,

  balanceData: null,
  lastError: null,
  lastRefreshTime: null,

  mockMode: isMockMode(),

  showSettings: false,
  showWizard: false,
  appVersion: '3.0.0',
  platform: 'darwin',

  // ── Simple setters ───────────────────────────────
  setApiKey: (key: string) => set({ apiKey: key }),
  setRefreshInterval: (interval: number) => set({ refreshInterval: interval }),

  setStatus: (text: string, type: StatusType) =>
    set({ status: type, statusText: text }),

  startMonitoring: () =>
    set({ isMonitoring: true, status: 'monitoring', statusText: '监控中…' }),

  stopMonitoring: () =>
    set({ isMonitoring: false, status: 'idle', statusText: '监控已停止' }),

  toggleMockMode: () => {
    const newMode = !get().mockMode
    setMockMode(newMode)
    set({ mockMode: newMode, statusText: newMode ? 'Mock 模式已启用' : 'Mock 模式已关闭' })
  },

  toggleSettings: () => set(s => ({ showSettings: !s.showSettings })),

  dismissWizard: () => set({ showWizard: false }),

  // ── Async: 单次刷新 ──────────────────────────────
  refreshOnce: async () => {
    const { apiKey, baseUrl } = get()
    if (!apiKey && !get().mockMode) {
      set({ status: 'error', statusText: '请先配置 API Key (⌘,)', lastError: 'No API Key' })
      return
    }

    set({ status: 'loading', statusText: '正在获取…', lastError: null })

    try {
      const data = await getApiQuota(apiKey, baseUrl)

      if ('error' in data && data.error) {
        set({
          status: 'error',
          statusText: data.error,
          lastError: data.error,
          balanceData: null,
        })
      } else {
        set({
          status: get().isMonitoring ? 'monitoring' : 'idle',
          statusText: get().isMonitoring
            ? `监控中 · 每 ${get().refreshInterval} 秒刷新`
            : '已更新',
          balanceData: data as BalanceResponse,
          lastRefreshTime: Date.now(),
          lastError: null,
        })
      }
    } catch (err) {
      const msg = `获取失败: ${String(err)}`
      set({ status: 'error', statusText: msg, lastError: msg })
    }
  },

  // ── Load config from disk (called on startup) ────
  loadConfig: (cfg: Partial<AppConfig>) => set(cfg),

  // ── App info ─────────────────────────────────────
  setAppInfo: (version: string, platform: string) => set({ appVersion: version, platform }),
}))
