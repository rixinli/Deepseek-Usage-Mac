/** 共享组件：测试连接按钮 + 行内结果 */

import { useState } from 'react'
import { useStore } from '@/store'
import { getApiQuota } from '@/lib/api'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  apiKey: string
}

type TestState = 'idle' | 'testing' | 'success' | 'error'

export default function ConnectionTest({ apiKey }: Props) {
  const [state, setState] = useState<TestState>('idle')
  const [message, setMessage] = useState('')
  const baseUrl = useStore(s => s.baseUrl)

  async function handleTest() {
    const trimmed = apiKey.trim()
    if (!trimmed) {
      setState('error')
      setMessage('请先输入 API Key')
      return
    }

    setState('testing')
    setMessage('正在测试连接...')

    try {
      const data = await getApiQuota(trimmed, baseUrl)
      if ('error' in data && data.error) {
        setState('error')
        setMessage(data.error)
      } else {
        setState('success')
        setMessage('连接成功！API Key 有效')
      }
    } catch (err) {
      setState('error')
      setMessage(`测试失败: ${String(err)}`)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleTest}
        disabled={state === 'testing'}
        className="px-3 py-1.5 text-xs font-medium rounded-btn
                   bg-slate-700 text-slate-300 border border-slate-600
                   hover:bg-slate-600 hover:text-slate-100
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        {state === 'testing' ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            测试中...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            🔍 测试连接
          </span>
        )}
      </button>

      {state !== 'idle' && message && (
        <span
          className={`text-xs flex items-center gap-1 ${
            state === 'success'
              ? 'text-ds-success'
              : state === 'error'
                ? 'text-ds-error'
                : 'text-slate-400'
          }`}
        >
          {state === 'success' && <CheckCircle2 className="w-3 h-3" />}
          {state === 'error' && <XCircle className="w-3 h-3" />}
          {message}
        </span>
      )}
    </div>
  )
}
