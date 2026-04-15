# /review

Reviewer 에이전트. 모든 규칙이 준수되었는지 확인.

## 사용법

```
/review
```

주로 Implementer 완료 보고 후 자동 호출, 또는 독립적으로 실행 가능.

---

## 검증 체크리스트 (이 순서대로 진행)

### ✅ Step 1: 변경사항 파악

```bash
git status
git diff
```

**확인 항목**:
- [ ] 예상된 파일만 변경됨
- [ ] link_memory_docs/project/ 구조 유지
- [ ] 루트 문서(CLAUDE.md, AGENTS.md, CONSTITUTION.md, GLOSSARY.md) 미변경
- [ ] 삭제된 파일은 의도된 것인가?

**문제 발견 시**:
```
❌ "변경사항 확인 불가"

다음 파일이 예상 외로 변경되었습니다:
- [파일 경로]

이것은 의도된 변경인가요?
만약 아니면, 되돌려주세요.
```

---

### ✅ Step 2: 기술 검증

#### 2-1. TypeScript 컴파일

```bash
cd link_memory_docs/project
npm run typecheck
```

**결과**:
```
✅ 통과: 컴파일 오류 없음
❌ 실패: 오류 목록과 파일 위치 확인
```

**오류 예시**:
```typescript
// ❌ any 타입 금지
const handleClick = (e: any) => {}

// ✅ 명시적 타입
const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {}
```

**실패 시**:
```
❌ "TypeScript 오류 발견"

파일: components/LinkCard.tsx:42
오류: any 타입 금지

해결:
1. any를 구체적 타입으로 변경
2. Props interface 정의
3. npm run typecheck 재실행
```

---

#### 2-2. ESLint 검증

```bash
cd link_memory_docs/project
npm run lint
```

**결과**:
```
✅ 통과: Lint 오류 없음
❌ 실패: 오류 목록 확인
```

**흔한 오류**:
- `console.log` 남음
- 미사용 import
- 공백 규칙 위반

**실패 시**:
```
❌ "ESLint 오류 발견"

오류: 
- lib/utils.ts:12 - unused variable 'temp'
- components/Button.tsx:5 - console.log 제거 필요

해결:
1. 위 파일들 수정
2. npm run lint 재실행
```

---

### ✅ Step 3: SECURITY 규칙 검증

**문서**: @link_memory_docs/project/docs/SECURITY.md

#### 3-1. 환경변수 확인

```
검사 항목:
☐ SUPABASE_SERVICE_ROLE_KEY는 서버 전용 (route.ts만)
☐ OPENAI_API_KEY는 서버 전용 (route.ts만)
☐ YOUTUBE_DATA_API_KEY는 서버 전용 (route.ts만)
☐ NEXT_PUBLIC_* 변수만 클라이언트에서 사용
```

**위반 예시**:
```typescript
// ❌ 클라이언트에서 서버 변수 사용
const apiKey = process.env.OPENAI_API_KEY

// ✅ 올바른 방식: 서버에서만
// app/api/links/summarize/route.ts
const apiKey = process.env.OPENAI_API_KEY
```

**실패 시**:
```
❌ "SECURITY 위반: 환경변수 노출"

파일: components/AiSummary.tsx:10
문제: OPENAI_API_KEY가 클라이언트에서 노출됨

해결: 서버 API route 사용
- /api/summarize 엔드포인트로 요청
- 서버에서 OpenAI API 호출
```

#### 3-2. RLS 확인

```
검사 항목:
☐ 모든 Supabase 테이블에 RLS 활성화
☐ SELECT/INSERT/UPDATE/DELETE 정책 모두 있는가
☐ auth.uid()로 사용자 식별
```

**RLS 예시**:
```sql
-- ✅ 올바른 형태
CREATE POLICY "본인만 조회" ON links 
  FOR SELECT USING (auth.uid() = user_id);

-- ❌ 위험 (모든 사용자 조회 가능)
CREATE POLICY "모두 조회" ON links 
  FOR SELECT USING (true);
```

**실패 시**:
```
❌ "SECURITY 위반: RLS 미설정"

테이블: tags
문제: RLS가 활성화되지 않았습니다

해결:
1. supabase/migrations 파일 확인
2. ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
3. 정책 추가
```

---

### ✅ Step 4: RELIABILITY 규칙 검증

**문서**: @link_memory_docs/project/docs/RELIABILITY.md

```
검사 항목:
☐ 실패 시나리오마다 사용자 알림이 있는가?
☐ 스켈레톤/로딩 상태가 표시되는가?
☐ 에러 메시지가 명확한가?
☐ 재시도 버튼이 있는가? (필요시)
```

**확인 포인트**:

