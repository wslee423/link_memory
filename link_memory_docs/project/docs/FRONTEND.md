# FRONTEND.md

## 스택
- Next.js 14 (App Router) + TypeScript strict + Tailwind CSS

## 컴포넌트 규칙
- PascalCase 파일명
- 1파일 1컴포넌트
- Props는 interface로 타입 정의

## Tailwind 색상 팔레트
```
bg-zinc-950   배경
bg-zinc-800   카드
bg-zinc-700   카드 호버 / 선택
border-indigo-500  선택 강조
text-zinc-100  텍스트 1차
text-zinc-400  텍스트 2차
indigo-500    강조색
```

## 메모 자동저장 훅
```typescript
function useDebouncedSave(value: string, onSave: (v: string) => void, delay = 1500) {
  const timer = useRef<NodeJS.Timeout>()
  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSave(value), delay)
    return () => clearTimeout(timer.current)
  }, [value])
}
```

## AI 요약 스켈레톤
```typescript
if (!summary) {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-zinc-700 rounded w-3/4" />
      <div className="h-4 bg-zinc-700 rounded w-full" />
      <div className="h-4 bg-zinc-700 rounded w-2/3" />
    </div>
  )
}
return <div className="fade-in space-y-3">...</div>
```

## 태그 자동완성 (클라이언트 필터링)
```typescript
// 마운트 시 전체 태그 1회 로딩
useEffect(() => {
  fetch('/api/tags').then(r => r.json()).then(d => setAllTags(d.tags))
}, [])
// 클라이언트에서 필터링 (서버 요청 추가 없음)
const suggestions = allTags.filter(t => t.name.includes(input) && input.length > 0)
```
