/** 所有 TypeScript 类型定义 */

// ── DeepSeek API 响应 ──────────────────────────────
export interface BalanceInfo {
  currency: string
  total_balance: string
  granted_balance: string
  topped_up_balance: string
}

export interface BalanceResponse {
  is_available: boolean
  balance_infos: BalanceInfo[]
  _endpoint?: string
}

export interface ApiError {
  error: string
  note?: string
}

export type ApiResult = BalanceResponse | ApiError

// ── 应用配置 ────────────────────────────────────────
export interface AppConfig {
  apiKey: string
  baseUrl: string
  refreshInterval: number  // 30-600, default 120
  startupEnabled: boolean
  startupAsked: boolean
  autoMonitor: boolean
}

// ── 运行时状态 ──────────────────────────────────────
export type StatusType = 'idle' | 'monitoring' | 'error' | 'loading'

export interface MonitorState {
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

  // Balance data
  balanceData: BalanceResponse | null
  lastError: string | null
  lastRefreshTime: number | null

  // Mock mode
  mockMode: boolean

  // UI state
  showSettings: boolean
  showWizard: boolean
}

// ── IPC 接口 ────────────────────────────────────────
export interface ElectronAPI {
  loadConfig: () => Promise<AppConfig>
  saveConfig: (config: Partial<AppConfig>) => Promise<boolean>
  getStartupStatus: () => Promise<boolean>
  setStartupEnabled: (enabled: boolean) => Promise<boolean>
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  openExternal: (url: string) => void
  onMenuAction: (callback: (action: string) => void) => () => void
}

// ── 货币符号映射 ────────────────────────────────────
export const CURRENCY_SYMBOLS: Record<string, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
}
