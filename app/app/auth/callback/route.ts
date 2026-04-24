import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /auth/callback — 비밀번호 재설정 이메일 링크 처리
// Supabase는 세 가지 형식으로 도달:
// 1. PKCE:    ?code=... → exchangeCodeForSession
// 2. OTP:     ?token_hash=...&type=recovery → verifyOtp
// 3. 에러:    ?error=access_denied&error_code=otp_expired (Supabase가 미리 거부)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const errorCode = searchParams.get('error_code')
  const origin = request.nextUrl.origin

  // Supabase가 이미 오류로 판정한 경우 (토큰 만료, 이미 사용됨 등)
  if (errorCode) {
    return NextResponse.redirect(`${origin}/login?error=${errorCode}`)
  }

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}/reset-password`)
    return NextResponse.redirect(`${origin}/login?error=exchange-failed`)
  }

  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    if (!error) return NextResponse.redirect(`${origin}/reset-password`)
    return NextResponse.redirect(`${origin}/login?error=otp_expired`)
  }

  return NextResponse.redirect(`${origin}/login?error=invalid-token`)
}
