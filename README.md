# link_memory

> 발견 → 기억 → 성장. 나만의 지식 아카이빙 플랫폼.

유튜브와 웹 링크를 저장하면 AI가 자동으로 요약하고 인사이트를 만들어줍니다.
태그와 메모로 분류해 나만의 지식 베이스를 만드는 개인 중심 서비스입니다.

---

## 왜 만들었나

매일 좋은 콘텐츠를 발견하지만 브라우저 탭에 묻히거나 그냥 잊혀진다.
링크를 저장하는 것만으로는 부족하다. **읽고 기억하고 성장**하는 사이클이 필요했다.

- 단순 북마크가 아닌 **지식으로 변환**되는 아카이브
- URL 하나 붙여넣기로 끝나는 **최소한의 마찰**
- AI가 요약하고, 나는 인사이트를 더하는 **분업 구조**

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| URL 저장 | 유튜브 / 웹 URL 붙여넣기 → 저장 1클릭 |
| 메타데이터 자동 수집 | 제목, 썸네일, 채널명, 게시일 자동 수집 |
| AI 자동 요약 | 3줄 핵심 요약 + 실용적 인사이트 3개 자동 생성 |
| 태그 분류 | 태그 생성/편집/삭제, 태그별 필터링 |
| 메모 | 자동저장(1.5초) 개인 노트 |
| 텍스트 검색 | 제목/URL 실시간 필터 |
| 보관함 | 링크 보관(Archive) / 복원 |
| 북마클릿 | 브라우저에서 현재 페이지 즉시 저장 |

---

## 철학

### 3가지 원칙

**① 동작하는 것이 완벽한 것보다 낫다**
MVP 범위 안에서만. 나머지는 Post-MVP로.

**② 자동화가 핵심이다**
나는 입력만 하고, 시스템이 나머지를 한다.
수동 작업이 있으면 실패다.

**③ 나(사용자)가 불편하면 모든 것이 실패다**
나의 워크플로우가 제품 설계의 기준.

### 품질 원칙
- 조용한 실패 금지 — 모든 오류는 사용자에게 명확히 알린다
- RLS 필수 — 데이터는 본인 것만
- `any` 타입 금지 — TypeScript strict 모드

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| AI | OpenAI gpt-4o-mini |
| Deploy | Vercel |
| 인증 | Supabase Auth (이메일/비밀번호) |

### 주요 의존성

```
next 16.2.3
react 19.2.4
@supabase/ssr 0.10.2
openai 6.34.0
youtube-transcript 1.3.0
tailwindcss 4
```

---

## 화면 구조

```
┌─────────────────────────────────────────────────────┐
│  logo   [ URL 입력창 .................. ]  [저장]   │  ← sticky Header
├─────────────────────────────────────────────────────┤
│  전체  개발  디자인  AI  ...                        │  ← Tag Bar
├──────────────────────┬──────────────────────────────┤
│  ┌──────────────┐    │  썸네일                      │
│  │ 썸네일 제목  │    │  제목 / 채널 / 날짜          │
│  │ 채널 · 날짜  │    │                              │
│  │ #태그 #태그  │    │  AI 요약          메모       │
│  └──────────────┘    │  · 핵심 내용 1    [textarea] │
│  ┌──────────────┐    │  · 핵심 내용 2               │
│  │ ...          │    │  · 인사이트 1                │
│  └──────────────┘    │                              │
│                      │  태그: #개발  #AI  +추가     │
└──────────────────────┴──────────────────────────────┘
   링크 목록 (좌)            상세 패널 (우)
```

모바일에서는 링크 목록 → 탭 시 전체화면 상세 + 뒤로가기.

---

## 사용 방법

### 기본 플로우

1. 상단 입력창에 URL 붙여넣기
2. 저장 버튼 클릭 → 제목/썸네일 자동 수집
3. AI가 백그라운드에서 요약 + 인사이트 생성 (유튜브 기준 10~30초)
4. 태그 추가, 메모 작성

### AI 요약 동작 방식

유튜브 영상의 경우 다음 순서로 요약 재료를 수집합니다:

```
1순위: 영상 자막 (transcript)
2순위: 영상 설명 (YouTube Data API v3)
3순위: 실패 → 사유 표시 + 재시도 버튼
```

자막이 없거나 서버 환경에서 접근이 차단된 경우 설명으로 fallback합니다.

### 북마클릿 설치

브라우저 북마크바에 새 북마크를 추가하고 URL에 아래를 붙여넣으세요:

