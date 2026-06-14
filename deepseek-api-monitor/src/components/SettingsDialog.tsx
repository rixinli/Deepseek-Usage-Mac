/** 偏好设置对话框 — macOS 风格模态窗口 */

import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import ApiKeySection from './ApiKeySection'
import { X } from 'lucide-react'

export default function SettingsDialog() {
  const store = useStore()

  const [apiKey, setApiKey] = useState(store.apiKey)
  const [interval, setInterval_] = useState(store.refreshInterval)
  const [startup, setStartup] = useState(store.startupEnabled)
  const [autoMonitor, setAutoMonitor] = useState(store.autoMonitor)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') store.toggleSettings()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store])

  async function handleSave() {
    const trimmed = apiKey.trim()
    if (!trimmed) {
      setSaveMsg('请输入 API Key')
      return
    }

    const int = interval
    if (int < 30 || int > 600) {
      setSaveMsg('刷新间隔范围: 30-600 秒')
      return
    }

    setSaving(true)
    setSaveMsg('')

    try {
      // 保存到磁盘
      const api = window.electronAPI
      if (api) {
        const ok = await api.saveConfig({
          apiKey: trimmed,
          refreshInterval: int,
          startupEnabled: startup,
          autoMonitor,
          startupAsked: true,
        })

        if (!ok) {
          setSaveMsg('配置保存失败')
          setSaving(false)
          return
        }

        // 处理开机自启动
        if (startup !== store.startupEnabled) {
          await api.setStartupEnabled(startup)
        }
      }

      // 更新 store
      store.setApiKey(trimmed)
      store.setRefreshInterval(int)
      useStore.setState({
        startupEnabled: startup,
        autoMonitor,
      })

      setSaveMsg('已保存')
      setTimeout(() => store.toggleSettings(), 300)
    } catch (err) {
      setSaveMsg(`保存失败: ${String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-ds-surface border border-ds-border rounded-card w-[480px] max-h-[80vh]
                    shadow-2xl overflow-hidden flex flex-col"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ds-border">
          <h2 className="text-sm font-semibold text-slate-200">Preferences</h2>
          <button
            onClick={() => store.toggleSettings()}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容区域 — 可滚动 */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-6">
          {/* API Key */}
          <section>
            <ApiKeySection apiKey={apiKey} onChange={setApiKey} />
          </section>

          {/* Monitoring */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monitoring
            </h3>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">刷新间隔:</label>
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval_(Number(e.target.value))}
                min={30}
                max={600}
                step={10}
                className="w-20 bg-slate-800 border border-slate-600 rounded-input px-3 py-1.5
                           text-sm font-mono text-slate-200 text-center
                           focus:outline-none focus:border-ds-accent focus:ring-1 focus:ring-ds-accent/50"
              />
              <span className="text-xs text-slate-500">秒 (30-600)</span>
            </div>
          </section>

          {/* Startup */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Startup
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={startup}
                onChange={(e) => setStartup(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600
                           text-ds-primary focus:ring-ds-accent"
              />
              <span className="text-sm text-slate-300">登录系统时自动启动</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoMonitor}
                onChange={(e) => setAutoMonitor(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600
                           text-ds-primary focus:ring-ds-accent"
              />
              <span className="text-sm text-slate-300">启动时自动开始监控</span>
            </label>
          </section>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-ds-border">
          <span className={`text-xs ${saveMsg.includes('失败') ? 'text-ds-error' : 'text-slate-500'}`}>
            {saveMsg}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => store.toggleSettings()}
              className="px-4 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm font-medium bg-ds-primary/20 text-ds-primary
                         border border-ds-primary/30 rounded-btn
                         hover:bg-ds-primary/30 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
