# AGENTS.md (Repository Root)

레포지토리 레벨 에이전트 조율 규칙과 계층 구조.

---

## 에이전트 계층도

```
                       [사용자]
                          |
                   /orchestrate
                          |
          ┌────────────────┴────────────────┐
          |                                 |
    [Orchestrator]                    (메인 워크플로우)
    (이 파일 기반)                         |
          |                                 |
          ├──────────────────────────────────┼─────────────┐
          |                                  |             |
    [Implementer]                    [Reviewer]    [Progress]
  (project/AGENTS.md 기반)      (review.md 기반) (progress.md 기반)
    /new-feature                       /review      /progress
```

---

## 에이전트 역할 상세

### Level 0: Orchestrator (레포 루트)

**책임**:
- 전체 작업 흐름 기획
- 태스크 분석 → 우선순위 결정
- Implementer 서브에이전트 생성 및 지시
- Reviewer 검증 요청
- 진행 상황 추적

**CLAUDE.md 참조**:
- D:\wlabs\link_memory\CLAUDE.md

**지침 문서**:
- D:\wlabs\link_memory\AGENTS.md (이 파일)

**워크플로우**:
```
/orchestrate [기능명]
  ↓
1. link_memory_docs/project/docs/PLANS.md 확인
2. link_memory_docs/project/docs/product-specs/[기능].md 분석
3. 선행 조건(blockedBy) 확인
4. Implementer 서브에이전트 생성
   - prompt: "다음 기능을 구현하세요: [기능명]. 
     명세: [product-specs 경로]. 
     지침: link_memory_docs/project/AGENTS.md"
5. Implementer 완료 후 Reviewer 호출
6. Reviewer 통과 시 Progress 업데이트
```

---

### Level 1: Implementer (link_memory_docs/project/)

**책임**:
- Application Level CLAUDE.md + AGENTS.md 준수하며 기능 구현
- DB 스키마 → 타입 → API → UI
- typecheck/lint 통과 확보

**CLAUDE.md 참조**:
- D:\wlabs\link_memory\link_memory_docs\project\CLAUDE.md

**지침 문서**:
- D:\wlabs\link_memory\link_memory_docs\project\AGENTS.md

**명령**:
- `/new-feature` (project/.claude/commands/new-feature.md)

**핸드오프 규칙**:
- 구현 완료 후 → Orchestrator에게 "완료, /review 진행 중"으로 보고
- Reviewer 통과 전까지 → 대기

---

### Level 1: Reviewer (레포 루트)

**책임**: 다음 4가지를 **모두** 확인하고 "검증 통과" 판정

1. **기술 검증** (자동 확인 가능)
   - `npm run typecheck` 통과
   - `npm run lint` 통과

2. **SECURITY 규칙** (수동 확인)
   - RLS 활성화되었는가?
   - 환경변수 노출되지 않았는가?
   - 입력값 검증이 있는가?

3. **RELIABILITY 규칙** (수동 확인)
   - 에러 처리가 있는가?
   - 사용자에게 오류가 명확히 전달되는가?
   - 로딩 상태가 표시되는가?

4. **구조 규칙** (수동 확인)
   - 파일 구조가 유지되었는가?
   - 타입 정의가 완성되었는가?
   - 응답에서 민감한 데이터(transcript 등)가 노출되지 않았는가?

**결정 기준**:
- 4가지 모두 OK → "검증 통과" ✅
- 하나라도 Not OK → "검증 실패" ❌

**CLAUDE.md 참조**:
- D:\wlabs\link_memory\CLAUDE.md

**지침 문서**:
- D:\wlabs\link_memory\.claude\commands\review.md

**명령**:
- `/review` (.claude/commands/review.md)

**핸드오프 규칙**:
- 통과 시 → "검증 완료, Progress로 이동"
- 실패 시 → "검증 실패. [구체적 이유]"

---

### Level 1: Progress Tracker (link_memory_docs/project/)

**책임**:
- 진행 상황 기록
- docs/exec-plans/ 업데이트
- git commit (descriptive message)

**CLAUDE.md 참조**:
- D:\wlabs\link_memory\link_memory_docs\project\CLAUDE.md

**지침 문서**:
- D:\wlabs\link_memory\link_memory_docs\project\.claude\commands\progress.md

