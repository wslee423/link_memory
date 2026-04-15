# link_memory — Repository Root

Claude Code가 매 세션 자동으로 읽는 레포지토리 루트 컨텍스트.

> ⚠️ **먼저 이것을 읽으세요**: @CONSTITUTION.md
> 모든 문서의 기초. 모든 결정의 중심. 흔들리지 않는 원칙.

---

## 레포 구조

```
D:\wlabs\link_memory\
  CLAUDE.md                          ← 이 파일 (레포 루트 컨텍스트)
  AGENTS.md                          ← 에이전트 계층 + 핸드오프
  .claude/
    settings.json                    ← hooks 설정
    commands/
      orchestrate.md                 ← /orchestrate 명령
      review.md                      ← /review 명령
  link_memory_docs/
    project/
      CLAUDE.md                      ← application level 규칙
      AGENTS.md                      ← 구현 에이전트 상세 지침
      .claude/commands/
        new-feature.md               ← /new-feature 명령
        check.md                     ← /check 명령
        progress.md                  ← /progress 명령
      docs/
        PRODUCT_SENSE.md
        ARCHITECTURE.md
        RELIABILITY.md
        SECURITY.md
        product-specs/
        design-docs/
      supabase/
        migrations/001_init_schema.sql
```

---

## 프로젝트 개요

**link_memory**: 개인 유튜브/웹 링크 아카이빙 서비스.
- URL 저장 → AI 자동 요약 → 태그/메모 관리
- 스택: Next.js 14 + TypeScript + Tailwind CSS + Supabase + OpenAI gpt-4o-mini
- 상태: Application Level Harness 완성 → Repository Level Harness 구현 중

---

## 에이전트 역할 (Multi-agent Orchestration)

### Tier 0: Orchestrator (레포 루트)
- 역할: 전체 작업 분석 → 에이전트 분배
- 명령: `/orchestrate [기능명]`
- CLAUDE.md: 이 파일
- 지침: @AGENTS.md

### Tier 1: Implementer (레포 루트 → link_memory_docs/project/)
- 역할: 기능 구현 (AGENTS.md 기반)
- 명령: `/new-feature`
- CLAUDE.md: @link_memory_docs/project/CLAUDE.md
- 지침: @link_memory_docs/project/AGENTS.md

### Tier 1: Reviewer (레포 루트)
- 역할: 코드 품질 검증 (typecheck, lint, 규칙 준수)
- 명령: `/review`
- CLAUDE.md: 이 파일
- 지침: @.claude/commands/review.md

### Tier 1: Progress Tracker (link_memory_docs/project/)
- 역할: 진행 상황 기록, 문서 업데이트
- 명령: `/progress`
- CLAUDE.md: @link_memory_docs/project/CLAUDE.md
- 지침: @link_memory_docs/project/.claude/commands/progress.md

---

## 워크플로우

### 신규 기능 구현 시

```
1. [사용자] /orchestrate [기능명]
   ↓
2. [Orchestrator] 
   - link_memory_docs/project/docs/PLANS.md에서 태스크 확인
   - link_memory_docs/project/docs/product-specs/[기능].md 분석
   - Implementer 서브에이전트 생성 → /new-feature 지시
   ↓
3. [Implementer] link_memory_docs/project/AGENTS.md 기반 구현
   - DB 스키마 → 타입 → API Route → UI
   - npm run typecheck && npm run lint
   ↓
4. [Reviewer] /review 자동 실행
   - git diff 확인
   - typecheck/lint 재실행
   - AGENTS.md 규칙 준수 검증
   ↓
5. [Progress] /progress로 상태 업데이트
   - docs/exec-plans/ 갱신
   - git commit
```

### 기존 기능 리뷰/수정 시

```
1. [사용자] /review
   ↓
2. [Reviewer] 
   - 변경사항 분석
   - typecheck/lint 실행
   - AGENTS.md 규칙 검증
   ↓
3. [Progress] 상황 기록
```

---

## Hooks (자동화)

`.claude/settings.json` 참고:
- **PostToolUse (Edit/Write)**: `.ts/.tsx` 변경 후 typecheck 리마인더
- **Stop**: 작업 완료 시 lint 리마인더

---

## Critical Rules (모든 에이전트 준수)

### Must Follow
- TypeScript strict: `any` 타입 절대 금지
- Application Level CLAUDE.md 규칙 따르기 (@link_memory_docs/project/CLAUDE.md)
- Implementer 완료 후 반드시 /review 실행
- 모든 PR은 git commit 메시지 포함 (feat:, fix:, docs: 등)

### Must NOT Do
- link_memory_docs/project/ 파일 구조 변경하지 않기
- 루트 CLAUDE.md의 레포 구조 섹션 변경하지 않기 (기획 변경 시만 수정)

---

## Quick Links

- **Product Specs**: @link_memory_docs/project/docs/product-specs/
- **Design Docs**: @link_memory_docs/project/docs/design-docs/
- **Architecture**: @link_memory_docs/project/docs/ARCHITECTURE.md
- **Development Plans**: @link_memory_docs/project/docs/PLANS.md
- **Security**: @link_memory_docs/project/docs/SECURITY.md
- **Reliability**: @link_memory_docs/project/docs/RELIABILITY.md

---

## Workflow After Each Feature

1. Implementer: `npm run typecheck && npm run lint`
2. Reviewer: `/review` 검증 통과
3. Progress: `git commit` + docs/exec-plans/ 업데이트
4. Orchestrator: 다음 태스크로 이동
