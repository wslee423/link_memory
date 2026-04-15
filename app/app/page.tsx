'use client'

import { useCallback, useEffect, useState } from 'react'
import { UrlInputBar } from '@/components/features/links/UrlInputBar'
import { LinkCard } from '@/components/features/links/LinkCard'
import { DetailPanel } from '@/components/features/detail/DetailPanel'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Toast, useToast } from '@/components/ui/Toast'
import type { Link } from '@/types'

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast, show, hide } = useToast()

  const selectedLink = links.find((l) => l.id === selectedId) ?? null

  // 목록 조회
  const fetchLinks = useCallback(async () => {
    const res = await fetch('/api/links')
    if (!res.ok) return
    const { links: data } = await res.json() as { links: Link[] }
    setLinks(
      data.map((l) => ({
        ...l,
        thumbnailUrl: l.thumbnailUrl ?? null,
        channelName: l.channelName ?? null,
        publishedAt: l.publishedAt ?? null,
        aiSummary: l.aiSummary ?? null,
        tags: l.tags ?? [],
      }))
    )
  }, [])

  useEffect(() => {
    const load = async () => {
      await fetchLinks()
      setLoading(false)
    }
    void load()
  }, [fetchLinks])

  // AI 요약 폴링 (미완료 링크 대상)
  useEffect(() => {
    const pending = links.filter((l) => l.aiSummary === null)
    if (pending.length === 0) return

    const id = setInterval(async () => {
      await fetchLinks()
    }, 5000)

    return () => clearInterval(id)
  }, [links, fetchLinks])

  // 링크 저장
  async function handleSave(url: string) {
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await res.json()

    if (res.status === 409) {
      show('이미 저장된 링크입니다.', 'error')
      setSelectedId(data.linkId)
      return
    }
    if (!res.ok) {
      show(data.error ?? '저장에 실패했습니다.', 'error')
      return
    }

    await fetchLinks()
    setSelectedId(data.link.id)
  }

  // 메모 저장
  async function handleMemoSave(linkId: string, memo: string) {
    const res = await fetch(`/api/links/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo }),
    })
    if (!res.ok) throw new Error('저장 실패')
    setLinks((prev) => prev.map((l) => l.id === linkId ? { ...l, memo } : l))
  }

  // AI 요약 재시도
  async function handleSummaryRetry(linkId: string) {
    await fetch(`/api/links/${linkId}/summarize`, { method: 'POST' })
    await fetchLinks()
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <header className="shrink-0 sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-4">
        <span className="text-zinc-100 font-bold text-lg shrink-0">link_memory</span>
        <UrlInputBar onSave={handleSave} />
      </header>

      {/* Body — 2패널 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌: 링크 목록 (40%) */}
        <div className="w-full md:w-2/5 border-r border-zinc-800 overflow-y-auto p-2 space-y-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : links.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <p className="text-zinc-500 text-sm">
                아직 저장된 링크가 없어요.<br />
                URL을 붙여넣어 시작해보세요 🔖
              </p>
            </div>
          ) : (
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                isSelected={link.id === selectedId}
                onSelect={setSelectedId}
              />
            ))
          )}
        </div>

        {/* 우: 상세 패널 (60%) */}
        <div className="hidden md:block md:w-3/5 overflow-hidden">
          {selectedLink ? (
            <DetailPanel
              link={selectedLink}
              onMemoSave={handleMemoSave}
              onSummaryRetry={handleSummaryRetry}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              링크를 선택하면 상세 내용이 표시됩니다
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </div>
  )
}