**명령**:
- `/progress` (project/.claude/commands/progress.md)

**핸드오프 규칙**:
- Reviewer 통과 후 자동 호출
- 작업 완료 시 git commit

---

## 에이전트 간 핸드오프 규칙

### 정상 경로 (Success)

```
[Orchestrator] /orchestrate [기능]
    ↓
[Orchestrator] Implementer 서브에이전트 생성 + 지시
    ↓
[Implementer] 구현 진행
    ↓
[Orchestrator] "구현 완료, /review 진행 중" 보고 수신
    ↓
[Reviewer] /review 실행 → 통과
    ↓
[Orchestrator] "검증 완료" 수신
    ↓
[Progress] /progress 자동 호출
    ↓
[완료]
```

### 실패 경로 (Failure)

```
[Implementer] typecheck/lint 실패
    ↓
[Orchestrator] 실패 보고 수신
    ↓
[Orchestrator] Implementer 서브에이전트 재생성
    → "다음 오류를 수정하세요: [오류]"
    ↓
[Implementer] 수정 진행
    ↓
[다시 정상 경로로]
```

---

## 핸드오프 체크리스트

### Implementer → Reviewer

❌ 실패 (검증 불가):
- [ ] TypeScript 컴파일 오류 존재
- [ ] Application Level CLAUDE.md 규칙 위반
- [ ] 파일 구조 변경
- [ ] 타입 정의 불완전 (`any` 사용 등)

✅ 통과 (검증 진행):
- [ ] `npm run typecheck` 통과
- [ ] `npm run lint` 통과
- [ ] 모든 새 함수에 명확한 타입 정의
- [ ] Security 규칙 준수 (RLS, 환경변수 등)
- [ ] 엣지 케이스 처리

### Reviewer → Progress

✅ 통과:
- [ ] git diff 분석 완료
- [ ] typecheck/lint 재검증 통과
- [ ] Application Level 규칙 준수 확인

❌ 실패 (Implementer 재작업):
- [ ] 규칙 위반 발견
- [ ] 테스트 실패
- [ ] 문서 불일치

---

## 통신 프로토콜

### 메시지 형식

**Implementer → Orchestrator**:
```
## 구현 완료: [기능명]
- 구현 내용: [간략 설명]
- 변경 파일: [파일 목록]
- npm run typecheck: ✅ 통과
- npm run lint: ✅ 통과
```

**Reviewer → Orchestrator**:
```
## 검증 완료
- git diff: ✅ 정상
- typecheck: ✅ 통과
- lint: ✅ 통과
- 규칙 준수: ✅ 확인
```

**Reviewer → Orchestrator (실패)**:
```
## 검증 실패
- 원인: [구체적 이유]
- 대응: [해결 방법]
```

---

## 에이전트 선택 가이드

### /orchestrate 사용하는 경우
- 신규 기능 구현 시작
- 여러 에이전트의 조율이 필요한 경우
- 레포 루트 레벨 의사결정이 필요한 경우

### /new-feature 직접 사용하는 경우
- 기능 구현만 필요한 경우 (Orchestrator 거치지 않음)
- 빠른 iteration이 필요한 경우

### /review 직접 사용하는 경우
- 구현 후 검증만 필요한 경우
- 리뷰 자동화

---

## 실패 시 재시작

에이전트가 실패한 경우:

1. **원인 파악**:
   - git status로 변경사항 확인
   - npm run typecheck로 컴파일 오류 확인
   - npm run lint로 스타일 오류 확인

2. **재시작**:
   - 같은 에이전트 유형으로 재생성
   - 명시적으로 오류 내용 포함
   - "다음 오류를 수정하세요: [오류]"

3. **에스컬레이션**:
   - 3회 이상 실패 시 Orchestrator에게 보고
   - 수동 개입 필요 가능성 높음

---

## 환경 변수 (모든 에이전트 공유)

```
NEXT_PUBLIC_SUPABASE_URL=        (클라이언트 노출 가능)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   (클라이언트 노출 가능)
SUPABASE_SERVICE_ROLE_KEY=       (서버 전용)
OPENAI_API_KEY=                  (서버 전용)
YOUTUBE_DATA_API_KEY=            (서버 전용)
```

Implementer는 이 변수들이 없으면 사용자에게 요청.
