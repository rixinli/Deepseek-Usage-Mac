/** 倒计时 Hook — 监控模式下每秒更新剩余秒数 */

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store'

export function useCountdown(): number {
  const isMonitoring = useStore(s => s.isMonitoring)
  const refreshInterval = useStore(s => s.refreshInterval)
  const lastRefreshTime = useStore(s => s.lastRefreshTime)
  const [remaining, setRemaining] = useState(refreshInterval)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!isMonitoring || !lastRefreshTime) {
      setRemaining(refreshInterval)
      return
    }

    // 每秒更新倒计时
    const tick = () => {
      const elapsed = Math.floor((Date.now() - lastRefreshTime) / 1000)
      const left = Math.max(0, refreshInterval - elapsed)
      setRemaining(left)
    }

    tick() // 立即计算一次
    timerRef.current = setInterval(tick, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isMonitoring, refreshInterval, lastRefreshTime])

  return remaining
}
