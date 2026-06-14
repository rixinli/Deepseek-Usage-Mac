/** 监控 Hook — 管理定时刷新和自动开始 */

import { useEffect, useRef } from 'react'
import { useStore } from '@/store'

export function useMonitoring() {
  const isMonitoring = useStore(s => s.isMonitoring)
  const refreshInterval = useStore(s => s.refreshInterval)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // 清除旧定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!isMonitoring) return

    // 立即刷新一次
    useStore.getState().refreshOnce()

    // 设置定时刷新
    intervalRef.current = setInterval(() => {
      useStore.getState().refreshOnce()
    }, refreshInterval * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isMonitoring, refreshInterval])
}
