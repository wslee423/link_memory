# /review

Reviewer 에이전트. 이슈를 발견하면 직접 수정하고 재검증하는 실행 루프.

## 사용법

```
/review
```

Implementer 완료 후 자동 호출, 또는 독립 실행 가능.

---

## 실행 루프 (핵심)

```
LOOP:
  1. 전체 체크리스트 순서대로 실행
  2. 이슈 목록 수집
  3. 이슈가 없으면 → "검증 완료" 보고 후 종료
  4. 이슈가 있으면 → 직접 수정
  5. npm run typecheck && npm run lint 재실행
  6. 처음으로 돌아가 재검증
  7. 3회 반복 후에도 실패 시 → 사용자에게 에스컬레이션
```

수정은 보고 후 승인이 아닌 **즉시 실행**. 단, 구조적 변경(파일 이동, DB 스키마 변경)은 사용자 승인 후 진행.

---

## 체크리스트

### Step 1: 변경사항 파악

```bash
git status
git diff
```

확인 항목:
- [ ] 예상된 파일만 변경됨
- [ ] link_memory_docs/project/ 구조 유지
- [ ] 루트 문서(CLAUDE.md, AGENTS.md, CONSTITUTION.md) 미변경
- [ ] 삭제된 파일은 의도된 것인가?

---

### Step 2: 기술 검증 (자동)

```bash
cd app && npm run typecheck && npm run lint
```

- [ ] TypeScript 컴파일 오류 없음 (`any` 타입 포함)
- [ ] ESLint 오류 없음 (`console.log`, unused import 등)

실패 시 → 즉시 수정 후 재실행.

---

### Step 3: 보안 (SECURITY)

#### 3-1. 환경변수 노출
```
☐ SUPABASE_SERVICE_ROLE_KEY — route.ts 전용
☐ OPENAI_API_KEY — route.ts 전용
☐ YOUTUBE_DATA_API_KEY — route.ts 전용
☐ NEXT_PUBLIC_* 변수만 클라이언트 사용
```

#### 3-2. RLS
```
☐ 신규 테이블에 RLS 활성화 및 CRUD 정책 전체 존재
```

#### 3-3. 인가(Authorization) 완전성 ← 신규
```
☐ 모든 PATCH/DELETE 라우트에서 user_id 소유권 확인
☐ RLS 우회가 필요한 admin 쿼리는 최소한으로만 사용
```

**이번에 발견된 패턴 — 반드시 검사**:
```typescript
// ❌ tagIds만 업데이트할 때 user_id 확인 누락
await supabase.from('link_tags').delete().eq('link_id', id)

// ✅ 반드시 소유권 먼저 확인
const { data: owned } = await supabase
  .from('links').select('id')
  .eq('id', id).eq('user_id', user.id).maybeSingle()
if (!owned) return NextResponse.json({ error: '링크를 찾을 수 없습니다.' }, { status: 404 })
```

---

### Step 4: 신뢰성 (RELIABILITY)

#### 4-1. 에러 처리 & 사용자 알림
```
☐ 모든 API 실패 → toast 또는 UI 에러 상태
☐ 재시도 버튼 필요한 곳에 존재
```

#### 4-2. Fire-and-forget 패턴 감사 ← 신규
fire-and-forget(`fetch(...).catch(() => {})`)을 쓰는 곳은 반드시 아래 두 가지 중 하나 필요:

```
☐ DB에 에러 상태를 기록하는가? (ai_summary_error 등)
☐ UI에 시간 기반 fallback이 있는가? (createdAt 기준 N초 후 에러 표시)
```

**이번에 발견된 패턴**:
```typescript
// ❌ fire-and-forget인데 실패 시 UI가 영원히 로딩
fetch(`/api/links/${id}/summarize`, { method: 'POST' }).catch(() => {})

// ✅ DB에 ai_summary_error 기록 + UI에서 createdAt 기반 타임아웃 fallback
```

#### 4-3. UI 상태 머신 완전성 ← 신규
비동기 작업을 표시하는 모든 컴포넌트에서 3가지 상태가 모두 **도달 가능**한지 확인:

```
☐ loading 상태 → skeleton/spinner 표시됨
☐ success 상태 → 결과 표시됨
☐ error 상태 → 에러 메시지 + 재시도 버튼이 loading/success와 독립적으로 도달 가능
```

