import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateSummary } from '@/lib/openai/summarize'
import { extractYouTubeId, fetchVideoDescription } from '@/lib/youtube/metadata'

// Vercel 기본 10초 제한을 60초로 확장
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

  // transcript + url 조회
  const admin = createAdminClient()
  const { data: link } = await admin
    .from('links')
    .select('transcript, url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  // 1순위: 자막으로 요약
  if (link?.transcript) {
    const summary = await Promise.race([
      generateSummary(link.transcript, 'transcript'),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 55000)),
    ])

    if (summary) {
      const { error } = await supabase
        .from('links')
        .update({ ai_summary: summary, ai_summary_error: null })
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ summary })
    }

    // 자막은 있지만 OpenAI 실패
    await supabase
      .from('links')
      .update({ ai_summary: null, ai_summary_error: 'AI 요약 생성에 실패했습니다. 다시 시도해보세요.' })
      .eq('id', id)
      .eq('user_id', user.id)
    return NextResponse.json({ error: 'AI 요약 생성 실패' }, { status: 500 })
  }

  // 2순위: 영상 설명(description)으로 요약
  const videoId = link?.url ? extractYouTubeId(link.url) : null
  if (videoId) {
    const description = await fetchVideoDescription(videoId)
    if (description) {
      const summary = await Promise.race([
        generateSummary(description, 'description'),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 55000)),
      ])

      if (summary) {
        const { error } = await supabase
          .from('links')
          .update({ ai_summary: summary, ai_summary_error: null })
          .eq('id', id)
          .eq('user_id', user.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ summary })
      }
    }
  }

  // 3순위: 모두 실패
  await supabase
    .from('links')
    .update({ ai_summary: null, ai_summary_error: '자막과 영상 설명을 모두 가져올 수 없어 요약을 생성하지 못했습니다.' })
    .eq('id', id)
    .eq('user_id', user.id)
  return NextResponse.json({ error: '요약 생성 실패' }, { status: 422 })
}
