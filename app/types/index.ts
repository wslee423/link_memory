export interface Link {
  id: string
  userId: string
  url: string
  title: string
  thumbnailUrl: string | null
  channelName: string | null
  publishedAt: string | null
  aiSummary: AiSummary | null
  memo: string
  tags: Tag[]
  createdAt: string
}

export interface AiSummary {
  summary: string[]
  insights: string[]
  generatedAt: string
}

export interface Tag {
  id: string
  name: string
}

export interface LinkWithTags extends Link {
  link_tags: { tags: Tag }[]
}

// API 요청/응답 타입
export interface CreateLinkRequest {
  url: string
}

export interface UpdateLinkRequest {
  memo?: string
  tagIds?: string[]
}

export interface CreateTagRequest {
  name: string
}
