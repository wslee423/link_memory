import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchYouTubeMetadata } from '@/lib/youtube/metadata'
import { fetchTranscript } from '@/lib/youtube/transcript'
import type { CreateLinkRequest, Tag } from '@/types'

interface RawLinkTag {
  tags: Tag[] | Tag | null
}

interface RawLink {
  id: string
  url: string
  title: string
  thumbnail_url: string | null
  channel_name: string | null
  published_at: string | null
  ai_summary: unknown
  memo: string
  created_at: string
  link_tags: RawLinkTag[]
}

function toLink(raw: RawLink) {
  return {
    id: raw.id,
    url: raw.url,
    title: raw.title,
    thumbnailUrl: raw.thumbnail_url,
    channelName: raw.channel_name,
    publishedAt: raw.published_at,
    aiSummary: raw.ai_summary ?? null,
    memo: raw.memo,
    createdAt: raw.created_at,
    tags: raw.link_tags.flatMap((lt) => {
      if (!lt.tags) return []
      return Array.isArray(lt.tags) ? lt.tags : [lt.tags]
    }),
  }
}

// GET /api/links — 목록 조회 (태그 필터)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tagId = searchParams.get('tagId')

  // tagId 필터: link_tags에 해당 tag가 있는 link_id만 서브쿼리로 필터
  let linkIds: string[] | null = null
  if (tagId) {
    const { data: ltData } = await supabase
      .from('link_tags')
      .select('link_id')
      .eq('tag_id', tagId)
    linkIds = (ltData ?? []).map((r: { link_id: string }) => r.link_id)
    if (linkIds.length === 0) return NextResponse.json({ links: [] })
  }

  let query = supabase
    .from('links')
    .select(`
      id, url, title, thumbnail_url, channel_name, published_at,
      ai_summary, memo, created_at,
      link_tags ( tags ( id, name ) )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (linkIds) {
    query = query.in('id', linkIds)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ links: (data as unknown as RawLink[]).map(toLink) })
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

  return NextResponse.json({
    link: {
      ...link,
      thumbnailUrl: link.thumbnail_url,
      channelName: link.channel_name,
      publishedAt: link.published_at,
      aiSummary: link.ai_summary ?? null,
      createdAt: link.created_at,
      tags: [],
    },
  }, { status: 201 })
}
