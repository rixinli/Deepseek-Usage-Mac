/** 单币种余额卡片 — DevOps Dashboard 核心数据展示 */

import type { BalanceInfo } from '@/lib/types'
import { formatBalance, getCurrencySymbol } from '@/lib/format'

interface Props {
  info: BalanceInfo
}

export default function BalanceCard({ info }: Props) {
  const symbol = getCurrencySymbol(info.currency)
  const total = formatBalance(info.total_balance)
  const granted = formatBalance(info.granted_balance)
  const toppedUp = formatBalance(info.topped_up_balance)

  return (
    <div className="bg-ds-surface border border-ds-border rounded-card p-[20px] min-w-[240px]">
      {/* 币种标签 + 状态指示 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-ds-success inline-block" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {info.currency}
        </span>
      </div>

      {/* 总余额 — 主要数据（大号等宽数字） */}
      <div className="mb-4">
        <div className="text-4xl font-bold font-mono text-ds-primary tabular-nums tracking-tight">
          {symbol}{total}
        </div>
        <div className="text-xs text-slate-500 mt-1">总余额</div>
      </div>

      {/* 子项 — 赠送余额 + 充值余额 */}
      <div className="space-y-2 pt-3 border-t border-ds-border">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">🎁 赠送余额</span>
          <span className="text-sm font-mono text-slate-300 tabular-nums">
            {symbol}{granted}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">💵 充值余额</span>
          <span className="text-sm font-mono text-slate-300 tabular-nums">
            {symbol}{toppedUp}
          </span>
        </div>
      </div>
    </div>
  )
}
