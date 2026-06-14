import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getApiQuota, setMockMode, isMockMode } from '../api'

describe('getApiQuota', () => {
  beforeEach(() => {
    setMockMode(false)
  })

  it('returns error when no API key provided', async () => {
    const result = await getApiQuota('')
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('请先输入 API Key')
    }
  })

  it('returns mock data in mock mode', async () => {
    setMockMode(true)
    const result = await getApiQuota('')
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.is_available).toBe(true)
      expect(result.balance_infos).toHaveLength(2)
      expect(result.balance_infos[0].currency).toBe('CNY')
      expect(result._endpoint).toContain('Mock')
    }
  })

  it('toggle mock mode works', () => {
    expect(isMockMode()).toBe(false)
    setMockMode(true)
    expect(isMockMode()).toBe(true)
    setMockMode(false)
    expect(isMockMode()).toBe(false)
  })

  it('returns error for invalid API key (HTTP 401)', async () => {
    // Mock fetch to return 401
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 401,
      json: async () => ({}),
    })

    const result = await getApiQuota('invalid-key')
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('API Key 无效或已过期')
    }
  })
})
