# PLANS.md

## 목표
MVP를 1주일 이내에 배포 가능한 상태로 만든다.

## Milestone 1 — MVP (~7일)

### Day 1-2: 기반 세팅
- [x] Next.js 14 프로젝트 세팅 (App Router) — 2026-04-15
- [x] Tailwind CSS 다크모드 + 색상 팔레트 설정 — 2026-04-15
- [x] Supabase 스키마 마이그레이션 (links, tags, link_tags + RLS) — 2026-04-15
- [x] Supabase Auth 로그인 페이지 — 2026-04-15
- [x] 환경변수 세팅 — 2026-04-15
- [x] types/index.ts 타입 정의 — 2026-04-15

### Day 3-4: 백엔드 API
- [x] POST /api/links (저장 + 메타데이터 트리거)
- [x] YouTube oEmbed + Data API v3 메타데이터 수집
- [x] 일반 웹 URL OGP 메타데이터 수집 (og:title, og:image)
- [x] YouTube Transcript API 자막 수집 + DB 저장
- [x] GET /api/links (목록 조회)
- [x] GET/POST /api/tags
- [x] PATCH /api/links/[id] (메모/태그 수정)
- [x] DELETE /api/links/[id] (API만, UI 미노출)

### Day 5: AI 연동
- [x] OpenAI gpt-4o-mini 클라이언트 설정
- [x] 요약 생성 함수 (3줄 요약 + 인사이트 불릿)
- [x] AI 요약 Job 자동 트리거
- [x] POST /api/links/[id]/summarize (수동 재실행)
- [x] 엣지 케이스 (자막 없음 → ai_summary=null, API 실패 → 재시도 버튼)

### Day 6: 프론트엔드 UI
- [x] 메인 2패널 레이아웃
- [x] Header URL 입력창 + 저장 버튼
- [x] TagBar 가로 스크롤 + 태그 필터
- [x] LinkCard (스켈레톤 포함, AI 생성 중 표시)
- [x] DetailPanel (AI 요약 스켈레톤 + 메모 1.5초 자동저장 + 태그 자동완성)

### Day 7: 마무리
- [x] 엣지 케이스 UI (중복 URL toast, AI 실패 재시도, 메모 저장 실패)
- [x] 반응형 (breakpoint: 768px, 모바일 전체화면 상세 + 뒤로가기)
- [x] Empty state UI
- [ ] 전체 플로우 QA
- [ ] 프로덕션 배포 (Vercel)

## Milestone 2 — Post-MVP

### P1
- [ ] 링크 삭제 UI (API는 구현됨)
- [ ] 태그 검색 (현재는 필터만)
- [ ] 지인 공유 (읽기 전용 링크)

### P2
- [ ] 크롬 익스텐션
- [ ] 링크 보관(Archive)
- [ ] 태그 관리 페이지

### P3
- [ ] 전문 검색 (Typesense)
- [ ] 다중 사용자
- [ ] 통계 대시보드

## 원칙
1. 동작하는 것 먼저 — 완벽한 UI보다 기능 우선
2. 엣지 케이스는 마지막 — 정상 플로우 먼저
3. Day 1부터 Vercel 배포 — 매일 푸시
