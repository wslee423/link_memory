# /orchestrate

레포지토리 루트 레벨 Orchestrator 에이전트.
신규 기능 구현 시 전체 워크플로우를 조율한다.

## 사용법

```
/orchestrate [기능명]
```

예:
```
/orchestrate 링크 저장 + 태그
/orchestrate AI 자동 요약
/orchestrate 메모 작성
```

---

## 실행 순서

### 0. 전제 조건 확인

Orchestrator가 시작하기 전에:
- [ ] PLANS.md에 미완성 태스크가 있는가?
- [ ] 환경 변수가 설정되었는가? (.env 파일)
- [ ] 프로젝트가 초기화되었는가? (npm install 완료)

만약 No라면:
```
"기초 세팅이 필요합니다.
/orchestrate Next.js 프로젝트 기반 세팅
을 먼저 실행해주세요."
```

---

### 1. 기획 단계

**Orchestrator Handoff Checklist**:

```
1. PLANS.md 분석
   ☐ 다음 미완성 태스크 찾음
   ☐ 날짜 라벨 확인 (Day 1-7)
   ☐ blockedBy 의존성 확인
   
2. product-specs 문서 읽음
   ☐ 기능 명세 완전히 이해
   ☐ DoD (Definition of Done) 확인
   ☐ 엣지 케이스 파악
   
3. 선행 조건 확인
   ☐ 이 기능의 blockedBy 없음
   ☐ 선행 기능이 모두 완료됨
   
4. 구현 계획 수립
   ☐ DB 스키마 변경 필요한가?
   ☐ API Route 필요한가?
   ☐ UI 컴포넌트 필요한가?
```

### 2. Implementer 서브에이전트 생성 및 지시

**Orchestrator → Implementer 핸드오프**:

```
Agent 타입: general-purpose (또는 Implementer 에이전트)

프롬프트 템플릿:
---

다음 기능을 구현하세요: [기능명]

## 요구사항
@link_memory_docs/project/docs/product-specs/[기능].md

## 핵심 규칙 (반드시 준수)
1. @GLOSSARY.md - 용어 정의 (특히 "구현 완료"의 의미)
2. @CONSTITUTION.md - 3가지 원칙 (Simplicity, User First, Automation)
3. @link_memory_docs/project/CLAUDE.md - 구현 규칙
4. @link_memory_docs/project/AGENTS.md - 구현 상세 지침

## 디자인
@link_memory_docs/project/docs/design-docs/

## 개발 순서
1. DB 스키마 변경 (필요 시) → supabase/migrations/
2. 타입 정의 → types/index.ts
3. API Route 구현 → app/api/...
4. UI 컴포넌트 구현 → components/...
5. 로컬 검증:
   - npm run typecheck (오류 없음)
   - npm run lint (오류 없음)

## 완료 보고 형식
다음을 정확히 따라주세요:

## 완료: [기능명]
- 구현 내용: [한 문장 요약]
- 변경 파일:
  - supabase/migrations/...
  - types/index.ts
  - app/api/...
  - components/...
- ✅ 로컬 typecheck: 통과
- ✅ 로컬 lint: 통과

## 변경사항 (git 커밋 메시지)
feat: [기능명]
- [구체적 구현 내용]
- [구체적 구현 내용]

---
```

**주의사항**:
- Implementer가 정보를 요청하면 즉시 답변할 것
- 명세가 불명확하면 질문하도록 권장
- 타임아웃: 30분 (초과 시 실패 판정)

### 3. Implementer 결과 수신 및 실패 처리

#### 성공 경로
```
"## 완료: [기능명]
- 구현 내용: [설명]
- 변경 파일: [목록]
- ✅ typecheck: 통과
- ✅ lint: 통과"

→ 다음: Reviewer 호출 (Step 4)
```

#### 실패 경로 (1차)
```
Implementer: "구현 실패: [오류]"

원인 분석:
- TypeScript 오류?
- Lint 오류?
- 규칙 위반?

처리:
[같은 Implementer 재생성]
"다음 오류를 수정하세요:
[구체적 오류]

참고: @GLOSSARY.md, @AGENTS.md"
```

#### 실패 경로 (2차)
```
다시 실패했을 경우:

Orchestrator 메시지:
"[기능명]이 2번 연속 실패했습니다.

원인:
1. 명세가 불명확한가?
2. 규칙 이해 부족?
3. 기술적 난제?

조치:
- 명세 재검토
- 규칙 재설명
- 에스컬레이션 검토"

[같은 Implementer 재생성 with 상세 피드백]
```

#### 실패 경로 (3차 = 최종 실패)
```
3번 연속 실패:

[Orchestrator가 사용자에게 보고]

"🚨 [기능명] 구현 막힘

상황:
- Implementer가 3번 시도했으나 실패
- 원인:
  1. [1차 실패 원인]
  2. [2차 실패 원인]
  3. [3차 실패 원인]

권장 조치:
1. 명세서 재검토 (product-specs)
2. 환경 변수 확인 (.env)
3. 프로젝트 상태 확인 (npm install)
4. 수동 개입 검토

다음: /orchestrate 종료, 사용자 대기"
```

**3회 실패 시 Fallback**:
- 더 이상 자동 재시도 하지 않음
- 사용자가 직접 조사 후 /orchestrate 재실행
- 또는 상위 레벨 (Day 1-2 기초 세팅) 다시 확인

### 4. Reviewer 호출

**Implementer → Orchestrator → Reviewer**:

