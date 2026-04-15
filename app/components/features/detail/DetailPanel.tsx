'use client'

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
}

export function DetailPanel({
  link,
  allTags,
  onMemoSave,
  onSummaryRetry,
  onTagAdd,
  onTagRemove,
  onTagCreate,
}: DetailPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 썸네일 + 제목 가로 배치 */}
      <div className="flex gap-3 items-start">
        {link.thumbnailUrl && (
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <div className="relative w-36 h-24 rounded-lg overflow-hidden">
              <Image
                src={link.thumbnailUrl}
                alt={link.title}
                fill
                className="object-cover hover:opacity-90 transition-opacity"
              />
            </div>
          </a>
        )}
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
      </div>

      <hr className="border-zinc-700" />

      {/* AI 요약 + 메모 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">AI 요약</p>
          <AiSummary
            summary={link.aiSummary}
            linkId={link.id}
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
