'use client'

import { useCallback, useEffect, useState } from 'react'
import { UrlInputBar } from '@/components/features/links/UrlInputBar'
import { LinkCard } from '@/components/features/links/LinkCard'
import { TagBar } from '@/components/features/tags/TagBar'
import { DetailPanel } from '@/components/features/detail/DetailPanel'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Toast, useToast } from '@/components/ui/Toast'
import type { Link, Tag } from '@/types'

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast, show, hide } = useToast()

  const selectedLink = links.find((l) => l.id === selectedId) ?? null

  // 태그 목록 조회
  const fetchTags = useCallback(async () => {
    const res = await fetch('/api/tags')
    if (!res.ok) return
    const { tags } = await res.json() as { tags: Tag[] }
    setAllTags(tags)
  }, [])

  // 링크 목록 조회
  const fetchLinks = useCallback(async () => {
    const url = selectedTagId ? `/api/links?tagId=${selectedTagId}` : '/api/links'
    const res = await fetch(url)
    if (!res.ok) return
    const { links: data } = await res.json() as { links: Link[] }
    setLinks(data)
  }, [selectedTagId])

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchLinks(), fetchTags()])
      setLoading(false)
    }
    void load()
  }, [fetchLinks, fetchTags])

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

  // 태그 추가 (기존 태그)
  async function handleTagAdd(linkId: string, tag: Tag) {
    const link = links.find((l) => l.id === linkId)
    if (!link) return
    const newTagIds = [...link.tags.map((t) => t.id), tag.id]
    const res = await fetch(`/api/links/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagIds: newTagIds }),
    })
    if (!res.ok) { show('태그 추가 실패', 'error'); return }
    setLinks((prev) => prev.map((l) => l.id === linkId ? { ...l, tags: [...l.tags, tag] } : l))
  }

  // 태그 제거
  async function handleTagRemove(linkId: string, tagId: string) {
    const link = links.find((l) => l.id === linkId)
    if (!link) return
    const newTagIds = link.tags.filter((t) => t.id !== tagId).map((t) => t.id)
    const res = await fetch(`/api/links/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagIds: newTagIds }),
    })
    if (!res.ok) { show('태그 제거 실패', 'error'); return }
    setLinks((prev) => prev.map((l) =>
      l.id === linkId ? { ...l, tags: l.tags.filter((t) => t.id !== tagId) } : l
    ))
  }

  // 태그 새로 만들고 추가
  async function handleTagCreate(linkId: string, name: string) {
    // 1. 태그 생성
    const tagRes = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!tagRes.ok) { show('태그 생성 실패', 'error'); return }
    const { tag } = await tagRes.json() as { tag: Tag }

    // 2. 링크에 태그 추가
    await handleTagAdd(linkId, tag)

    // 3. 전체 태그 목록 갱신
    await fetchTags()
  }

  const filteredLinks = selectedTagId
    ? links.filter((l) => l.tags.some((t) => t.id === selectedTagId))
    : links

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <header className="shrink-0 sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-4">
        <span className="text-zinc-100 font-bold text-lg shrink-0">link_memory</span>
        <UrlInputBar onSave={handleSave} />
      </header>

      {/* TagBar */}
      {!loading && <TagBar tags={allTags} selectedTagId={selectedTagId} onSelect={setSelectedTagId} />}

      {/* Body — 2패널 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌: 링크 목록 (40%) */}
        <div className="w-full md:w-2/5 border-r border-zinc-800 overflow-y-auto p-2 space-y-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredLinks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <p className="text-zinc-500 text-sm">
                {selectedTagId
                  ? `'${allTags.find((t) => t.id === selectedTagId)?.name}' 태그가 달린 링크가 없어요`
                  : '아직 저장된 링크가 없어요.\nURL을 붙여넣어 시작해보세요 🔖'}
              </p>
            </div>
          ) : (
            filteredLinks.map((link) => (
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
              allTags={allTags}
              onMemoSave={handleMemoSave}
              onSummaryRetry={handleSummaryRetry}
              onTagAdd={handleTagAdd}
              onTagRemove={handleTagRemove}
              onTagCreate={handleTagCreate}
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
