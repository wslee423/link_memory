'use client'

import type { Tag } from '@/types'

interface TagBarProps {
  tags: Tag[]
  selectedTagId: string | null
  onSelect: (tagId: string | null) => void
}

export function TagBar({ tags, selectedTagId, onSelect }: TagBarProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-2 py-1.5 border-b border-zinc-800 shrink-0">
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
      {tags.map((tag) => (
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
      ))}
    </div>
  )
}
