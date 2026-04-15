# FRONTEND.md

## 스택
- Next.js 16 (App Router) + TypeScript strict + Tailwind CSS v4

## 컴포넌트 규칙
- PascalCase 파일명
- 1파일 1컴포넌트
- Props는 interface로 타입 정의
- `'use client'` 최소화 — useState/useEffect가 필요한 컴포넌트만

## Tailwind 색상 팔레트 (다크모드 전용)
```
bg-zinc-950        배경
bg-zinc-800        카드
bg-zinc-700        카드 호버 / 선택
border-indigo-500  선택 강조
text-zinc-100      텍스트 1차
text-zinc-400      텍스트 2차
text-zinc-500      텍스트 3차
indigo-500         강조색
```

## 메모 자동저장 패턴 (MemoEditor.tsx)
```typescript
// useRef로 타이머 관리, 상태: 'idle' | 'saving' | 'saved' | 'error'
const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
  setMemo(e.target.value)
  setStatus('saving')
  clearTimeout(timer.current)
  timer.current = setTimeout(async () => {
    try {
      await onSave(linkId, e.target.value)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }, 1500)
}
```

## AI 요약 상태 머신 (AiSummary.tsx)
4가지 상태를 이 순서로 분기:
```typescript
// 1. DB에 명시적 에러 → 에러 메시지 + 재시도 버튼
if (summaryError) return <ErrorState message={summaryError} />

// 2. 에러가 DB에 안 쓰였지만 90초 초과 → 시간 초과 에러
if (!summary && timedOut) return <ErrorState message="요약을 생성하지 못했습니다." />

// 3. 생성 중 → shimmer 스켈레톤
if (!summary) return <SkeletonSummary />

// 4. 성공 → fade-in 콘텐츠
return <SummaryContent summary={summary} />
```

`timedOut`은 `createdAt` 기준으로 계산 (마운트 시간 기준 아님):
```typescript
const [timedOut, setTimedOut] = useState(() =>
  Date.now() - new Date(createdAt).getTime() > FAILURE_THRESHOLD_MS
)
```

## 태그 자동완성 패턴 (TagInput.tsx)
```typescript
// 상위에서 전체 태그 1회 로딩 → props로 전달 (서버 재요청 없음)
const suggestions = input.trim()
  ? allTags.filter((t) => !selectedIds.has(t.id) && t.name.includes(input.trim()))
  : []
```

## 폴링 패턴 (page.tsx)
AI 요약 미완료 링크가 있을 때만 5초 폴링. 성공 또는 에러 확정 시 중단:
```typescript
useEffect(() => {
  if (links.every((l) => l.aiSummary !== null || l.aiSummaryError !== null)) return
  const id = setInterval(fetchLinks, 5000)
  return () => clearInterval(id)
}, [links, fetchLinks])
```
