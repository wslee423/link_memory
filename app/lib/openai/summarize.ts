import OpenAI from 'openai'
import type { AiSummary } from '@/types'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateSummary(
  content: string,
  contentType: 'transcript' | 'description' = 'transcript'
): Promise<AiSummary | null> {
  if (content.length < 100) return null

  const sourceLabel = contentType === 'transcript' ? '영상 자막' : '영상 설명'

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 영상 콘텐츠 요약 전문가입니다.
주어진 ${sourceLabel}을 분석하여 한국어로 요약합니다.
반드시 다음 JSON 형식으로만 응답하세요:
{
  "summary": ["핵심 내용 1문장", "핵심 내용 2문장", "핵심 내용 3문장"],
  "insights": ["실용적 인사이트 1", "실용적 인사이트 2", "실용적 인사이트 3"]
}`,
        },
        {
          role: 'user',
          content: `다음 ${sourceLabel}을 요약해주세요:\n\n${content.slice(0, 12000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 600,
    })

    const text = response.choices[0]?.message?.content
    if (!text) return null

    const parsed = JSON.parse(text) as { summary: string[]; insights: string[] }
    return {
      summary: parsed.summary ?? [],
      insights: parsed.insights ?? [],
      generatedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}