```
Orchestrator 확인:
☐ Implementer의 보고 메시지가 형식에 맞는가?
☐ "구현 완료"를 선언했는가?
☐ typecheck/lint 통과를 확인했는가?
```

**Reviewer 시작**:
```
명령: /review
(자동으로 SECURITY, RELIABILITY, 구조 검증)
```

**Reviewer 역할** (@review.md 참고):
1. ✅ git diff 분석
2. ✅ npm run typecheck 재실행
3. ✅ npm run lint 재실행
4. ✅ SECURITY 규칙 확인
5. ✅ RELIABILITY 규칙 확인
6. ✅ 구조 규칙 확인

### 5. Reviewer 결과 수신

#### 통과 경로 ✅
```
"## 검증 완료 ✅

변경사항:
- 예상 파일만 변경됨
- 구조 유지

기술 검증:
- ✅ TypeScript: 통과
- ✅ ESLint: 통과

규칙 검증:
- ✅ SECURITY: OK
- ✅ RELIABILITY: OK
- ✅ 구조: OK

결론: 검증 통과"

→ 다음: Progress 호출 (Step 6)
```

#### 실패 경로 ❌
```
"## 검증 실패 ❌

원인:
1. [구체적 위반 사항]
2. [구체적 위반 사항]

해결:
- [수정 방법]
- [확인 방법]

다음: 수정 후 /review 재실행"

→ Implementer에게 피드백 (Step 3으로 돌아감)
```

**Reviewer 실패 시 재시도**:
- Implementer가 지적된 항목 수정
- git 변경사항 추가
- `/review` 다시 실행
- (반복)

### 6. Progress 호출

**Reviewer → Orchestrator → Progress**:

```
Progress 에이전트 생성:

"다음 작업을 진행하세요:

1. PLANS.md 업데이트
   - [기능명] 체크 표시
   - 완료일 기록

2. git commit
   ```
   feat: [기능명]
   - [구체적 구현 내용]
   
   Reviewed-By: [Reviewer 에이전트]
   ```

3. docs/exec-plans/ 갱신
   - 진행 상황 기록

완료 후 보고:
'## 진행상황 업데이트 완료
- PLANS.md: [기능명] 체크 완료
- git: commit [hash] pushed
- docs: 진행 상황 기록'
"
```

**Progress 역할** (@progress.md 참고):
- PLANS.md 업데이트
- git commit 작성 및 push
- docs/exec-plans/ 갱신

---

### 7. 완료 및 다음 단계

**Orchestrator 최종 보고**:

```
✅ [기능명] 완료

워크플로우 결과:
- Implementer: 구현 완료 ✅
- Reviewer: 검증 통과 ✅
- Progress: 문서 업데이트 + commit ✅

다음 단계:
PLANS.md에서 다음 미완성 태스크 확인 후
/orchestrate [다음 기능명] 실행

현재 진행률: [X일차 완료 / 7일 MVP]
```

**최종 체크리스트**:
- [ ] Implementer 구현 완료
- [ ] Reviewer 검증 통과
- [ ] Progress 업데이트 완료
- [ ] git commit 기록됨
- [ ] PLANS.md 체크됨

---

## 📊 상태별 처리 매트릭스

| 단계 | 상태 | 조치 | 다음 |
|------|------|------|------|
| Implementer | ✅ 완료 | 보고 | Reviewer 호출 |
| Implementer | ❌ 실패 (1차) | 재생성 + 피드백 | Implementer 재시도 |
| Implementer | ❌ 실패 (2차) | 명세 재검토 + 재생성 | Implementer 재시도 |
| Implementer | ❌ 실패 (3차) | 에스컬레이션 | 사용자 개입 |
| Reviewer | ✅ 통과 | 승인 | Progress 호출 |
| Reviewer | ❌ 실패 | 피드백 | Implementer 수정 |
| Progress | ✅ 완료 | 기록 | 다음 기능으로 |

---

## 🎯 체크리스트

```
Orchestrator 시작 전:
☐ PLANS.md 읽음
☐ product-specs 문서 찾음
☐ blockedBy 확인됨
☐ 명세가 명확함

Implementer 지시 전:
☐ 프롬프트 템플릿 사용
☐ 규칙 문서 명시함
☐ 예상 결과물 명확함

Reviewer 호출 전:
☐ Implementer 보고 형식이 맞음
☐ typecheck/lint 통과 명시됨

Progress 호출 전:
☐ Reviewer 검증 통과 확인됨
☐ git diff 정상

완료 후:
☐ PLANS.md 체크 표시됨
☐ git commit 기록됨
☐ docs/exec-plans/ 갱신됨
```

---

## 체크리스트

- [ ] PLANS.md에서 다음 태스크 확인
- [ ] product-specs 문서 읽음
- [ ] blockedBy 확인
- [ ] Implementer 지시
- [ ] Reviewer 통과
- [ ] Progress 완료
- [ ] 완료 보고

---

## Quick Reference

**명령**:
- `/new-feature` — Implementer만 실행 (orchestrate 없이)
- `/review` — Reviewer 직접 실행
- `/progress` — Progress Tracker 직접 실행

**문서**:
- @CLAUDE.md (레포 루트) — 에이전트 역할
- @AGENTS.md (레포 루트) — 에이전트 계층
- @link_memory_docs/project/CLAUDE.md — 구현 규칙
- @link_memory_docs/project/AGENTS.md — 구현 상세 지침
