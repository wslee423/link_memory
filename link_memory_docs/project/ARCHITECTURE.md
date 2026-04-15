# ARCHITECTURE.md

## Tech Stack

| 레이어 | 기술 | 이유 |
|--------|------|------|
| Frontend | Next.js 14 (App Router) | SSR + API Routes 일체형 |
| Styling | Tailwind CSS | 빠른 UI 개발 |
| Database | Supabase (PostgreSQL) | Auth + DB 일체형 |
| Auth | Supabase Auth | 이메일/소셜 로그인 |
| AI | OpenAI gpt-4o-mini | 비용 효율적 요약 생성 |
| 배포 | Vercel | Next.js 최적화 |
| 자막 | YouTube Transcript API | 자막 추출 |
| 메타데이터 | YouTube Data API v3 + oEmbed | 제목/썸네일/채널/날짜 |

> AI 모델: gpt-4o-mini. Claude API 사용 금지. gpt-5-mini/nano 출시 시 교체 예정.

## System Flow

```
[브라우저] → URL 입력
     ↓
[Next.js API Routes]
  ├── YouTube 메타데이터 수집 (oEmbed + Data API v3)
  ├── 자막 수집 (YouTube Transcript API)
  └── Supabase DB 저장
         ↓ 저장 완료 트리거
  [AI 요약 Job] → OpenAI gpt-4o-mini
         ↓ 완료
  [Supabase DB 업데이트]
         ↓ Realtime or 폴링
[프론트엔드] 스켈레톤 → 콘텐츠 전환
```

## Database Schema

### links
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| url | text | 원본 URL |
| title | text | 제목 |
| thumbnail_url | text | 썸네일 |
| channel_name | text | 채널명 |
| published_at | date | 영상 게시일 |
| transcript | text | 자막 원문 — **서버 전용, 클라이언트 미노출** |
| ai_summary | jsonb | { summary: string[], insights: string[] } |
| memo | text | 사용자 메모 |
| created_at | timestamp | 저장 시각 |

### tags
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| name | text | 태그명 |

### link_tags
| 컬럼 | 타입 | 설명 |
|------|------|------|
| link_id | uuid | FK → links |
| tag_id | uuid | FK → tags |

## API Routes

```
GET  /api/links           목록 조회 (태그 필터)
POST /api/links           링크 저장 + 메타데이터 트리거

GET    /api/links/[id]    상세 조회
PATCH  /api/links/[id]    메모/태그 수정
DELETE /api/links/[id]    삭제 (API만 준비, MVP UI 미노출)

POST /api/links/[id]/summarize  AI 요약 수동 재실행

GET  /api/tags            전체 태그 목록 (자동완성용)
POST /api/tags            태그 생성
```

## 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # 서버 전용
OPENAI_API_KEY=                # 서버 전용
YOUTUBE_DATA_API_KEY=          # 서버 전용
```
