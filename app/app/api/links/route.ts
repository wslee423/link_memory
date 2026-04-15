import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchYouTubeMetadata } from '@/lib/youtube/metadata'
import { fetchTranscript } from '@/lib/youtube/transcript'
import type { CreateLinkRequest } from '@/types'

// GET /api/links — 목록 조회 (태그 필터)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tagId = searchParams.get('tagId')

  let query = supabase
    .from('links')
    .select(`
      id, url, title, thumbnail_url, channel_name, published_at,
      ai_summary, memo, created_at,
      link_tags ( tag_id, tags ( id, name ) )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (tagId) {
    query = query.eq('link_tags.tag_id', tagId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ links: data })
}

// POST /api/links — 링크 저장 + 메타데이터 수집
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: CreateLinkRequest = await request.json()
  const { url } = body

  if (!url || !URL.canParse(url)) {
    return NextResponse.json({ error: '유효하지 않은 URL입니다.' }, { status: 400 })
  }

  // 중복 URL 확인
  const { data: existing } = await supabase
    .from('links')
    .select('id')
    .eq('user_id', user.id)
    .eq('url', url)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: '이미 저장된 링크입니다.', linkId: existing.id }, { status: 409 })
  }

  // 메타데이터 + 자막 병렬 수집
  const [metadata, transcript] = await Promise.all([
    fetchYouTubeMetadata(url),
    fetchTranscript(url),
  ])

  // DB 저장
  const { data: link, error } = await supabase
    .from('links')
    .insert({
      user_id: user.id,
      url,
      title: metadata.title,
      thumbnail_url: metadata.thumbnailUrl,
      channel_name: metadata.channelName,
      published_at: metadata.publishedAt,
      transcript,
      memo: '',
    })
    .select('id, url, title, thumbnail_url, channel_name, published_at, ai_summary, memo, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // AI 요약 비동기 트리거 (응답을 기다리지 않음)
  fetch(`${request.nextUrl.origin}/api/links/${link.id}/summarize`, {
    method: 'POST',
    headers: { cookie: request.headers.get('cookie') ?? '' },
  }).catch(() => {})

  return NextResponse.json({ link }, { status: 201 })
}
