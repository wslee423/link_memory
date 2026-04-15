# PLANS.md

## 목표
MVP를 1주일 이내에 배포 가능한 상태로 만든다.

## Milestone 1 — MVP (~7일)

### Day 1-2: 기반 세팅
- [ ] Next.js 14 프로젝트 세팅 (App Router)
- [ ] Tailwind CSS 다크모드 + 색상 팔레트 설정
- [ ] Supabase 스키마 마이그레이션 (links, tags, link_tags + RLS)
- [ ] Supabase Auth 로그인 페이지
- [ ] 환경변수 세팅 + Vercel 배포 파이프라인
- [ ] types/index.ts 타입 정의

### Day 3-4: 백엔드 API
- [ ] POST /api/links (저장 + 메타데이터 트리거)
- [ ] YouTube oEmbed + Data API v3 메타데이터 수집
- [ ] YouTube Transcript API 자막 수집 + DB 저장
- [ ] GET /api/links (목록 조회)
- [ ] GET/POST /api/tags
- [ ] PATCH /api/links/[id] (메모/태그 수정)
- [ ] DELETE /api/links/[id] (API만, UI 미노출)

### Day 5: AI 연동
- [ ] OpenAI gpt-4o-mini 클라이언트 설정
- [ ] 요약 생성 함수 (3줄 요약 + 인사이트 불릿)
- [ ] AI 요약 Job 자동 트리거
- [ ] POST /api/links/[id]/summarize (수동 재실행)
- [ ] 엣지 케이스 (자막 없음, API 실패)

### Day 6: 프론트엔드 UI
- [ ] 메인 2패널 레이아웃
- [ ] Header URL 입력창 + 저장 버튼
- [ ] TagBar 가로 스크롤
- [ ] LinkCard (스켈레톤 포함)
- [ ] DetailPanel (AI 요약 스켈레톤 + 메모 자동저장 + 태그 자동완성)

### Day 7: 마무리
- [ ] 엣지 케이스 UI (중복 URL, 자막 없음, API 실패)
- [ ] 반응형 (breakpoint: 768px)
- [ ] Empty state UI
- [ ] 전체 플로우 QA
- [ ] 프로덕션 배포

## Milestone 2 — Post-MVP

### P1
- [ ] 태그 필터링 + 검색
- [ ] 지인 공유 (읽기 전용 링크)
- [ ] 링크 삭제 UI
- [ ] AI 요약 재실행 버튼

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
