import { SkeletonSummary } from '@/components/ui/Skeleton'
import type { AiSummary as AiSummaryType } from '@/types'

interface AiSummaryProps {
  summary: AiSummaryType | null
  summaryError: string | null
  linkId: string
  onRetry: (id: string) => void
}

export function AiSummary({ summary, summaryError, linkId, onRetry }: AiSummaryProps) {
  // 실패: 이유 표시 + 재시도 버튼
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

  // 생성 중: 스켈레톤
  if (!summary) return <SkeletonSummary />

  // 성공
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
