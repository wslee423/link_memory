'use client'

import { useEffect, useState } from 'react'
import { SkeletonSummary } from '@/components/ui/Skeleton'
import type { AiSummary as AiSummaryType } from '@/types'

interface AiSummaryProps {
  summary: AiSummaryType | null
  summaryError: string | null  // DB에 저장된 명시적 에러
  linkId: string
  createdAt: string            // fire-and-forget 실패 감지용 fallback
  onRetry: (id: string) => void
}

// maxDuration(60s) + 네트워크 여유
const FAILURE_THRESHOLD_MS = 90_000

export function AiSummary({ summary, summaryError, linkId, createdAt, onRetry }: AiSummaryProps) {
  const [timedOut, setTimedOut] = useState(() =>
    Date.now() - new Date(createdAt).getTime() > FAILURE_THRESHOLD_MS
  )

  useEffect(() => {
    // summary/error 상태가 바뀌거나 링크가 바뀔 때 타이머 리셋
    if (summary || summaryError) {
      setTimedOut(false)
      return
    }

    const elapsed = Date.now() - new Date(createdAt).getTime()
    if (elapsed > FAILURE_THRESHOLD_MS) {
      setTimedOut(true)
      return
    }

    const t = setTimeout(() => setTimedOut(true), FAILURE_THRESHOLD_MS - elapsed)
    return () => clearTimeout(t)
  }, [summary, summaryError, linkId, createdAt])

  // Case 1: DB에 명시적 에러 메시지 있음 (자막 없음, API 오류 등)
  if (summaryError) {
    return (
      <div className="space-y-2">
        <p className="text-zinc-500 text-sm">{summaryError}</p>
        <button
          onClick={() => onRetry(linkId)}
          className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
        >
          요약 다시 생성
        </button>
      </div>
    )
  }

  // Case 2: 에러가 DB에 안 쓰였지만 시간 초과 (fire-and-forget 실패 fallback)
  if (!summary && timedOut) {
    return (
      <div className="space-y-2">
        <p className="text-zinc-500 text-sm">요약을 생성하지 못했습니다.</p>
        <button
          onClick={() => onRetry(linkId)}
          className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
        >
          요약 다시 생성
        </button>
      </div>
    )
  }

  // Case 3: 생성 중
  if (!summary) return <SkeletonSummary />

  // Case 4: 성공
  return (
    <div className="fade-in space-y-4">
      <div className="space-y-2">
        {summary.summary.map((line, i) => (
          <p key={i} className="text-zinc-200 text-sm leading-relaxed">
            {line}
          </p>
        ))}
      </div>
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
