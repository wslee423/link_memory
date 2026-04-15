export interface YouTubeMetadata {
  title: string
  thumbnailUrl: string | null
  channelName: string | null
  publishedAt: string | null
}

function extractYouTubeId(url: string): string | null {
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

export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    // 비유튜브: OGP fallback
    return { title: url, thumbnailUrl: null, channelName: null, publishedAt: null }
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
