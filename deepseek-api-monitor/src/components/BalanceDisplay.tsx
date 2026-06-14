/** 余额卡片容器 — 响应式网格布局 */

import { useStore } from '@/store'
import BalanceCard from './BalanceCard'

export default function BalanceDisplay() {
  const balanceData = useStore(s => s.balanceData)

  if (!balanceData || !balanceData.balance_infos?.length) {
    return null
  }

  const infos = balanceData.balance_infos
  const gridCols = infos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`grid ${gridCols} gap-4 max-w-2xl mx-auto`}>
      {infos.map((info) => (
        <BalanceCard key={info.currency} info={info} />
      ))}
    </div>
  )
}
