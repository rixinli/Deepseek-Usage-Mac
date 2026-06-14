/** 首次设置向导 — DevOps Dashboard 风格单页窗口 */

import { useState } from 'react'
import { useStore } from '@/store'
import ApiKeySection from './ApiKeySection'

export default function SetupWizard() {
  const store = useStore()

  const [apiKey, setApiKey] = useState(store.apiKey)
  const [interval, setInterval_] = useState(store.refreshInterval)
  const [startup, setStartup] = useState(false)
  const [autoMonitor, setAutoMonitor] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    const trimmed = apiKey.trim()
    if (!trimmed) {
      setError('请输入您的 DeepSeek API Key')
      return
    }
    if (interval < 30 || interval > 600) {
      setError('刷新间隔范围: 30-600 秒')
      return
    }

    setSaving(true)
    setError('')

    try {
      const api = window.electronAPI
      if (api) {
        await api.saveConfig({
          apiKey: trimmed,
          refreshInterval: interval,
          startupEnabled: startup,
          autoMonitor,
          startupAsked: true,
        })

        if (startup) {
          await api.setStartupEnabled(true)
        }
      }

      // 更新 store
      store.setApiKey(trimmed)
      store.setRefreshInterval(interval)
      useStore.setState({
        startupEnabled: startup,
        autoMonitor,
        startupAsked: true,
        showWizard: false,
      })

      // 开始监控
      if (autoMonitor && trimmed) {
        store.startMonitoring()
        store.refreshOnce()
      } else {
        store.refreshOnce()
      }
    } catch (err) {
      setError(`保存失败: ${String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleSkip() {
    useStore.setState({
      showWizard: false,
      startupAsked: true,
    })
    if (window.electronAPI) {
      await window.electronAPI.saveConfig({ startupAsked: true })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-ds-surface border border-ds-border rounded-card w-[520px] max-h-[85vh]
                    shadow-2xl overflow-hidden flex flex-col"
      >
        {/* 标题区域 */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-xl font-bold text-slate-100">
            🎉 欢迎使用
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            DeepSeek API 额度监控 — 设置只需一分钟
          </p>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto px-6 py-2 space-y-6">
          {/* API Key */}
          <section>
            <div className="mb-4">
              <p className="text-sm text-slate-400">
                请输入您的 DeepSeek API Key 开始使用:
              </p>
            </div>
            <ApiKeySection apiKey={apiKey} onChange={setApiKey} />
          </section>

          {/* 选项 */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              选项
            </h3>

            {/* 刷新间隔 */}
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

            {/* 自启动 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={startup}
                onChange={(e) => setStartup(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-ds-primary"
              />
              <span className="text-sm text-slate-300">登录系统时自动启动</span>
            </label>

            {/* 自动监控 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoMonitor}
                onChange={(e) => setAutoMonitor(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-ds-primary"
              />
              <span className="text-sm text-slate-300">启动后自动开始监控</span>
            </label>
          </section>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-ds-border space-y-3">
          {/* 错误提示 */}
          {error && (
            <p className="text-xs text-ds-error">{error}</p>
          )}

          {/* 按钮行 */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              跳过设置
            </button>
            <button
              onClick={handleStart}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-ds-primary text-slate-900
                         rounded-btn hover:bg-teal-300 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中…' : '开始监控'}
            </button>
          </div>

          <p className="text-[11px] text-slate-600 text-center">
            点击「开始监控」将保存设置并立即启动余额监控
            <br />
            之后可通过菜单 偏好设置 (⌘,) 随时修改
          </p>
        </div>
      </div>
    </div>
  )
}
