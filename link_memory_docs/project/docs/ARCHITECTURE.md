# ARCHITECTURE.md

기술 스택 선택 근거와 DB 스키마 정의.

---

## 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Frontend | Next.js 16 (App Router) | 서버 컴포넌트 기본, Vercel 최적화 |
| 스타일 | Tailwind CSS v4 | 유틸리티 기반, 다크모드 단순 |
| 백엔드 | Supabase | Auth + DB + RLS 올인원, 무료 티어 |
| AI | OpenAI gpt-4o-mini | 비용/성능 균형, JSON 응답 지원 |
| 배포 | Vercel | Next.js 네이티브, 서버리스 자동화 |

---

## DB 스키마

### links
```sql
CREATE TABLE links (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        REFERENCES auth.users NOT NULL,
  url            text        NOT NULL,
  title          text        NOT NULL DEFAULT '',
  thumbnail_url  text,
  channel_name   text,
  published_at   text,           -- 'YYYY-MM-DD' 형식
  transcript     text,           -- 서버 전용, API 응답 노출 금지
  ai_summary     jsonb,          -- AiSummary JSON { summary[], insights[], generatedAt }
  ai_summary_error text,         -- 실패 사유 메시지 (사용자에게 표시)
  memo           text        NOT NULL DEFAULT '',
  is_archived    boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);
```

### tags
```sql
CREATE TABLE tags (
  id         uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid  REFERENCES auth.users NOT NULL,
  name       text  NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
```

### link_tags (N:M 중간 테이블)
```sql
CREATE TABLE link_tags (
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  tag_id  uuid REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (link_id, tag_id)
);
```

---

## RLS 정책

모든 테이블에 RLS 활성화 필수:
```sql
ALTER TABLE links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tags ENABLE ROW LEVEL SECURITY;

-- links: 본인 것만
CREATE POLICY "본인만" ON links FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- tags: 본인 것만
CREATE POLICY "본인만" ON tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- link_tags: 링크 소유자만
CREATE POLICY "본인만" ON link_tags FOR ALL
  USING  (EXISTS (SELECT 1 FROM links WHERE links.id = link_id AND links.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM links WHERE links.id = link_id AND links.user_id = auth.uid()));
```

---

## API 설계 원칙

- 모든 응답은 camelCase (`thumbnailUrl`, `aiSummary` 등)
- `transcript`는 DB 저장만, API 응답에 절대 포함 금지
- AI 요약은 fire-and-forget: 저장 즉시 응답, 백그라운드에서 생성
- `ai_summary_error`는 실패 사유를 사용자가 이해할 수 있는 언어로 기록

---

## AI 요약 흐름

```
POST /api/links
  ↓ (동기) 메타데이터 수집 + DB 저장 → 즉시 201 응답
  ↓ (비동기 fire-and-forget)
POST /api/links/[id]/summarize
  ↓ 1순위: transcript (자막)
  ↓ 2순위: YouTube description (영상 설명)
  ↓ 3순위: ai_summary_error 기록 + 재시도 버튼 표시
```

Vercel 서버리스 제한:
- `summarize` route: `export const maxDuration = 60` (기본 10초 → 60초 확장)
- YouTube transcript API는 Vercel 공유 IP에서 차단될 수 있음 → description fallback 필수
