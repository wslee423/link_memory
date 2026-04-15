'use client'

import { useRef, useState } from 'react'
import type { Tag } from '@/types'

interface TagBarProps {
  tags: Tag[]
  selectedTagId: string | null
  onSelect: (tagId: string | null) => void
  onRename: (tagId: string, newName: string) => Promise<void>
  onDelete: (tagId: string) => Promise<void>
}

export function TagBar({ tags, selectedTagId, onSelect, onRename, onDelete }: TagBarProps) {
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setEditValue(tag.name)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function commitRename() {
    if (!editingId) return
    const trimmed = editValue.trim()
    const original = tags.find((t) => t.id === editingId)?.name
    if (trimmed && trimmed !== original) {
      await onRename(editingId, trimmed)
    }
    setEditingId(null)
  }

  async function handleDelete(tagId: string) {
    setDeletingId(tagId)
    await onDelete(tagId)
    setDeletingId(null)
  }

  function exitEditMode() {
    setEditingId(null)
    setEditMode(false)
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-2 py-1.5 border-b border-zinc-800 shrink-0 items-center">
      {/* 전체 버튼 — 편집 모드 아닐 때만 */}
      {!editMode && (
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            selectedTagId === null
              ? 'bg-indigo-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
          }`}
        >
          전체
        </button>
      )}

      {tags.map((tag) =>
        editMode ? (
          <div key={tag.id} className="shrink-0 flex items-center gap-0.5">
            {editingId === tag.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="w-24 px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-100 border border-indigo-500 outline-none"
              />
            ) : (
              <button
                onClick={() => startEdit(tag)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                {tag.name}
              </button>
            )}
            <button
              onClick={() => handleDelete(tag.id)}
              disabled={deletingId === tag.id}
              className="text-zinc-600 hover:text-red-400 transition-colors text-xs px-0.5 disabled:opacity-40"
              aria-label={`${tag.name} 삭제`}
            >
              {deletingId === tag.id ? '…' : '✕'}
            </button>
          </div>
        ) : (
          <button
            key={tag.id}
            onClick={() => onSelect(tag.id)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTagId === tag.id
                ? 'bg-indigo-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            {tag.name}
          </button>
        )
      )}

      {/* 태그 관리 / 완료 버튼 */}
      {tags.length > 0 && (
        <button
          onClick={() => (editMode ? exitEditMode() : setEditMode(true))}
          className="shrink-0 ml-1 px-2.5 py-1 rounded-full text-xs transition-colors border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 whitespace-nowrap"
        >
          {editMode ? '완료' : '태그 관리'}
        </button>
      )}
    </div>
  )
}
