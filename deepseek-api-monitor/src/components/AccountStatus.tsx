/** 账户状态横幅 — 显示 API 可用性和端点信息 */

import { useStore } from '@/store'

export default function AccountStatus() {
  const balanceData = useStore(s => s.balanceData)
  const lastError = useStore(s => s.lastError)
  const mockMode = useStore(s => s.mockMode)

  if (!balanceData && !lastError) return null

  const isAvailable = balanceData?.is_available

  return (
    <div className="px-4 pt-2 pb-1">
      {/* 错误状态 */}
      {lastError && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-ds-error" />
          <span className="text-sm text-red-400">{lastError}</span>
        </div>
      )}

      {/* 正常状态 */}
      {balanceData && !lastError && (
        <div className="flex items-center gap-3 px-3 py-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isAvailable ? 'bg-ds-success' : 'bg-ds-warning'
            }`}
          />
          <span className="text-sm text-slate-400">
            {isAvailable ? 'API 可用' : '余额不足'}
          </span>
          {balanceData._endpoint && (
            <span className="text-xs text-slate-600 ml-auto font-mono truncate">
              {balanceData._endpoint}
            </span>
          )}
          {mockMode && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded ml-auto font-mono">
              MOCK
            </span>
          )}
        </div>
      )}
    </div>
  )
}