**이번에 발견된 패턴 — error가 success 분기 안에 숨어있는 경우**:
```typescript
// ❌ summary가 없으면 에러 버튼에 영원히 도달 불가
if (summary) {
  return <div>{summary}</div>
} else if (error) {
  return <RetryButton /> // ← summary=null이어야 도달하는데, error도 null이면 skeleton만 뜸
}

// ✅ error를 최우선으로 분기
if (summaryError) return <RetryButton reason={summaryError} />
if (!summary && timedOut) return <RetryButton reason="시간 초과" />
if (!summary) return <SkeletonSummary />
return <SummaryContent summary={summary} />
```

---

### Step 5: 런타임 & 배포 환경 설정 ← 신규

외부 API를 호출하는 모든 API Route에 대해:

#### 5-1. Vercel 타임아웃 설정
```
☐ OpenAI / YouTube / 외부 HTTP 호출이 있는 route.ts에 maxDuration 선언됨
```

```typescript
// ❌ 기본 10초 → OpenAI/YouTube 호출 시 타임아웃
export async function POST(...) { ... }

// ✅ 명시적 확장
export const maxDuration = 60  // 파일 최상단
export async function POST(...) { ... }
```

외부 API 호출이 있는 파일 목록 (이 파일들은 반드시 체크):
- `app/api/links/route.ts` (YouTube + 자막)
- `app/api/links/[id]/summarize/route.ts` (OpenAI + YouTube)

#### 5-2. 외부 패키지 런타임 위험 메모
정적 분석으로 잡을 수 없지만 검토 시 플래그:
```
☐ 서드파티 패키지가 Vercel 서버리스 환경에서 테스트되었는가?
  - "type": "module" + CJS 혼재 패키지는 런타임 실패 위험
  - IP 제한이 있는 외부 서비스는 Vercel 공유 IP에서 차단될 수 있음
  → 해결: 공식 API(YouTube Data API v3 등)로 대체
```

---

### Step 6: 타입-쿼리 정합성 ← 신규

TypeScript 타입과 실제 DB SELECT가 일치하는지:

```
☐ types/index.ts 인터페이스 필드가 실제 API 응답 필드와 1:1 일치
☐ DB에서 select하지 않는 필드가 타입에 포함되어 있지 않음
☐ DB에 추가된 컬럼(ai_summary_error 등)이 타입에 반영됨
☐ toLink() 같은 매핑 함수가 모든 필드를 올바르게 변환
```

**이번에 발견된 패턴**:
```typescript
// ❌ userId는 타입에 있지만 DB select에 없고 toLink()도 안 씀 → 항상 undefined
export interface Link {
  userId: string  // 사용 안 되는 dead field
}

// ✅ 타입과 실제 사용 일치
export interface Link {
  // userId 제거 — DB에서 select 안 하고 클라이언트에서도 사용 안 함
}
```

---

### Step 7: API 응답 데이터 노출

```
☐ transcript는 응답에 포함되지 않음 (select * 사용 금지)
☐ 불필요한 내부 필드 제거됨
```

```typescript
// ❌ transcript 포함 가능성
const link = await db.from('links').select('*').single()

// ✅ 명시적 필드 선택
const link = await db.from('links')
  .select('id, title, url, ai_summary, ai_summary_error, memo, tags, created_at, is_archived')
  .single()
```

---

## 최종 보고 형식

### ✅ 통과

```
## 검증 완료 ✅ (N회 루프)

### 수행된 수정 (있을 경우)
- [수정 내용]: [파일]:[라인]

### 체크 결과
- ✅ TypeScript / ESLint: 통과
- ✅ SECURITY: 환경변수, RLS, 인가 OK
- ✅ RELIABILITY: fire-and-forget fallback, UI 상태 머신, 에러 처리 OK
- ✅ RUNTIME: maxDuration 설정 OK
- ✅ 타입-쿼리 정합성 OK
- ✅ API 응답 노출 OK

### 결론
검증 통과. 다음: /progress
```

### ❌ 에스컬레이션 (3회 루프 후 미해결)

```
## 검증 실패 — 사용자 확인 필요 ❌

### 해결 불가 원인
1. [구체적 이슈]: [이유]

### 수동으로 필요한 조치
1. [조치 내용]

### 자동 수정 완료된 것
- [수정 내용]
```

---

## Quick Reference

```bash
# 자동 검증
cd app && npm run typecheck && npm run lint

# 수동 검토 대상
# Step 3: 환경변수 grep, RLS 정책, PATCH user_id 확인
# Step 4: fire-and-forget 패턴, UI 상태 분기 순서
# Step 5: maxDuration 선언, 외부 패키지 위험
# Step 6: types/index.ts vs select 필드 대조
```
