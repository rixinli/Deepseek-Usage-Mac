/** 共享组件：API Key 输入区域（SettingsDialog + SetupWizard 复用） */

import { useState } from 'react'
import ConnectionTest from './ConnectionTest'

interface Props {
  apiKey: string
  onChange: (value: string) => void
}

export default function ApiKeySection({ apiKey, onChange }: Props) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        API Key
      </label>

      {/* 输入框 */}
      <div className="flex gap-2">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-input px-3 py-2 text-sm font-mono
                     text-slate-200 placeholder-slate-600
                     focus:outline-none focus:border-ds-accent focus:ring-1 focus:ring-ds-accent/50
                     transition-colors"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-input
                     text-slate-400 hover:text-slate-200 hover:border-slate-500
                     transition-colors text-sm"
          title={showKey ? '隐藏' : '显示'}
        >
          {showKey ? '🔒' : '👁'}
        </button>
      </div>

      {/* 获取 API Key 链接 */}
      <div className="text-xs">
        <button
          onClick={() => window.electronAPI?.openExternal('https://platform.deepseek.com/api_keys')}
          className="text-ds-accent hover:text-sky-400 transition-colors underline underline-offset-2"
        >
          🔗 获取 API Key
        </button>
      </div>

      {/* 测试连接 */}
      <ConnectionTest apiKey={apiKey} />
    </div>
  )
}
