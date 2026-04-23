import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /auth/callback — 비밀번호 재설정 이메일의 링크에서 리다이렉트되는 엔드포인트
// 쿼리스트링의 ?code=... 를 세션으로 교환 후 /reset-password 로 이동
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const origin = request.nextUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=invalid-token`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=invalid-token`)
  }

  return NextResponse.redirect(`${origin}/reset-password`)
}
