import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateTagRequest } from '@/types'

// PATCH /api/tags/[id] — 태그 이름 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: UpdateTagRequest = await request.json()
  const name = body.name?.trim()

  if (!name) return NextResponse.json({ error: '태그 이름이 필요합니다.' }, { status: 400 })
  if (name.length > 30) return NextResponse.json({ error: '태그는 30자 이하여야 합니다.' }, { status: 400 })

  // 동일 이름 중복 확인
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', name)
    .neq('id', id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: '이미 같은 이름의 태그가 있습니다.' }, { status: 409 })

  const { data, error } = await supabase
    .from('tags')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tag: data })
}

// DELETE /api/tags/[id] — 태그 삭제 (link_tags CASCADE)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
