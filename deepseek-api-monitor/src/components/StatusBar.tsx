/** 底部状态栏 — 监控状态 + 倒计时 + 信息标签 */

import { useStore } from '@/store'
import { useCountdown } from '@/hooks/useCountdown'

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-slate-500',
  monitoring: 'bg-ds-success',
  error: 'bg-ds-error',
  loading: 'bg-ds-warning',
}

export default function StatusBar() {
  const status = useStore(s => s.status)
  const statusText = useStore(s => s.statusText)
  const isMonitoring = useStore(s => s.isMonitoring)
  const refreshInterval = useStore(s => s.refreshInterval)
  const mockMode = useStore(s => s.mockMode)
  const appVersion = useStore(s => s.appVersion)
  const platform = useStore(s => s.platform)

  const countdown = useCountdown()

  const dotColor = STATUS_COLORS[status] || STATUS_COLORS.idle

  // 构建状态文本
  let displayText = statusText
  if (isMonitoring) {
    displayText = `下次刷新 ${countdown}s · 间隔 ${refreshInterval}s`
  }

  const tags: string[] = [`v${appVersion}`]
  if (platform === 'darwin') tags.push('macOS')
  else if (platform === 'win32') tags.push('Windows')
  if (mockMode) tags.push('mock')

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-ds-border bg-ds-bg/80 backdrop-blur-sm">
      {/* 左侧：状态指示 + 文本 */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
        <span className="text-xs text-slate-400 truncate">{displayText}</span>
      </div>

      {/* 右侧：信息标签 */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-slate-500 uppercase tracking-wider font-mono"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
