/** 格式化和工具函数 */

import type { ApiResult } from './types'
import { CURRENCY_SYMBOLS } from './types'

/** 格式化余额数据为显示用文本数组 */
export function formatBalanceLines(data: ApiResult): string[] {
  const lines: string[] = []

  if ('error' in data && data.error) {
    lines.push(`❌ 错误: ${data.error}`)
    if (data.note) lines.push(`📝 提示: ${data.note}`)
    return lines
  }

  const balanceData = data as { is_available?: boolean; balance_infos?: unknown[]; _endpoint?: string }

  if (balanceData._endpoint) {
    lines.push(`🔗 API端点: ${balanceData._endpoint}`)
  }

  if (balanceData.is_available !== undefined) {
    const status = balanceData.is_available ? '✅ 可用' : '⚠️ 余额不足'
    lines.push(`📊 账户状态: ${status}`)
  }

  return lines
}

/** 格式化单个余额数值（保留两位小数） */
export function formatBalance(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return num.toFixed(2)
}

/** 获取货币符号 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || ''
}

/** 生成时间戳字符串 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
