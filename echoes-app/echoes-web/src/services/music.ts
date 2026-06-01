import { config, log } from '../config/env'

export function buildDisplayMusicTitle(emotion: string, musicType: 'instrumental' | 'song' = 'instrumental', seedText = '') {
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
  const seed = Array.from(seedText).reduce((sum, char) => sum + char.charCodeAt(0), 0) + Date.now()
  return `${list[seed % list.length]}${suffixes[seed % suffixes.length]}`
}

export interface MusicGenerationResult {
  success: boolean
  musicUrl?: string
  title?: string
  gradient?: string[]
  error?: string
  isMock?: boolean
}

export interface GenerateMusicParams {
  emotion: string
  userText?: string
  musicType?: 'instrumental' | 'song'
  styleHint?: string
  onProgress?: (stage: string) => void
}

type MusicApiResponse = {
  success: boolean
  provider?: string
  taskId?: string
  status?: string
  audioUrl?: string
  audio_url?: string
  error?: string | { message?: string }
  data?: {
    music_url?: string
    audio_url?: string
    task_id?: string
    status?: string
    provider?: string
    title?: string
    prompt?: string
    gradient?: string[]
    is_fallback?: boolean
  }
}

const emotionMusicStyles: Record<string, { title: string; gradient: string[] }> = {
  melancholy: { title: '深夜独白', gradient: ['#415A77', '#1B263B'] },
  solitude: { title: '蓝色时刻', gradient: ['#415A77', '#778DA9'] },
  anxiety: { title: '不安的浪潮', gradient: ['#E07A5F', '#F4845F'] },
  confusion: { title: '迷雾', gradient: ['#9D8DF1', '#778DA9'] },
  calm: { title: '湖面微风', gradient: ['#81B29A', '#4EA8DE'] },
  joy: { title: '晨光', gradient: ['#FFD166', '#F4845F'] },
  hope: { title: '曙光', gradient: ['#4EA8DE', '#81B29A'] }
}

const emotionPrompts: Record<string, string> = {
  melancholy: 'melancholic cinematic ambient music, minor key, slow piano, string orchestra, atmospheric, film score, 60 seconds',
  solitude: 'ethereal ambient music, spacey synth pads, soft textures, minimalist, dreamy, contemplative, 60 seconds',
  anxiety: 'tense cinematic music, minor key, building tension, subtle drums, strings, anxiety atmosphere, 60 seconds',
  confusion: 'mysterious ambient music, dissonant harmonies, floating synths, uncertain atmosphere, 60 seconds',
  calm: 'peaceful ambient music, gentle piano, nature sounds, serene, relaxing, zen, 60 seconds loop',
  joy: 'uplifting cheerful music, major key, bright melody, light percussion, happy atmosphere, 60 seconds',
  hope: 'inspiring cinematic music, epic orchestral, hopeful melody, uplifting, motivational, 60 seconds'
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getAudioUrl(data: MusicApiResponse) {
  return data.data?.music_url || data.data?.audio_url || data.audioUrl || data.audio_url
}

function getTaskId(data: MusicApiResponse) {
  return data.taskId || data.data?.task_id
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return '音乐生成失败'
}

function toMusicResult(data: MusicApiResponse, emotion: string): MusicGenerationResult {
  const style = emotionMusicStyles[emotion] || emotionMusicStyles.calm

  return {
    success: true,
    musicUrl: getAudioUrl(data),
    title: data.data?.title || buildDisplayMusicTitle(emotion, ((data.data as any)?.musicType || 'instrumental'), (data.data?.prompt || '')),
    gradient: data.data?.gradient || style.gradient,
    isMock: data.provider === 'mock' || data.data?.provider === 'mock' || data.data?.is_fallback
  }
}

async function pollMusicStatus(taskId: string, emotion: string, musicType: string, onProgress?: (stage: string) => void) {
  const maxAttempts = 24
  const interval = 4000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await delay(interval)
    onProgress?.(`音乐生成中... ${attempt}/${maxAttempts}`)

    const response = await fetch(`${config.apiBaseUrl}/music/status/${taskId}/${musicType}`)
    if (!response.ok) {
      throw new Error('Music status request failed')
    }

    const data: MusicApiResponse = await response.json()
    const audioUrl = getAudioUrl(data)
    const status = data.status || data.data?.status

    if (audioUrl) {
      onProgress?.('音乐生成完成!')
      return toMusicResult(data, emotion)
    }

    if (status === 'failed' || status === 'timeouted' || status === 'cancelled') {
      const errorMessage = typeof data.error === 'string' ? data.error : data.error?.message
      throw new Error(errorMessage || `Music generation ${status}`)
    }
  }

  throw new Error('Music generation timeout')
}

export async function generateEmotionMusic(params: GenerateMusicParams): Promise<MusicGenerationResult> {
  const { emotion, userText, musicType = 'instrumental', styleHint, onProgress } = params

  onProgress?.('正在连接音乐引擎...')

  try {
    // 如果使用模拟数据
    if (config.useMockData) {
      log.warn('Using mock music data')
      onProgress?.('使用模拟数据...')

      await delay(1500)

      const style = emotionMusicStyles[emotion] || emotionMusicStyles.calm

      return {
        success: true,
        title: buildDisplayMusicTitle(emotion, 'instrumental', userText || ''),
        gradient: style.gradient,
        isMock: true
      }
    }

    onProgress?.('正在提交音乐生成任务...')

    const prompt = userText
      ? `Based on user's emotion: "${userText}". ${emotionPrompts[emotion] || emotionPrompts.calm}`
      : emotionPrompts[emotion] || emotionPrompts.calm

    log.info('Generating music with prompt:', prompt)

    // 通过后端代理调用，避免前端暴露 API Key
    const response = await fetch(`${config.apiBaseUrl}/music/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion, userText, musicType, styleHint })
    })

    if (!response.ok) {
      throw new Error('Music generation request failed')
    }

    const data: MusicApiResponse = await response.json()
    const audioUrl = getAudioUrl(data)

    if (audioUrl) {
      onProgress?.('音乐生成完成!')
      return toMusicResult(data, emotion)
    }

    const taskId = getTaskId(data)
    if (taskId) {
      onProgress?.('音乐任务已创建，等待生成...')
      return pollMusicStatus(taskId, emotion, musicType, onProgress)
    }

    throw new Error('Music generation response missing audioUrl and taskId')
  } catch (error) {
    log.error('Music generation error:', error)

    // 降级到模拟数据
    onProgress?.('生成失败，使用模拟数据...')

    await delay(1000)

    const style = emotionMusicStyles[emotion] || emotionMusicStyles.calm

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
  return {
    ...emotionMusicStyles[emotion],
    prompt: emotionPrompts[emotion]
  }
}
