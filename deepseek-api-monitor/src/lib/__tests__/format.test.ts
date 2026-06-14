import { describe, it, expect } from 'vitest'
import { formatBalance, getCurrencySymbol, formatTimestamp } from '../format'

describe('formatBalance', () => {
  it('formats numeric strings to 2 decimal places', () => {
    expect(formatBalance('12.5')).toBe('12.50')
    expect(formatBalance('1.723')).toBe('1.72')
    expect(formatBalance('0')).toBe('0.00')
  })

  it('returns original string for non-numeric input', () => {
    expect(formatBalance('N/A')).toBe('N/A')
  })
})

describe('getCurrencySymbol', () => {
  it('returns correct symbol for known currencies', () => {
    expect(getCurrencySymbol('CNY')).toBe('¥')
    expect(getCurrencySymbol('USD')).toBe('$')
    expect(getCurrencySymbol('EUR')).toBe('€')
  })

  it('returns empty string for unknown currency', () => {
    expect(getCurrencySymbol('JPY')).toBe('')
  })
})

describe('formatTimestamp', () => {
  it('returns a formatted date string', () => {
    const date = new Date('2026-06-13T12:00:00')
    const result = formatTimestamp(date)
    expect(result).toContain('2026')
    expect(result).toContain('06')
    expect(result).toContain('13')
  })
})
