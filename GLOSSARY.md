# GLOSSARY.md

운영 시 사용되는 핵심 용어의 명확한 정의.
**모든 에이전트가 같은 언어를 사용하도록.**

---

## 📋 핵심 용어

### "검증 통과" (Validation Pass)

**정의**: Reviewer가 다음 4가지를 모두 확인한 상태

1. ✅ `npm run typecheck` 통과 (TypeScript 컴파일 오류 없음)
2. ✅ `npm run lint` 통과 (ESLint 오류 없음)
3. ✅ **SECURITY 규칙 준수** (RLS, 환경변수 등)
4. ✅ **RELIABILITY 규칙 준수** (에러 처리, 사용자 알림 등)

**담당**: Reviewer (@review.md 참고)
**판정 기준**: 4가지 모두 Yes → "검증 통과"
**결과**: Progress 에이전트로 이동

**반대말**: "검증 실패" (위 4가지 중 하나라도 No)

---

### "구현 완료" (Implementation Complete)

**정의**: Implementer가 다음을 완료한 상태

1. ✅ 코드 작성 (DB, API, UI 모두)
2. ✅ `npm run typecheck` 실행 (로컬 확인)
3. ✅ `npm run lint` 실행 (로컬 확인)
4. ✅ git에 변경사항 staged

**단계**: Implementer 작업 단계에서 이 상태 도달
**보고 방식**: 
```
## 완료: [기능명]
- 구현 내용: [간략 설명]
- 변경 파일: [파일 목록]
- ✅ typecheck: 로컬 확인됨
- ✅ lint: 로컬 확인됨
```

**다음**: Reviewer로 진행

---

### "에이전트 실패" (Agent Failure)

**정의**: 에이전트가 다음 중 하나를 만났을 때

1. ❌ TypeScript 컴파일 오류
2. ❌ ESLint 오류
3. ❌ SECURITY 규칙 위반
4. ❌ RELIABILITY 규칙 위반
5. ❌ 파일 구조 위반
6. ❌ 환경 변수 누락 (필수 변수)

**감지 주체**: Reviewer
**처리 방식**:
```
"검증 실패: [구체적 원인]

수정 필요:
- [어떤 파일을]
- [어떻게 수정할지]

재시도: 수정 후 /review 다시 실행"
```

**재시도**: 같은 에이전트 재생성 with 오류 명시

---

### "규칙 준수" (Rule Compliance)

**정의**: 다음 문서들의 규칙을 모두 따르는 상태

| 문서 | 확인 항목 |
|------|---------|
| **CONSTITUTION.md** | 3가지 핵심 원칙 (Simplicity, User First, Automation) |
| **SECURITY.md** | RLS 활성화, 환경변수 미노출, 입력값 검증 |
| **RELIABILITY.md** | 에러 처리, 사용자 알림, 로딩 상태 |
| **AGENTS.md** | 파일 구조, 타입 정의, API 인증 |
| **design-docs/** | 색상, 레이아웃, 컴포넌트 스펙 |

**검증자**: Reviewer
**통과 기준**: 위 5개 카테고리 모두 OK

---

### "구현" (Implementation)

**범위**: DB 스키마 + 타입 정의 + API Route + UI 컴포넌트

**세부**:
- DB: 마이그레이션 SQL
- 타입: types/index.ts 업데이트
- API: route.ts 작성
- UI: React 컴포넌트 작성

**모두 포함되어야 "구현"**

---

### "엣지 케이스" (Edge Case)

**정의**: 정상 흐름이 아닌 예외 상황

**예시**:
```
링크 저장 기능:
- 정상: URL 입력 → 저장 → 카드 표시
- 엣지: 중복 URL / 유효하지 않은 URL / 메타 수집 실패

AI 요약:
- 정상: 자막 수집 → 요약 생성 → 표시
- 엣지: 자막 없음 / API 실패 / 타임아웃
```

**처리 시점**:
```
PLANS.md (Day 7):
"엣지 케이스 UI 처리"

→ 정상 경로 완성 후, 마지막에 처리
→ 나중에 추가 OK
```

**중요**: 엣지 케이스는 **UI만 아니라 API 실패 처리**도 포함

---

### "검증" (Review)

**범위**: 코드 품질 + 규칙 준수

**체크 항목** (review.md 체크리스트):
```
☐ git diff로 변경사항 확인
☐ npm run typecheck 통과
☐ npm run lint 통과
☐ SECURITY.md 규칙
☐ RELIABILITY.md 규칙
☐ AGENTS.md 규칙
☐ 파일 구조 유지
```

**담당**: Reviewer 에이전트

---

## 📊 용어 관계도

```
Orchestrator
  ↓ [기획]
"구현해야 할 기능"을 Implementer에 지시
  ↓
Implementer
  ↓ [작업]
"구현 완료" 보고
  ↓
Reviewer
  ↓ [검증]
"규칙 준수" + "검증 통과" 확인
  ├─ No: "에이전트 실패" → Implementer 재시도
  └─ Yes: "검증 통과" → Progress로 진행
  ↓
Progress
  ↓ [마무리]
git commit + 문서 업데이트
```

---

## 🎯 사용 예시

### 예시 1: 정상 경로
```
Orchestrator: "기능 명세를 이해했으니 구현하세요"
  ↓
Implementer: "## 완료: 링크 저장 + 태그 (규칙 준수)"
  ↓
Reviewer: "검증 통과 ✅ (typecheck, lint, 규칙 모두 OK)"
  ↓
Progress: "git commit + 문서 업데이트"
```

### 예시 2: 실패 경로
```
Implementer: "## 완료: 링크 저장"
  ↓
Reviewer: "검증 실패 ❌
  - 원인: any 타입 사용 (규칙 위반)
  - 수정: Props interface 정의 필요"
  ↓
Implementer: "수정 완료, /review 재실행"
  ↓
Reviewer: "검증 통과 ✅"
  ↓
Progress: "완료"
```

---

## 📌 주의사항

1. **"완료" ≠ "통과"**
   - 완료: Implementer 코드 작성 끝
   - 통과: Reviewer 검증 끝

2. **"검증" ≠ "테스트"**
   - 검증: 코드 품질 + 규칙 (자동 확인)
   - 테스트: 기능 동작 (수동 확인)

3. **"규칙 준수" = 모든 규칙**
   - CONSTITUTION만 아님
   - SECURITY, RELIABILITY도 포함

4. **"엣지 케이스"는 마지막에**
   - 정상 경로 먼저
   - 엣지는 Day 7에 처리
