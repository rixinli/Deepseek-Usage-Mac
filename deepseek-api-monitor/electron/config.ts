/** 配置管理 — JSON 文件读写，替代 Python config.py */

import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export interface ConfigData {
  apiKey: string
  baseUrl: string
  refreshInterval: number
  startupEnabled: boolean
  startupAsked: boolean
  autoMonitor: boolean
}

const CONFIG_DIR_NAME = 'DeepSeek API Monitor'
const CONFIG_FILE_NAME = 'config.json'

const DEFAULTS: ConfigData = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  refreshInterval: 120,
  startupEnabled: false,
  startupAsked: false,
  autoMonitor: false,
}

// ── 配置文件路径 (跨平台) ────────────────────────────
function getConfigPath(): string {
  if (process.platform === 'darwin') {
    return path.join(app.getPath('home'), 'Library', 'Application Support', CONFIG_DIR_NAME, CONFIG_FILE_NAME)
  } else if (process.platform === 'win32') {
    return path.join(app.getPath('appData'), CONFIG_DIR_NAME, CONFIG_FILE_NAME)
  } else {
    return path.join(app.getPath('home'), '.config', CONFIG_DIR_NAME, CONFIG_FILE_NAME)
  }
}

// ── 加载配置 ─────────────────────────────────────────
export function loadConfig(): ConfigData {
  const configPath = getConfigPath()
  const config: ConfigData = { ...DEFAULTS }

  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8')
      const saved = JSON.parse(raw) as Partial<ConfigData>

      // 合并：文件值覆盖默认值
      if (typeof saved.apiKey === 'string') config.apiKey = saved.apiKey
      if (typeof saved.baseUrl === 'string') config.baseUrl = saved.baseUrl
      if (typeof saved.refreshInterval === 'number') config.refreshInterval = saved.refreshInterval
      if (typeof saved.startupEnabled === 'boolean') config.startupEnabled = saved.startupEnabled
      if (typeof saved.startupAsked === 'boolean') config.startupAsked = saved.startupAsked
      if (typeof saved.autoMonitor === 'boolean') config.autoMonitor = saved.autoMonitor
    }
  } catch {
    // 配置文件损坏或读取失败 — 使用默认值
  }

  // 环境变量覆盖 (最高优先级)
  if (process.env.DEEPSEEK_API_KEY) config.apiKey = process.env.DEEPSEEK_API_KEY
  if (process.env.DEEPSEEK_BASE_URL) config.baseUrl = process.env.DEEPSEEK_BASE_URL
  if (process.env.DEEPSEEK_REFRESH_INTERVAL) {
    const interval = parseInt(process.env.DEEPSEEK_REFRESH_INTERVAL, 10)
    if (!isNaN(interval) && interval >= 30 && interval <= 600) {
      config.refreshInterval = interval
    }
  }

  return config
}

// ── 保存配置 ─────────────────────────────────────────
export function saveConfig(partial: Partial<ConfigData>): boolean {
  const configPath = getConfigPath()

  try {
    // 读取现有配置
    let existing: ConfigData = { ...DEFAULTS }
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf-8')
        existing = { ...DEFAULTS, ...JSON.parse(raw) as Partial<ConfigData> }
      } catch {
        // 损坏 → 从头开始
      }
    }

    // 合并新值
    const merged: ConfigData = { ...existing, ...partial }

    // 确保目录存在
    const dir = path.dirname(configPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // 写入
    fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

/** 验证刷新间隔 */
export function validateInterval(interval: number): string | null {
  if (interval < 30) return '刷新间隔不能小于 30 秒'
  if (interval > 600) return '刷新间隔不能大于 600 秒'
  return null
}
