-- 002_schema_separation.sql
-- link_memory 전용 스키마 분리 (공용 DB ai_service_db 전환)
--
-- 실행 전 주의:
-- 1. Supabase Console SQL Editor에서 실행
-- 2. 실행 후 Dashboard → Settings → API → Exposed schemas에 'link_memory' 추가 필수

-- 1. link_memory 스키마 생성
CREATE SCHEMA IF NOT EXISTS link_memory;

-- 2. 테이블 이동 (데이터, RLS 정책 모두 유지됨)
--    link_tags → links/tags 참조 순서 때문에 link_tags 먼저 이동
ALTER TABLE public.link_tags SET SCHEMA link_memory;
ALTER TABLE public.links SET SCHEMA link_memory;
ALTER TABLE public.tags SET SCHEMA link_memory;

-- 3. link_tags 외래키 재생성 (스키마 이동 후 참조 대상 갱신)
--    PostgreSQL은 SET SCHEMA 시 FK를 자동 업데이트하므로 일반적으로 불필요.
--    아래는 검증용 — 오류 없이 통과되면 OK.
DO $$
BEGIN
  -- links 존재 확인
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'link_memory' AND table_name = 'links'
  ) THEN
    RAISE EXCEPTION 'links 테이블이 link_memory 스키마에 없습니다.';
  END IF;

  -- tags 존재 확인
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'link_memory' AND table_name = 'tags'
  ) THEN
    RAISE EXCEPTION 'tags 테이블이 link_memory 스키마에 없습니다.';
  END IF;

  -- link_tags 존재 확인
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'link_memory' AND table_name = 'link_tags'
  ) THEN
    RAISE EXCEPTION 'link_tags 테이블이 link_memory 스키마에 없습니다.';
  END IF;
END $$;

-- 4. 완료 확인용 쿼리 (선택 실행)
-- SELECT table_schema, table_name FROM information_schema.tables
-- WHERE table_schema = 'link_memory';
