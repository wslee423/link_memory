export async function fetchTranscript(url: string): Promise<string | null> {
  try {
    // youtube-transcript 패키지 동적 import
    const { YoutubeTranscript } = await import('youtube-transcript')
    const transcript = await YoutubeTranscript.fetchTranscript(url)
    if (!transcript || transcript.length === 0) return null
    return transcript.map((t) => t.text).join(' ')
  } catch {
    return null
  }
}
