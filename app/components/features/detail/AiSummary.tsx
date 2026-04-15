import { SkeletonSummary } from '@/components/ui/Skeleton'
import type { AiSummary as AiSummaryType } from '@/types'

interface AiSummaryProps {
  summary: AiSummaryType | null
  linkId: string
  onRetry: (id: string) => void
}

export function AiSummary({ summary, linkId, onRetry }: AiSummaryProps) {
  if (summary === undefined) return <SkeletonSummary />

  if (!summary) {
    return (
      <div className="text-center py-4">
        <p className="text-zinc-400 text-sm">요약을 생성할 수 없습니다.</p>
        <button
          onClick={() => onRetry(linkId)}
          className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm underline"
        >
          재시도
        </button>
      </div>
    )
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
    </div>
  )
}
