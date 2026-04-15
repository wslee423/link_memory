# AGENTS.md
# 하네스 엔지니어 상세 작업 지침
> CLAUDE.md의 확장판. 상세한 구현 규칙, 타입, 파일 구조 정의.

## 역할 정의
너는 이 프로젝트의 풀스택 엔지니어다.
주어진 문서를 기반으로 스스로 판단하여 구현한다.
작업 중 사소한 판단은 네가 결정하고, 결과만 보고한다.

## 작업 전 필독 문서 순서
1. CLAUDE.md — 핵심 규칙 확인 (매 세션 자동 로드)
2. docs/PRODUCT_SENSE.md
3. docs/ARCHITECTURE.md
4. docs/product-specs/[해당 기능].md
5. docs/design-docs/layout.md + components.md
6. docs/PLANS.md

## 기능 구현 순서 (매번 준수)
1. DB 스키마/마이그레이션
2. 타입 정의 (types/index.ts)
3. API Route 구현
4. 서버 로직
5. UI 컴포넌트
6. 연결 + 통합 확인
7. 엣지 케이스 처리
8. npm run typecheck && npm run lint

## 전체 파일 구조
```
/app
  /api/links/route.ts
  /api/links/[id]/route.ts
  /api/links/[id]/summarize/route.ts
  /api/tags/route.ts
  /login/page.tsx
  /page.tsx
  /layout.tsx
  middleware.ts

/components
  /ui/Button.tsx, Badge.tsx, Input.tsx, Skeleton.tsx, Toast.tsx
  /features/links/LinkCard.tsx, LinkList.tsx, UrlInputBar.tsx
  /features/tags/TagBar.tsx, TagBadge.tsx, TagInput.tsx
  /features/detail/DetailPanel.tsx, AiSummary.tsx, MemoEditor.tsx

/lib/supabase/client.ts, server.ts
/lib/openai/client.ts, summarize.ts
/lib/youtube/metadata.ts, transcript.ts

/types/index.ts
/supabase/migrations/001_init_schema.sql

/.claude/commands/new-feature.md, check.md, progress.md
```

## 타입 정의 (types/index.ts)
```typescript
export interface Link {
  id: string
  userId: string
  url: string
  title: string
  thumbnailUrl: string | null
  channelName: string | null
  publishedAt: string | null
  // transcript: 서버 전용, 클라이언트 타입 미포함
  aiSummary: AiSummary | null
  memo: string
  tags: Tag[]
  createdAt: string
}
export interface AiSummary {
  summary: string[]
  insights: string[]
  generatedAt: string
}
export interface Tag {
  id: string
  name: string
}
```

## 핵심 코드 패턴

### API Route 인증 (모든 Route에 적용)
```typescript
const supabase = createRouteHandlerClient({ cookies })
const { data: { session } } = await supabase.auth.getSession()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### 메모 자동저장 훅
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

### AI 요약 스켈레톤
```typescript
// 생성 중: shimmer 스켈레톤
// 완료: fade-in 콘텐츠 전환
// 실패: "요약 생성 실패 - 재시도" 버튼
if (!summary) return <SkeletonSummary />
return <div className="fade-in">...</div>
```

### 태그 자동완성 (클라이언트 필터링)
```typescript
// GET /api/tags 전체 목록 1회 로드 후 클라이언트 필터링
const suggestions = allTags.filter(t => t.name.includes(input))
```

## 작업 완료 보고 형식
```
## 완료: [기능명]
- 구현 내용:
- 변경 파일:
- 확인 필요:
- 다음 작업:
```

## 환경 변수 (없으면 사용자에게 요청)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   ← 서버 전용
OPENAI_API_KEY              ← 서버 전용
YOUTUBE_DATA_API_KEY        ← 서버 전용
```
