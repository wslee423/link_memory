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
  /api/links/route.ts                  GET(목록), POST(저장)
  /api/links/[id]/route.ts             GET, PATCH, DELETE
  /api/links/[id]/summarize/route.ts   POST (AI 요약 실행)
  /api/tags/route.ts                   GET, POST
  /api/tags/[id]/route.ts              PATCH(이름변경), DELETE
  /login/page.tsx
  /save/page.tsx                       북마클릿 팝업
  /page.tsx
  /layout.tsx
  proxy.ts                             인증 미들웨어 (Next.js 16)

/components
  /ui/Skeleton.tsx, Toast.tsx
  /features/links/LinkCard.tsx, UrlInputBar.tsx, SearchBar.tsx
  /features/tags/TagBar.tsx, TagInput.tsx
  /features/detail/DetailPanel.tsx, AiSummary.tsx, MemoEditor.tsx

/lib/supabase/client.ts, server.ts
/lib/openai/summarize.ts
/lib/youtube/metadata.ts, transcript.ts

/types/index.ts

/.claude/commands/new-feature.md, check.md, progress.md
```

## 타입 정의 (types/index.ts)
```typescript
export interface Link {
  id: string
  url: string
  title: string
  thumbnailUrl: string | null
  channelName: string | null
  publishedAt: string | null
  // transcript: 서버 전용, 클라이언트 타입 미포함
  aiSummary: AiSummary | null
  aiSummaryError: string | null  // 실패 사유 (사용자 표시용)
  memo: string
  tags: Tag[]
  createdAt: string
  isArchived: boolean
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
export interface CreateTagRequest { name: string }
export interface UpdateTagRequest { name: string }
export interface UpdateLinkRequest {
  memo?: string
  tagIds?: string[]
  isArchived?: boolean
}
```

## 핵심 코드 패턴

### API Route 인증 (모든 Route에 적용)
```typescript
// @supabase/ssr 사용 (createRouteHandlerClient 구 패턴 사용 금지)
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### 메모 자동저장 (MemoEditor.tsx)
```typescript
// useRef로 타이머 관리, onSave throws on failure
const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
clearTimeout(timer.current)
timer.current = setTimeout(async () => {
  try { await onSave(linkId, val); setStatus('saved') }
  catch { setStatus('error') }
}, 1500)
```

### AI 요약 상태 머신 (AiSummary.tsx)
```typescript
// 이 순서로 분기할 것 — error를 반드시 최우선으로
if (summaryError) return <RetryButton reason={summaryError} />
if (!summary && timedOut) return <RetryButton reason="요약을 생성하지 못했습니다." />
if (!summary) return <SkeletonSummary />
return <div className="fade-in">...</div>
```

### 태그 자동완성 (클라이언트 필터링)
```typescript
// GET /api/tags 전체 목록 1회 로드 후 클라이언트 필터링 (서버 재요청 없음)
const suggestions = input.trim()
  ? allTags.filter((t) => !selectedIds.has(t.id) && t.name.includes(input.trim()))
  : []
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
