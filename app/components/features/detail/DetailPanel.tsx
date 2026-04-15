'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AiSummary } from './AiSummary'
import { MemoEditor } from './MemoEditor'
import { TagInput } from '@/components/features/tags/TagInput'
import type { Link, Tag } from '@/types'

interface DetailPanelProps {
  link: Link
  allTags: Tag[]
  onMemoSave: (linkId: string, memo: string) => Promise<void>
  onSummaryRetry: (linkId: string) => void
  onTagAdd: (linkId: string, tag: Tag) => Promise<void>
  onTagRemove: (linkId: string, tagId: string) => Promise<void>
  onTagCreate: (linkId: string, name: string) => Promise<void>
  onArchive: (linkId: string, archive: boolean) => Promise<void>
  onDelete: (linkId: string) => Promise<void>
}

export function DetailPanel({
  link,
  allTags,
  onMemoSave,
  onSummaryRetry,
  onTagAdd,
  onTagRemove,
  onTagCreate,
  onArchive,
  onDelete,
}: DetailPanelProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onDelete(link.id)
    setDeleting(false)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 썸네일 */}
      {link.thumbnailUrl && (
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          <div className="relative w-1/2 aspect-video rounded-lg overflow-hidden">
            <Image
              src={link.thumbnailUrl}
              alt={link.title}
              fill
              className="object-cover hover:opacity-90 transition-opacity"
            />
          </div>
        </a>
      )}

      {/* 제목 + 메타 + 삭제 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-zinc-100 font-semibold leading-snug">
            <a href={link.url} target="_blank" rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors">
              {link.title}
            </a>
          </h2>
          {(link.channelName || link.publishedAt) && (
            <p className="text-zinc-400 text-sm mt-1">
              {link.channelName}
              {link.channelName && link.publishedAt && ' · '}
              {link.publishedAt}
            </p>
          )}
        </div>

        {/* 보관 + 삭제 버튼 */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => onArchive(link.id, !link.isArchived)}
            className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors"
          >
            {link.isArchived ? '복원' : '보관'}
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs">삭제할까요?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
              >
                {deleting ? '삭제 중...' : '확인'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <hr className="border-zinc-700" />

      {/* AI 요약 + 메모 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">AI 요약</p>
          <AiSummary
            summary={link.aiSummary}
            summaryError={link.aiSummaryError}
            linkId={link.id}
            createdAt={link.createdAt}
            onRetry={onSummaryRetry}
          />
        </div>
        <div>
          <MemoEditor
            key={link.id}
            linkId={link.id}
            initialMemo={link.memo}
            onSave={onMemoSave}
          />
        </div>
      </div>

      <hr className="border-zinc-700" />

      {/* 태그 */}
      <div className="space-y-1">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">태그</p>
        <TagInput
          key={link.id}
          allTags={allTags}
          selectedTags={link.tags}
          onAdd={(tag) => onTagAdd(link.id, tag)}
          onRemove={(tagId) => onTagRemove(link.id, tagId)}
          onCreateAndAdd={(name) => onTagCreate(link.id, name)}
        />
      </div>
    </div>
  )
}
