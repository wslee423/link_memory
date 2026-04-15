'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Status = 'saving' | 'done' | 'duplicate' | 'error'

function SaveContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url') ?? ''
  const [status, setStatus] = useState<Status>(url ? 'saving' : 'error')
  const [savedTitle, setSavedTitle] = useState('')

  useEffect(() => {
    if (!url) return

    async function save() {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (res.status === 409) { setStatus('duplicate'); return }
      if (!res.ok) { setStatus('error'); return }

      setSavedTitle(data.link.title ?? url)
      setStatus('done')
    }

    void save()
  }, [url])

  return (
    <div className="space-y-4 text-center">
      {status === 'saving' && (
        <>
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm break-all">{url}</p>
          <p className="text-zinc-500 text-xs">저장 중...</p>
        </>
      )}

      {status === 'done' && (
        <>
          <p className="text-indigo-400 text-2xl">✓</p>
          <p className="text-zinc-200 text-sm font-medium leading-snug">{savedTitle}</p>
          <p className="text-zinc-500 text-xs">저장됐어요. 창을 닫아도 됩니다.</p>
          <button
            onClick={() => window.close()}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            창 닫기
          </button>
        </>
      )}

      {status === 'duplicate' && (
        <>
          <p className="text-yellow-400 text-2xl">!</p>
          <p className="text-zinc-400 text-sm">이미 저장된 링크입니다.</p>
          <button
            onClick={() => window.close()}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            창 닫기
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <p className="text-red-400 text-2xl">✕</p>
          <p className="text-zinc-400 text-sm">저장에 실패했습니다.</p>
          <button
            onClick={() => window.close()}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            창 닫기
          </button>
        </>
      )}
    </div>
  )
}

export default function SavePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <p className="text-zinc-100 font-bold text-lg text-center mb-6">link_memory</p>
        <Suspense fallback={<p className="text-zinc-500 text-sm text-center">로딩 중...</p>}>
          <SaveContent />
        </Suspense>
      </div>
    </div>
  )
}
