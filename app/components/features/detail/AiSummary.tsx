'use client'

import { useEffect, useState } from 'react'
import { SkeletonSummary } from '@/components/ui/Skeleton'
import type { AiSummary as AiSummaryType } from '@/types'

interface AiSummaryProps {
  summary: AiSummaryType | null
  linkId: string
  onRetry: (id: string) => void
}

// 45초 동안 null이면 생성 실패로 간주 (OpenAI 30초 타임아웃 + 여유)
const FAILURE_TIMEOUT_MS = 45_000

export function AiSummary({ summary, linkId, onRetry }: AiSummaryProps) {
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    setTimedOut(false)
    if (summary) return
    const t = setTimeout(() => setTimedOut(true), FAILURE_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [summary, linkId])

  if (!summary) {
    if (timedOut) {
      return (
        <div className="space-y-2">
          <p className="text-zinc-500 text-sm">요약을 생성하지 못했습니다.</p>
          <button
            onClick={() => { setTimedOut(false); onRetry(linkId) }}
            className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
          >
            요약 다시 생성
          </button>
        </div>
      )
    }
    return <SkeletonSummary />
  }

  return (
    <div className="fade-in space-y-4">
      {/* 3줄 요약 */}
      <div className="space-y-2">
        {summary.summary.map((line, i) => (
          <p key={i} className="text-zinc-200 text-sm leading-relaxed">
            {line}
          </p>
        ))}
      </div>
      {/* 인사이트 */}
      {summary.insights.length > 0 && (
        <div>
          <p className="text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wide">인사이트</p>
          <ul className="space-y-1">
            {summary.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-zinc-300 text-sm">
                <span className="text-indigo-400 shrink-0">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => onRetry(linkId)}
        className="text-zinc-600 hover:text-indigo-400 text-xs transition-colors"
      >
        요약 다시 생성
      </button>
    </div>
  )
}
