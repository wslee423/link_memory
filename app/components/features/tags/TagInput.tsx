'use client'

import { useState } from 'react'
import type { Tag } from '@/types'

interface TagInputProps {
  allTags: Tag[]
  selectedTags: Tag[]
  onAdd: (tag: Tag) => void
  onRemove: (tagId: string) => void
  onCreateAndAdd: (name: string) => Promise<void>
}

export function TagInput({ allTags, selectedTags, onAdd, onRemove, onCreateAndAdd }: TagInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedIds = new Set(selectedTags.map((t) => t.id))
  const suggestions = input.trim()
    ? allTags.filter((t) => !selectedIds.has(t.id) && t.name.includes(input.trim()))
    : []
  const exactMatch = allTags.find((t) => t.name === input.trim())

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const name = input.trim()
    if (!name) return

    setLoading(true)
    if (exactMatch && !selectedIds.has(exactMatch.id)) {
      onAdd(exactMatch)
    } else if (!exactMatch) {
      await onCreateAndAdd(name)
    }
    setInput('')
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      {/* 현재 태그 목록 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full"
            >
              {tag.name}
              <button
                onClick={() => onRemove(tag.id)}
                className="hover:text-indigo-100 leading-none"
                aria-label={`${tag.name} 태그 제거`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 입력 + 자동완성 */}
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="태그 추가 (Enter)"
          maxLength={30}
          className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-lg">
            {suggestions.slice(0, 5).map((tag) => (
              <li key={tag.id}>
                <button
                  onClick={() => { onAdd(tag); setInput('') }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  {tag.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
