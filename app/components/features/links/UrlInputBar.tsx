'use client'

import { useState } from 'react'

interface UrlInputBarProps {
  // true = 저장 성공/중복 → URL 초기화, false = 실패 → URL 유지
  onSave: (url: string) => Promise<boolean>
}

export function UrlInputBar({ onSave }: UrlInputBarProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  function isValidUrl(value: string) {
    try { new URL(value); return true } catch { return false }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidUrl(url)) return
    setLoading(true)
    const clear = await onSave(url)
    if (clear) setUrl('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="유튜브 또는 웹 URL을 붙여넣으세요"
        className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
      />
      <button
        type="submit"
        disabled={loading || !isValidUrl(url)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        {loading ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
