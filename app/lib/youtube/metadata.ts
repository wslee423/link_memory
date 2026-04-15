export interface YouTubeMetadata {
  title: string
  thumbnailUrl: string | null
  channelName: string | null
  publishedAt: string | null
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

async function fetchOEmbed(url: string): Promise<{ title: string; thumbnail_url: string | null; author_name: string | null } | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchVideoDescription(videoId: string): Promise<string | null> {
  const key = process.env.YOUTUBE_DATA_API_KEY
  if (!key) return null

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${key}`
    )
    if (!res.ok) return null
    const data = await res.json() as { items?: { snippet?: { description?: string } }[] }
    const description = data.items?.[0]?.snippet?.description ?? null
    // 설명이 너무 짧으면 의미 없음
    return description && description.length > 100 ? description : null
  } catch {
    return null
  }
}

async function fetchDataAPI(videoId: string): Promise<{ publishedAt: string | null }> {
  const key = process.env.YOUTUBE_DATA_API_KEY
  if (!key) return { publishedAt: null }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${key}`
    )
    if (!res.ok) return { publishedAt: null }
    const data = await res.json()
    const snippet = data.items?.[0]?.snippet
    return { publishedAt: snippet?.publishedAt?.slice(0, 10) ?? null }
  } catch {
    return { publishedAt: null }
  }
}

// 일반 웹 URL: OGP 태그에서 제목/썸네일 추출
async function fetchOGP(url: string): Promise<{ title: string; thumbnailUrl: string | null }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; link_memory-bot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { title: url, thumbnailUrl: null }

    const html = await res.text()

    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]

    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]

    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()

    return {
      title: ogTitle ?? titleTag ?? url,
      thumbnailUrl: ogImage ?? null,
    }
  } catch {
    return { title: url, thumbnailUrl: null }
  }
}

export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    const ogp = await fetchOGP(url)
    return { ...ogp, channelName: null, publishedAt: null }
  }

  const [oembed, dataApi] = await Promise.all([
    fetchOEmbed(url),
    fetchDataAPI(videoId),
  ])

  return {
    title: oembed?.title ?? url,
    thumbnailUrl: oembed?.thumbnail_url ?? null,
    channelName: oembed?.author_name ?? null,
    publishedAt: dataApi.publishedAt,
  }
}