#### 4-1. API 실패 처리
```typescript
// ✅ 사용자에게 알림
try {
  const res = await fetch('/api/links', { ... })
  if (!res.ok) {
    toast.error('링크 저장 실패. 다시 시도해주세요.')
  }
} catch (error) {
  toast.error('네트워크 오류가 발생했습니다.')
}

// ❌ 조용한 실패
const res = await fetch('/api/links', { ... })
// 오류 처리 없음
```

#### 4-2. 로딩 상태
```typescript
// ✅ 스켈레톤 표시
if (!summary) {
  return <SkeletonSummary />
}

// ❌ 로딩 상태 없음
return <div>{summary}</div>
```

**실패 시**:
```
❌ "RELIABILITY 위반: 오류 처리 부족"

파일: app/api/links/route.ts:45
문제: YouTube API 실패 시 사용자 알림이 없음

해결: toast 또는 에러 응답 추가
- 메타데이터 수집 실패 시: 기본값 사용 + 사용자 알림
- AI 요약 실패 시: 재시도 버튼 표시
```

---

### ✅ Step 5: 구조 규칙 검증

**문서**: @link_memory_docs/project/AGENTS.md

#### 5-1. 파일 구조

```
확인 항목:
☐ /app/api/... 에 route.ts들
☐ /components/ui/ 에 기초 컴포넌트
☐ /components/features/ 에 기능 컴포넌트
☐ /lib/supabase/, /lib/openai/ 에 클라이언트
☐ /types/index.ts 에 모든 공용 타입
```

**위반 예시**:
```
❌ /components/random/Button.tsx → /components/ui/Button.tsx로 이동
❌ /lib/fetch.ts → /lib/utils.ts는 어디? 분산됨
```

**실패 시**:
```
❌ "파일 구조 위반"

파일이 잘못된 디렉토리에 있습니다:
- components/Button.tsx → components/ui/Button.tsx로 이동

@AGENTS.md에서 파일 구조를 확인하세요.
```

#### 5-2. 타입 정의

```
확인 항목:
☐ 모든 새로운 인터페이스가 types/index.ts에 있는가?
☐ Props는 interface로 정의되었는가?
☐ any 타입이 없는가?
```

**위반 예시**:
```typescript
// ❌ 파일 내부 정의
interface LinkCardProps { ... }

// ✅ types/index.ts에 정의
// types/index.ts
export interface LinkCardProps { ... }

// components/LinkCard.tsx
import type { LinkCardProps } from '@/types'
```

---

### ✅ Step 6: API 응답 검증

**중점**: 민감한 데이터가 클라이언트에 노출되지 않았는가?

```
검사 항목:
☐ transcript는 응답에 포함되지 않음
☐ 사용자 ID만 필요한 곳에 노출됨
☐ 불필요한 필드 제거됨
```

**위반 예시**:
```typescript
// ❌ transcript 노출 금지
const link = await db.from('links').select('*').single()
return NextResponse.json(link) // transcript 포함됨!

// ✅ 명시적 필드 선택
const link = await db.from('links')
  .select('id, title, url, ai_summary, memo, tags')
  .single()
return NextResponse.json(link) // transcript 제외
```

---

## 📋 최종 검증 결과

### ✅ 통과 (모두 OK)

```
## 검증 완료 ✅

### 변경사항
- 예상 파일만 변경됨
- 구조 유지

### 기술 검증
- ✅ TypeScript: 통과
- ✅ ESLint: 통과

### 규칙 검증
- ✅ SECURITY: 환경변수 OK, RLS OK
- ✅ RELIABILITY: 에러 처리 OK, 로딩 상태 OK
- ✅ 구조: 파일 구조 OK, 타입 정의 OK

### 결론
✅ 검증 통과. 다음: /progress로 진행
```

### ❌ 실패 (하나라도 No)

```
## 검증 실패 ❌

### 원인
1. TypeScript 오류 (any 타입 2개)
2. SECURITY 위반 (환경변수 노출)
3. RELIABILITY 부족 (에러 처리 없음)

### 해결 방법
1. any 타입을 구체적 타입으로 변경
2. API route로 서버 처리 변경
3. 실패 시 toast 추가

### 다음 단계
1. 위 3가지 수정
2. npm run typecheck && npm run lint 재실행
3. /review 다시 실행
```

---

## 🔑 핵심 규칙

**검증 통과 기준** (이 4가지 모두 만족해야 함):

1. ✅ `npm run typecheck` 통과
2. ✅ `npm run lint` 통과
3. ✅ SECURITY & RELIABILITY 규칙 준수
4. ✅ 파일 구조 & 타입 정의 완성

**하나라도 No면**: "검증 실패" → Implementer 재작업

---

## 💡 Quick Reference

```bash
# 로컬에서 자동 확인 가능한 것들
cd link_memory_docs/project
npm run typecheck
npm run lint
git diff

# 수동으로 확인해야 할 것들
# 1. SECURITY: 환경변수, RLS
# 2. RELIABILITY: 에러 처리, 로딩 상태
# 3. 구조: 파일 위치, 타입 정의
```
