import { config, log } from '../config/env'

export interface MusicGenerationResult {
  success: boolean
  musicUrl?: string
  title?: string
  gradient?: string[]
  error?: string
  isMock?: boolean
  lyrics?: string
}

export interface GenerateMusicParams {
  emotion: string
  userText?: string
  musicType?: 'instrumental' | 'song'
  styleHint?: string
  musicTitle?: string
  onProgress?: (stage: string) => void
}

type MusicApiResponse = {
  success: boolean
  provider?: string
  taskId?: string
  status?: string
  audioUrl?: string
  audio_url?: string
  isStable?: boolean
  isStreaming?: boolean
  error?: string | { message?: string }
  data?: {
    music_url?: string
    audio_url?: string
    stable_url?: string
    stream_url?: string
    task_id?: string
    status?: string
    raw_status?: string
    provider?: string
    title?: string
    prompt?: string
    gradient?: string[]
    lyrics?: string
    is_fallback?: boolean
  }
}

const emotionStyles: Record<string, { title: string; gradient: string[] }> = {
  melancholy: { title: '深夜独白', gradient: ['#415A77', '#1B263B'] },
  solitude:   { title: '蓝色时刻', gradient: ['#415A77', '#778DA9'] },
  anxiety:    { title: '不安的浪潮', gradient: ['#E07A5F', '#F4845F'] },
  confusion:  { title: '迷雾', gradient: ['#9D8DF1', '#778DA9'] },
  calm:       { title: '湖面微风', gradient: ['#81B29A', '#4EA8DE'] },
  joy:        { title: '晨光', gradient: ['#FFD166', '#F4845F'] },
  hope:       { title: '曙光', gradient: ['#4EA8DE', '#81B29A'] },
  exhaustion: { title: '低沉', gradient: ['#778DA9', '#1B263B'] },
  anger:      { title: '暗涌', gradient: ['#E07A5F', '#1B263B'] }
}

