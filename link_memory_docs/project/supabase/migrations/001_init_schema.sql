-- 001_init_schema.sql
-- 링크 아카이빙 서비스 초기 스키마

-- links 테이블
CREATE TABLE links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text,
  thumbnail_url text,
  channel_name text,
  published_at date,
  transcript text,           -- 서버 전용, API 응답 미포함
  ai_summary jsonb,          -- { summary: string[], insights: string[], generatedAt: string }
  memo text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, url)       -- 중복 URL 방지
);

-- tags 테이블
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
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

-- links RLS 정책
CREATE POLICY "본인 링크만 조회" ON links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "본인 링크만 삽입" ON links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 링크만 수정" ON links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인 링크만 삭제" ON links FOR DELETE USING (auth.uid() = user_id);

-- tags RLS 정책
CREATE POLICY "본인 태그만 조회" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "본인 태그만 삽입" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 태그만 수정" ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인 태그만 삭제" ON tags FOR DELETE USING (auth.uid() = user_id);

-- link_tags RLS 정책 (link 소유자 기준)
CREATE POLICY "본인 link_tags 조회" ON link_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM links WHERE links.id = link_tags.link_id AND links.user_id = auth.uid()));
CREATE POLICY "본인 link_tags 삽입" ON link_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM links WHERE links.id = link_tags.link_id AND links.user_id = auth.uid()));
CREATE POLICY "본인 link_tags 삭제" ON link_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM links WHERE links.id = link_tags.link_id AND links.user_id = auth.uid()));

-- 인덱스
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_created_at ON links(created_at DESC);
CREATE INDEX idx_tags_user_id ON tags(user_id);
