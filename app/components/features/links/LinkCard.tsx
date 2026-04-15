import Image from 'next/image'
import type { Link, Tag } from '@/types'

interface LinkCardProps {
  link: Link
  isSelected: boolean
  onSelect: (id: string) => void
}

export function LinkCard({ link, isSelected, onSelect }: LinkCardProps) {
  return (
    <div
      onClick={() => onSelect(link.id)}
      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors
        ${isSelected
          ? 'bg-zinc-700 border-l-2 border-indigo-500'
          : 'bg-zinc-800 hover:bg-zinc-700 border-l-2 border-transparent'
        }`}
    >
      {/* 썸네일 */}
      <div className="shrink-0 w-24 h-16 bg-zinc-700 rounded overflow-hidden">
        {link.thumbnailUrl ? (
          <Image
            src={link.thumbnailUrl}
            alt={link.title}
            width={96}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
            No image
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-zinc-100 text-sm font-medium leading-snug line-clamp-2">
          {link.title}
        </p>
        {(link.channelName || link.publishedAt) && (
          <p className="text-zinc-400 text-xs">
            {link.channelName}
            {link.channelName && link.publishedAt && ' · '}
            {link.publishedAt}
          </p>
        )}
        {/* 태그 (최대 3개) */}
        {link.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {link.tags.slice(0, 3).map((tag: Tag) => (
              <span key={tag.id} className="px-1.5 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded">
                {tag.name}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-zinc-500 text-xs">
                +{link.tags.length - 3}
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
