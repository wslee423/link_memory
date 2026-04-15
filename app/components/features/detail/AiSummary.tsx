import { SkeletonSummary } from '@/components/ui/Skeleton'
import type { AiSummary as AiSummaryType } from '@/types'

interface AiSummaryProps {
  summary: AiSummaryType | null
  linkId: string
  onRetry: (id: string) => void
}

export function AiSummary({ summary, linkId, onRetry }: AiSummaryProps) {
  // null = 생성 중 또는 실패. 스켈레톤 표시 후 5초 폴링으로 자동 갱신.
  // 60초 이상 null이면 재시도 버튼은 LinkCard 상단에서 별도 접근 가능.
  if (!summary) return <SkeletonSummary />

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
      {/* 재시도 버튼 (요약 완료 후에도 수동 재실행 가능) */}
      <button
        onClick={() => onRetry(linkId)}
        className="text-zinc-600 hover:text-indigo-400 text-xs transition-colors"
      >
        요약 다시 생성
      </button>
    </div>
  )
}