```javascript
javascript:(function(){window.open('https://[배포 도메인]/save?url='+encodeURIComponent(location.href),'_blank','width=480,height=320')})();
```

설치 후 어떤 페이지에서든 북마클릿 클릭 → 즉시 저장.

---

## 로컬 개발 설정

### 사전 준비

- Node.js 20+
- Supabase 프로젝트 (supabase.com)
- OpenAI API 키
- YouTube Data API v3 키 (Google Cloud Console)

### 설치

```bash
git clone https://github.com/wslee423/link_memory.git
cd link_memory/app
npm install
```

### 환경변수 설정

`app/.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
YOUTUBE_DATA_API_KEY=AIza...
```

| 변수 | 용도 | 클라이언트 노출 |
|------|------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 Supabase 키 (RLS 보호) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회 (서버 전용) | ❌ |
| `OPENAI_API_KEY` | AI 요약 생성 (서버 전용) | ❌ |
| `YOUTUBE_DATA_API_KEY` | 메타데이터/설명 수집 (서버 전용) | ❌ |

### DB 스키마 적용

Supabase SQL Editor에서 실행:

```sql
-- links 테이블
CREATE TABLE links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  url text NOT NULL,
  title text NOT NULL DEFAULT '',
  thumbnail_url text,
  channel_name text,
  published_at text,
  transcript text,
  ai_summary jsonb,
  ai_summary_error text,
  memo text NOT NULL DEFAULT '',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- tags 테이블
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- link_tags 중간 테이블
CREATE TABLE link_tags (
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (link_id, tag_id)
);

-- RLS 활성화
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tags ENABLE ROW LEVEL SECURITY;

-- links 정책
CREATE POLICY "본인만" ON links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- tags 정책
CREATE POLICY "본인만" ON tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- link_tags 정책
CREATE POLICY "본인만" ON link_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM links WHERE links.id = link_id AND links.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM links WHERE links.id = link_id AND links.user_id = auth.uid()));
```

### 개발 서버 실행

```bash
npm run dev       # http://localhost:3000
npm run typecheck # TypeScript 타입 검사
npm run lint      # ESLint
npm run build     # 프로덕션 빌드 검증
```

---

## 프로젝트 구조

```
link_memory/
├── app/                          # Next.js 앱
│   ├── app/
│   │   ├── api/
│   │   │   ├── links/            # GET(목록), POST(저장)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # GET, PATCH, DELETE
│   │   │   │       └── summarize/route.ts  # AI 요약 실행
│   │   │   └── tags/             # GET(목록), POST(생성)
│   │   │       └── [id]/route.ts # PATCH(이름변경), DELETE
│   │   ├── login/page.tsx
│   │   ├── save/page.tsx         # 북마클릿 팝업
│   │   ├── page.tsx              # 메인 페이지
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # Skeleton, Toast
│   │   └── features/
│   │       ├── links/            # LinkCard, UrlInputBar, SearchBar
│   │       ├── tags/             # TagBar, TagInput
│   │       └── detail/           # DetailPanel, AiSummary, MemoEditor
│   ├── lib/
│   │   ├── supabase/             # client.ts, server.ts
│   │   ├── openai/               # summarize.ts
│   │   └── youtube/              # metadata.ts, transcript.ts
│   ├── types/index.ts            # 전체 공용 타입
│   └── proxy.ts                  # 인증 미들웨어
└── link_memory_docs/             # 설계 문서
    └── project/
        ├── CLAUDE.md             # AI 에이전트 지침
        └── docs/
            ├── product-specs/    # 기능 명세
            ├── design-docs/      # 디자인 명세
            └── PLANS.md          # 개발 로드맵
```

---

## 로드맵

### 완료 (MVP + Post-MVP P1)

- [x] URL 저장 + 메타데이터 자동 수집
- [x] AI 자동 요약 (자막 → 설명 fallback)
- [x] 태그 분류 + 필터링
- [x] 태그 관리 (이름 변경, 삭제)
- [x] 메모 자동저장
- [x] 텍스트 검색
- [x] 보관함 (Archive)
- [x] 링크 삭제 (확인 단계 포함)
- [x] 북마클릿
- [x] 반응형 (모바일 지원)

### 예정

- [ ] 지인 공유 (읽기 전용 링크)
- [ ] 크롬 익스텐션
- [ ] 통계 대시보드

---

## 라이선스

개인 프로젝트. 참고는 자유롭게.
