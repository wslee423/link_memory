import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateLinkRequest } from '@/types'

// GET /api/links/[id] — 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('links')
    .select(`
      id, url, title, thumbnail_url, channel_name, published_at,
      ai_summary, memo, created_at,
      link_tags ( tag_id, tags ( id, name ) )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: '링크를 찾을 수 없습니다.' }, { status: 404 })

  return NextResponse.json({ link: data })
}

// PATCH /api/links/[id] — 메모/태그 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: UpdateLinkRequest = await request.json()
  const { memo, tagIds, isArchived } = body

  // 메모 또는 보관 상태 수정
  if (memo !== undefined || isArchived !== undefined) {
    if (memo !== undefined && memo.length > 5000) {
      return NextResponse.json({ error: '메모는 5000자 이하여야 합니다.' }, { status: 400 })
    }
    const patch: Record<string, unknown> = {}
    if (memo !== undefined) patch.memo = memo
    if (isArchived !== undefined) patch.is_archived = isArchived

    const { error } = await supabase
      .from('links')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 태그 수정 (전체 교체)
  if (tagIds !== undefined) {
    // 기존 태그 삭제
    await supabase.from('link_tags').delete().eq('link_id', id)

    // 새 태그 삽입
    if (tagIds.length > 0) {
      const { error } = await supabase
        .from('link_tags')
        .insert(tagIds.map((tagId) => ({ link_id: id, tag_id: tagId })))
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/links/[id] — 삭제 (API만, MVP에서 UI 미노출)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
