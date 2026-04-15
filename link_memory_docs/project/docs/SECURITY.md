# SECURITY.md

## 인증
- Supabase Auth (이메일/소셜)
- 미로그인: /login 리다이렉트 (middleware.ts)

```typescript
// middleware.ts 패턴
const { data: { session } } = await supabase.auth.getSession()
if (!session && req.nextUrl.pathname !== '/login') {
  return NextResponse.redirect(new URL('/login', req.url))
}
```

## RLS (모든 테이블 필수)
```sql
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인만 조회" ON links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "본인만 삽입" ON links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인만 수정" ON links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인만 삭제" ON links FOR DELETE USING (auth.uid() = user_id);
-- tags, link_tags 동일 적용
```

## 환경 변수 노출 범위
| 키 | 클라이언트 | 비고 |
|----|-----------|------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | RLS 보호 |
| SUPABASE_SERVICE_ROLE_KEY | ❌ 서버만 | RLS 우회 가능 |
| OPENAI_API_KEY | ❌ 서버만 | 과금 위험 |
| YOUTUBE_DATA_API_KEY | ❌ 서버만 | 쿼터 위험 |

## 입력값 검증
- URL: 서버사이드 형식 검증
- 태그: 최대 30자
- 메모: 최대 5,000자
- dangerouslySetInnerHTML 사용 금지
