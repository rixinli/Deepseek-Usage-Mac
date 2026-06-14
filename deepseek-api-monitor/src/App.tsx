/** 应用根组件 — 布局骨架 + 生命周期 */

import { useEffect } from 'react'
import { useStore } from '@/store'
import BalanceDisplay from '@/components/BalanceDisplay'
import AccountStatus from '@/components/AccountStatus'
import StatusBar from '@/components/StatusBar'
import SettingsDialog from '@/components/SettingsDialog'
import SetupWizard from '@/components/SetupWizard'
import { useMonitoring } from '@/hooks/useMonitoring'

export default function App() {
  const showSettings = useStore(s => s.showSettings)
  const showWizard = useStore(s => s.showWizard)
  const apiKey = useStore(s => s.apiKey)
  const startupAsked = useStore(s => s.startupAsked)
  const balanceData = useStore(s => s.balanceData)
  const platform = useStore(s => s.platform)

  // 初始化应用
  useEffect(() => {
    async function init() {
      const api = window.electronAPI
      if (!api) return

      try {
        const config = await api.loadConfig()
        const version = await api.getAppVersion()
        const platform = await api.getPlatform()

        useStore.getState().loadConfig(config)
        useStore.getState().setAppInfo(version, platform)

        // 是否需要显示向导
        if (!config.apiKey && !config.startupAsked) {
          useStore.setState({ showWizard: true })
        }

        // 自动开始监控
        if (config.autoMonitor && config.apiKey) {
          useStore.getState().startMonitoring()
          useStore.getState().refreshOnce()
        } else if (config.apiKey) {
          // 有 API Key 但没有 auto-monitor — 初始刷新一次
          useStore.getState().refreshOnce()
        }
      } catch (err) {
        console.error('Failed to initialize:', err)
      }
    }

    init()
  }, [])

  // 监听菜单事件
  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    const unsub = api.onMenuAction((action: string) => {
      const store = useStore.getState()
      switch (action) {
        case 'toggle-monitoring':
          if (store.isMonitoring) {
            store.stopMonitoring()
          } else {
            store.startMonitoring()
            store.refreshOnce()
          }
          break
        case 'stop-monitoring':
          store.stopMonitoring()
          break
        case 'refresh':
          store.refreshOnce()
          break
        case 'toggle-mock':
          store.toggleMockMode()
          break
        case 'settings':
          store.toggleSettings()
          break
        case 'open-guide':
          api.openExternal('https://github.com/rixinli/Deepseek-Usage')
          break
      }
    })

    return unsub
  }, [])

  // 键盘快捷键 (作为菜单的补充)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useStore.getState()
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === ',') {
        e.preventDefault()
        store.toggleSettings()
      } else if (meta && e.key === 'r' && !e.shiftKey) {
        e.preventDefault()
        if (store.isMonitoring) {
          store.stopMonitoring()
        } else {
          store.startMonitoring()
          store.refreshOnce()
        }
      } else if (meta && e.key === 'R') {
        e.preventDefault()
        store.refreshOnce()
      } else if (meta && e.key === 'd') {
        e.preventDefault()
        store.toggleMockMode()
      } else if (meta && e.key === 'q') {
        e.preventDefault()
        window.close()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // 监控 Hook
  useMonitoring()

  return (
    <div className="flex flex-col h-screen bg-ds-bg overflow-hidden">
      {/* Setup Wizard — 首次使用 */}
      {showWizard && (
        <SetupWizard />
      )}

      {/* 主界面 */}
      <div
        className="flex flex-col flex-1 relative"
        style={{
          paddingTop: platform === 'darwin' ? '38px' : '0px', // macOS traffic light space
        }}
      >
        {/* 可拖拽标题栏区域 (macOS hiddenInset) */}
        {platform === 'darwin' && (
          <div
            className="h-[38px] absolute top-0 left-0 right-0 z-10"
            style={{ WebkitAppRegion: 'drag' }}
          />
        )}
        {/* 账户状态横幅 */}
        <AccountStatus />

        {/* 余额数据 — 主角 */}
        <div className="flex-1 overflow-auto px-4 py-3">
          {balanceData ? (
            <BalanceDisplay />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* 状态栏 */}
        <StatusBar />
      </div>

      {/* 设置对话框 */}
      {showSettings && <SettingsDialog />}
    </div>
  )
}

/** 空状态 — 未配置或未获取数据时显示 */
function EmptyState() {
  const mockMode = useStore(s => s.mockMode)
  const apiKey = useStore(s => s.apiKey)

  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
      <div className="text-5xl mb-2">📊</div>
      {!apiKey && !mockMode ? (
        <>
          <p className="text-lg font-medium text-slate-400">配置 API Key 后开始监控</p>
          <p className="text-sm">
            使用 <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-slate-300 font-mono text-xs">⌘,</kbd> 打开偏好设置
          </p>
        </>
      ) : (
        <p className="text-slate-500">点击 ⌘R 开始监控，或按 ⌘⇧R 立即刷新</p>
      )}
    </div>
  )
}
