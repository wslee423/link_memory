'use client'

import Image from 'next/image'
import { AiSummary } from './AiSummary'
import { MemoEditor } from './MemoEditor'
import type { Link } from '@/types'

interface DetailPanelProps {
  link: Link
  onMemoSave: (linkId: string, memo: string) => Promise<void>
  onSummaryRetry: (linkId: string) => void
}

export function DetailPanel({ link, onMemoSave, onSummaryRetry }: DetailPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 썸네일 */}
      {link.thumbnailUrl && (
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={link.thumbnailUrl}
              alt={link.title}
              fill
              className="object-cover hover:opacity-90 transition-opacity"
            />
          </div>
        </a>
      )}

      {/* 제목 + 메타 */}
      <div>
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
    </div>
  )
}
