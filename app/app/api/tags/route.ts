import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateTagRequest } from '@/types'

// GET /api/tags — 전체 태그 목록 (자동완성용)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tags')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tags: data })
}

// POST /api/tags — 태그 생성
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: CreateTagRequest = await request.json()
  const name = body.name?.trim()

  if (!name) return NextResponse.json({ error: '태그 이름이 필요합니다.' }, { status: 400 })
  if (name.length > 30) return NextResponse.json({ error: '태그는 30자 이하여야 합니다.' }, { status: 400 })

  // 이미 있으면 기존 태그 반환
  const { data: existing } = await supabase
    .from('tags')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('name', name)
    .maybeSingle()

  if (existing) return NextResponse.json({ tag: existing })

  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: user.id, name })
    .select('id, name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tag: data }, { status: 201 })
}
