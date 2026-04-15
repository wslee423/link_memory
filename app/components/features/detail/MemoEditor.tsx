'use client'

import { useRef, useState } from 'react'

interface MemoEditorProps {
  linkId: string
  initialMemo: string
  onSave: (linkId: string, memo: string) => Promise<void>
}

export function MemoEditor({ linkId, initialMemo, onSave }: MemoEditorProps) {
  const [memo, setMemo] = useState(initialMemo)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setMemo(val)
    setStatus('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        await onSave(linkId, val)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2000)
      } catch {
        setStatus('error')
      }
    }, 1500)
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wide">메모</span>
        {status === 'saving' && <span className="text-zinc-500 text-xs">저장 중...</span>}
        {status === 'saved' && <span className="text-indigo-400 text-xs">저장됨 ✓</span>}
        {status === 'error' && <span className="text-red-400 text-xs">저장 실패 - 재시도</span>}
      </div>
      <textarea
        value={memo}
        onChange={handleChange}
        placeholder="메모를 입력하세요..."
        maxLength={5000}
        rows={6}
        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
      />
    </div>
  )
}
