export interface Link {
  id: string
  url: string
  title: string
  thumbnailUrl: string | null
  channelName: string | null
  publishedAt: string | null
  aiSummary: AiSummary | null
  aiSummaryError: string | null
  memo: string
  tags: Tag[]
  createdAt: string
  isArchived: boolean
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

// API 요청/응답 타입
export interface CreateLinkRequest {
  url: string
}

export interface UpdateLinkRequest {
  memo?: string
  tagIds?: string[]
  isArchived?: boolean
}

export interface CreateTagRequest {
  name: string
}

export interface UpdateTagRequest {
  name: string
}
