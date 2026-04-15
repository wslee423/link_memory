import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateSummary } from '@/lib/openai/summarize'

// Vercel 기본 10초 제한을 60초로 확장 (Pro: 300초까지 가능)
export const maxDuration = 60

// POST /api/links/[id]/summarize — AI 요약 실행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // transcript 조회 (서버 전용, admin client 사용)
  const admin = createAdminClient()
  const { data: link } = await admin
    .from('links')
    .select('transcript')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!link?.transcript) {
    await supabase
      .from('links')
      .update({ ai_summary: null })
      .eq('id', id)
    return NextResponse.json({ error: '자막이 없어 요약을 생성할 수 없습니다.' }, { status: 422 })
  }

  // AI 요약 생성 (최대 30초)
  const summary = await Promise.race([
    generateSummary(link.transcript),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 30000)),
  ])

  if (!summary) {
    return NextResponse.json({ error: 'AI 요약 생성 실패' }, { status: 500 })
  }

  // DB 저장
  const { error } = await supabase
    .from('links')
    .update({ ai_summary: summary })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ summary })
}
