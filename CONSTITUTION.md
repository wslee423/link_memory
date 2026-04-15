# link_memory Constitution

모든 결정의 중심. 모든 문서의 기초. 흔들리지 않는 원칙.

---

## Preamble (전문)

나는 매일 발견한 콘텐츠를 잃어버린다.
그래서 **발견 → 기억 → 성장**의 사이클을 만드는 개인 시스템을 만든다.

**link_memory**: 정보가 아닌 **지식**으로 변환하는 개인 아카이빙 플랫폼.

---

## Article I: Core Purpose (핵심 목표)

링크 → 자동 요약 → 태그 분류 → 나만의 지식베이스.

**Design Philosophy**:
- 한 화면에 목록과 상세를 동시에 본다 (정보 밀도)
- URL 붙여넣기 → 저장 클릭 1번 (빠른 입력)
- AI가 요약하고 인사이트를 건넨다 (자동화)
- 나만을 위한 서비스 (개인성)

---

## Article II: Unshakeable Principles (흔들리지 않는 3가지 원칙)

### ① Simplicity Over Perfection
동작하는 것 > 완벽한 것.
MVP 범위 안에서만. 나머지는 Post-MVP로.

### ② User (나) Comes First
내가 불편하면 모든 것이 실패다.
나의 워크플로우 = 제품 설계의 기준.

### ③ Automation is King
수동 작업이 있으면 실패다.
나는 **입력**만 하고, 시스템이 나머지를 한다.

**+ Quality is Non-Negotiable**:
- RLS 필수 (보안)
- `any` 타입 금지 (타입 안정성)
- typecheck/lint 필수 (코드 품질)
- 조용한 실패 금지 (오류는 명확하게)

---

## Article III: Rule Hierarchy (규칙 우선순위)

모든 규칙이 중요하지만, **충돌할 때는 이 순서를 따른다**:

### Priority 1: SECURITY (보안 > 모든 것)
- RLS (Row Level Security) 필수
- 환경변수 절대 노출 금지
- 입력값 검증 필수
- **예외 없음. 편의를 위해 보안을 포기하지 않는다.**

### Priority 2: RELIABILITY (신뢰성)
- 조용한 실패 금지 (모든 오류는 사용자에게 알림)
- 에러 처리 필수
- 사용자 안내 명확함
- **동작하는 것보다 안정적인 것 우선.**

### Priority 3: CODE QUALITY (코드 품질)
- typecheck 필수
- lint 필수
- 타입 안정성 (`any` 금지)
- 파일 구조 준수
- **모든 코드는 이 기준을 통과해야 한다.**

### Priority 4: SIMPLICITY (간결함)
- 불필요한 복잡성 제거
- 설정 파일을 위한 설정 금지
- 과한 추상화 하지 않기
- **하지만 Priority 1-3을 포기해서 단순화하지 않는다.**

**충돌 해결 예시**:
```
상황: 환경변수를 하드코딩하면 더 간단함
→ Priority 1 (SECURITY) > Priority 4 (SIMPLICITY)
→ 환경변수 사용. 간단함 포기.

상황: 아직 엣지 케이스 처리 안 함. 나중에 하자고 함
→ Priority 2 (RELIABILITY) > Priority 4 (SIMPLICITY)
→ 엣지 케이스 처리해야 함. 처음부터.

상황: 코드가 약간 못생겼지만 typecheck/lint 통과
→ Priority 3 (CODE QUALITY) 통과 = OK
→ 단순함이 덜해도 진행 가능.
```

---

## Article III: What We Reject (거부하는 것)

### ① Scope Creep
"나중에 추가하면 좋겠다" → Post-MVP로.
MVP 범위 밖은 No.

### ② Silent Failure
실패하면 반드시 사용자에게 알린다.
모든 오류는 명확한 메시지와 함께.

---

## Article IV: Decision Making Framework (의사결정 틀)

모든 선택은 이 3가지로 판단한다:

1. **나 자신이 쓸 수 있는가?** (User First)
2. **유지보수 가능한가?** (Simplicity)
3. **성능을 해치지 않는가?** (Quality)

**이 3가지 중 하나라도 No면 다시 생각한다.**

---

## Article V: Document Hierarchy (문서 우선순위)

이 순서대로 읽고, 이 순서대로 규칙을 따른다:

| 우선순위 | 문서 | 역할 |
|---------|------|------|
| 1️⃣ | **CONSTITUTION.md** (이 파일) | 불변의 원칙 |
| 2️⃣ | **CLAUDE.md** (루트) | 에이전트 역할 분담 |
| 3️⃣ | **AGENTS.md** (루트) | 에이전트 계층 구조 |
| 4️⃣ | **link_memory_docs/project/CLAUDE.md** | 구현 규칙 |
| 5️⃣ | **link_memory_docs/project/AGENTS.md** | 구현 상세 지침 |
| 6️⃣ | **ARCHITECTURE.md** | 기술 선택 & 스택 |
| 7️⃣ | **PLANS.md** | 로드맵 & 마일스톤 |
| 8️⃣ | **product-specs/** | 기능 명세 |

**규칙**: 상위 문서를 어기지 않으면서 하위 문서를 따른다.

---

## Article VI: Authority

이 헌법은 **모든 다른 문서를 관통한다**.
- 위반 시 Reviewer가 검출 → 즉시 리뷰 반려
- **헌법은 협상 대상이 아니다.**

### Amendment (수정)
변하지 않는다. 단 예외:
- 핵심 목표가 근본적으로 변하는 경우
- 이 경우 **모든 팀원의 합의 필수**

---

## Closing Statement

link_memory는 **나 자신을 위한 프로젝트**다.

완벽함보다 사용성.
많은 기능보다 핵심 기능.
일회성 사이드 프로젝트 아닌, 나와 함께할 도구.

모든 라인의 코드, 모든 결정, 모든 선택은 이 헌법을 향한다.

**흔들리지 말자.**

---

**Status**: Active ✅ | **Since**: 2026-04-15
