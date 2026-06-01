import { config, log } from '../config/env'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatAIResult {
  reply: string
  emotion: string
  musicType: 'instrumental' | 'song' | null
  styleHint: string
  musicTitle?: string
  lyricsRequired: boolean
  readyToGenerate: boolean
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatAIResult> {
  const controller = new AbortController()
  const timeoutMs = 35000
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${config.apiBaseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error('Chat request failed')
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Chat failed')
    }

    log.info('Chat response:', data.data)
    return data.data
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('网络有点慢，先暂停一下')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
