export async function fetchTranscript(url: string): Promise<string | null> {
  try {
    const { YoutubeTranscript } = await import('youtube-transcript')
    const transcript = await YoutubeTranscript.fetchTranscript(url)
    if (!transcript || transcript.length === 0) return null
    return transcript.map((t) => t.text).join(' ')
  } catch (err) {
    // Vercel 로그에서 실제 에러 확인용
    console.error('[fetchTranscript] failed:', err instanceof Error ? err.message : err)
    return null
  }
}
