/** DeepSeek API 客户端 — 纯函数，与 UI 无关 */

import type { ApiResult, BalanceResponse } from './types'

// ── Mock 模式 ────────────────────────────────────────
let _mockMode = false

export function setMockMode(enabled: boolean): void {
  _mockMode = enabled
}

export function isMockMode(): boolean {
  return _mockMode
}

function mockBalanceData(): BalanceResponse {
  return {
    is_available: true,
    balance_infos: [
      {
        currency: 'CNY',
        total_balance: '12.50',
        granted_balance: '10.00',
        topped_up_balance: '2.50',
      },
      {
        currency: 'USD',
        total_balance: '1.72',
        granted_balance: '1.38',
        topped_up_balance: '0.34',
      },
    ],
    _endpoint: 'https://api.deepseek.com/user/balance (Mock)',
  }
}

// ── API 调用 ─────────────────────────────────────────
export async function getApiQuota(
  apiKey: string,
  baseUrl: string = 'https://api.deepseek.com',
  timeout: number = 10000,
): Promise<ApiResult> {
  // Mock 模式
  if (_mockMode) {
    return mockBalanceData()
  }

  if (!apiKey) {
    return { error: '请先输入 API Key' }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${baseUrl}/user/balance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    if (response.status === 200) {
      const data: BalanceResponse = await response.json()
      data._endpoint = `${baseUrl}/user/balance`
      return data
    } else if (response.status === 401) {
      return { error: 'API Key 无效或已过期' }
    } else {
      const text = await response.text()
      return {
        error: `请求失败 (HTTP ${response.status})`,
        note: `响应: ${text.slice(0, 200)}`,
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { error: '请求超时' }
    }
    return { error: `网络错误: ${String(err)}` }
  } finally {
    clearTimeout(timeoutId)
  }
}
