# CLAUDE.md
> Claude Code가 매 세션 자동으로 읽는 핵심 컨텍스트 파일.
> 간결하게 유지할 것 — 모든 세션에 적용되는 내용만 포함.
> 상세 명세는 @docs/ 참고.

---

## Project Overview
개인 유튜브/웹 링크 아카이빙 서비스.
URL 저장 → AI 자동 요약 → 태그/메모 관리.
See @docs/PRODUCT_SENSE.md

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript (strict) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: OpenAI gpt-4o-mini (Claude API 사용 금지)
- **Deploy**: Vercel

## Key Commands
```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run typecheck  # 타입 체크 (작업 후 반드시 실행)
npm run lint       # ESLint
```

## Critical Rules

### Must Follow
- `any` 타입 절대 금지 — 모든 타입 명시
- `'use client'` 최소화 — Server Component 기본
- RLS 반드시 활성화 — 모든 Supabase 테이블
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` 는 서버 전용 (NEXT_PUBLIC_ 금지)
- `transcript` 컬럼은 DB 저장만, API 응답에 포함 금지
- AI 요약 표시는 스켈레톤 방식 (스트리밍 금지)
- 링크 삭제 API는 구현하되 MVP에서 UI 미노출

### Must NOT Do
- Claude API 사용 금지 → OpenAI gpt-4o-mini 사용
- Pages Router 사용 금지 → App Router만
- `dangerouslySetInnerHTML` 사용 금지
- 환경변수 하드코딩 금지
- `console.log` 프로덕션 코드에 남기지 않기

## File Structure
```
/app/api/         API Routes (route.ts)
/components/ui/   재사용 원자 컴포넌트
/components/features/  기능별 컴포넌트
/lib/supabase/    Supabase 클라이언트 (중앙 관리)
/lib/openai/      OpenAI 클라이언트
/lib/youtube/     YouTube API 유틸
/types/index.ts   전체 공용 타입
/supabase/migrations/  DB 마이그레이션
```

## Design
- 다크모드 전용: `bg-zinc-950` 배경, `indigo-500` 강조색
- 반응형 breakpoint: `768px`
- See @docs/design-docs/layout.md, @docs/design-docs/components.md

## Workflow After Each Feature
1. `npm run typecheck` — 타입 에러 없는지 확인
2. `npm run lint` — lint 통과 확인
3. git commit (descriptive message)
4. docs/exec-plans/active/ 진행 상황 업데이트

## Deep References
- 기능 명세: @docs/product-specs/
- DB 스키마: @docs/ARCHITECTURE.md
- 개발 순서: @docs/PLANS.md
- 보안 규칙: @docs/SECURITY.md
- 에러 처리: @docs/RELIABILITY.md