export function buildDisplayMusicTitle(emotion: string, musicType: 'instrumental' | 'song' = 'song', seed = '') {
  const emotionWords: Record<string, string[]> = {
    melancholy: ['深夜', '雨声', '旧梦', '低潮'],
    solitude: ['蓝色', '空房间', '远灯', '独白'],
    anxiety: ['暗涌', '潮汐', '微颤', '风暴'],
    confusion: ['迷雾', '岔路', '悬浮', '无声'],
    calm: ['湖面', '晚风', '月光', '静水'],
    joy: ['晨光', '微光', '暖阳', '轻盈'],
    hope: ['曙光', '星火', '远方', '初晴'],
    exhaustion: ['倦鸟', '缓慢', '归处', '低云']
  }
  const suffixes = musicType === 'song'
    ? ['之歌', '回声', '小调', '心事']
    : ['配乐', '片段', '回响', '夜曲']
  const list = emotionWords[emotion] || emotionWords.calm
  const seedNum = Array.from(seed).reduce((s, c) => s + c.charCodeAt(0), 0) + Date.now()
  return `${list[seedNum % list.length]}${suffixes[seedNum % suffixes.length]}`
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getStableAudioUrl(data: MusicApiResponse) {
  return data.data?.stable_url || ''
}

function getAudioUrl(data: MusicApiResponse) {
  return data.data?.stable_url || data.data?.music_url || data.data?.audio_url || data.data?.stream_url || data.audioUrl || data.audio_url
}

function getTaskId(data: MusicApiResponse) {
  return data.taskId || data.data?.task_id
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return '音乐生成失败'
}

function toMusicResult(data: MusicApiResponse, emotion: string, musicType: 'instrumental' | 'song'): MusicGenerationResult {
  const style = emotionStyles[emotion] || emotionStyles.calm
  return {
    success: true,
    musicUrl: getAudioUrl(data),
    title: buildDisplayMusicTitle(emotion, musicType, data.data?.prompt || ''),
    gradient: data.data?.gradient || style.gradient,
    lyrics: data.data?.lyrics || '',
    isMock: data.provider === 'mock' || data.data?.provider === 'mock' || data.data?.is_fallback
  }
}

async function pollMusicStatus(
  taskId: string,
  emotion: string,
  musicType: string,
  onProgress?: (stage: string) => void
) {
  const maxAttempts = 50          // 最多等 200 秒，给服务器足够时间下载 stream
  const interval = 4000
  // stream_url 现在由服务器后台下载，不再直接返回给前端
  const maxStreamWaitRounds = 999 // 永不 fallback stream，让服务器下载完
  let streamWaitRounds = 0
  let lastResponse: MusicApiResponse | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await delay(interval)
    onProgress?.(`音乐生成中 ${attempt}/${maxAttempts}`)

    const response = await fetch(`${config.apiBaseUrl}/music/status/${taskId}/${musicType}`)
    if (!response.ok) {
      throw new Error('Music status request failed')
    }

    const data: MusicApiResponse = await response.json()
    lastResponse = data
    const stableUrl = getStableAudioUrl(data)
    const streamUrl = data.data?.stream_url
    const status = data.status || data.data?.status

    if (stableUrl) {
      onProgress?.('音乐已生成')
      return toMusicResult(data, emotion, musicType as 'instrumental' | 'song')
    }

    if (streamUrl) {
      streamWaitRounds++
      onProgress?.(streamWaitRounds < maxStreamWaitRounds ? '即将生成完毕…' : '已可播放')
      if (streamWaitRounds >= maxStreamWaitRounds) {
        // 等够了仍然只有 stream，就用 stream 起播
        return toMusicResult(data, emotion, musicType as 'instrumental' | 'song')
      }
    }

    if (status === 'failed' || status === 'timeouted' || status === 'cancelled') {
      const msg = typeof data.error === 'string' ? data.error : data.error?.message
      throw new Error(msg || `Music generation ${status}`)
    }
  }
  if (lastResponse && getAudioUrl(lastResponse)) {
    return toMusicResult(lastResponse, emotion, musicType as 'instrumental' | 'song')
  }
  throw new Error('Music generation timeout')
}

export async function generateEmotionMusic(params: GenerateMusicParams): Promise<MusicGenerationResult> {
  const { emotion, userText, musicType = 'song', styleHint, musicTitle, onProgress } = params

  onProgress?.('正在连接音乐引擎')

  try {
    if (config.useMockData) {
      log.warn('Using mock music data')
      onProgress?.('使用模拟数据')
      await delay(1500)
      const style = emotionStyles[emotion] || emotionStyles.calm
      return {
        success: true,
        title: musicTitle || buildDisplayMusicTitle(emotion, musicType, userText || ''),
        gradient: style.gradient,
        isMock: true
      }
    }

    onProgress?.('正在提交音乐生成任务')

    const response = await fetch(`${config.apiBaseUrl}/music/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion, userText, musicType, styleHint, musicTitle })
    })

    if (!response.ok) {
      throw new Error('Music generation request failed')
    }

    const data: MusicApiResponse = await response.json()
    const audioUrl = getAudioUrl(data)
    if (audioUrl) {
      onProgress?.('音乐已生成')
      return toMusicResult(data, emotion, musicType)
    }

    const taskId = getTaskId(data)
    if (taskId) {
      onProgress?.('音乐任务已创建，等待生成')
      return pollMusicStatus(taskId, emotion, musicType, onProgress)
    }

    throw new Error('Music generation response missing audioUrl and taskId')
  } catch (error) {
    log.error('Music generation error:', error)
    onProgress?.('生成失败，使用占位音乐')
    await delay(800)

    const style = emotionStyles[emotion] || emotionStyles.calm
    return {
      success: true,
      title: buildDisplayMusicTitle(emotion, musicType, userText || ''),
      gradient: style.gradient,
      error: getErrorMessage(error),
      isMock: true
    }
  }
}

export function getMusicStyleForEmotion(emotion: string) {
  return emotionStyles[emotion] || emotionStyles.calm
}
