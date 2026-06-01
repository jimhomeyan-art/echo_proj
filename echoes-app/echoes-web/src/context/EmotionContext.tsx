import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { generateEmotionMusic } from '../services/music'

// 将 hex 音频数据转换为可播放的 Audio URL
function hexToAudioUrl(hexString: string): string {
  try {
    const binaryString = hexString.replace(/[\r\n]/g, '')
    let binaryData = ''
    for (let i = 0; i < binaryString.length; i += 2) {
      binaryData += String.fromCharCode(parseInt(binaryString.substr(i, 2), 16))
    }
    const blob = new Blob([binaryData], { type: 'audio/mp3' })
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Hex to audio conversion error:', error)
    return ''
  }
}

// 模拟音乐 URL
const mockMusicUrls: Record<string, string> = {
  melancholy: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  solitude: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  anxiety: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  confusion: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  calm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  joy: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  hope: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
}

// 情绪类型到音乐风格的映射
export interface MusicStyle {
  title: string
  prompt: string
  lyrics?: string
  isInstrumental: boolean
  gradient: string[]
}

const emotionToMusicStyle: Record<string, MusicStyle> = {
  melancholy: {
    title: '深夜独白',
    prompt: 'melancholic cinematic ambient music, minor key, slow piano, string orchestra, atmospheric, film score, sad mood, emotional depth',
    lyrics: `[Verse 1]\n夜深人静思绪飘\n回忆像潮水涌来\n那些错过的人啊\n是否也在思念\n\n[Chorus]\n深夜独白谁能听\n寂寞是最好的歌\n让泪水流成河\n淹没所有寂寞\n\n[Verse 2]\n窗外月光照无眠\n心事重重压心间\n不知明天会怎样\n只愿今夜能安眠`,
    isInstrumental: true,
    gradient: ['#415A77', '#1B263B']
  },
  solitude: {
    title: '蓝色时刻',
    prompt: 'ethereal ambient music, spacey synth pads, soft textures, minimalist, dreamy, contemplative, lonely atmosphere',
    lyrics: `[Verse 1]\n一个人走在街头\n霓虹灯闪烁不休\n身边人来人往\n却没有人在左右\n\n[Chorus]\n蓝色时刻的寂寞\n是心里最深的歌\n不需要谁来懂\n自己与自己相拥`,
    isInstrumental: true,
    gradient: ['#415A77', '#778DA9']
  },
  anxiety: {
    title: '不安的浪潮',
    prompt: 'tense cinematic music, minor key, building tension, subtle drums, strings, anxiety atmosphere, urgent heartbeat rhythm',
    lyrics: `[Verse 1]\n心跳越来越快\n呼吸变得急促\n明天会怎样\n谁也无法预测\n\n[Chorus]\n不安的浪潮袭来\n将我淹没在黑暗\n想要挣脱这一切\n却找不到出口`,
    isInstrumental: true,
    gradient: ['#E07A5F', '#F4845F']
  },
  confusion: {
    title: '迷雾',
    prompt: 'mysterious ambient music, dissonant harmonies, floating synths, uncertain atmosphere, lost in thought',
    lyrics: `[Verse 1]\n站在十字路口\n不知该往哪走\n前方迷雾重重\n看不清路在何方\n\n[Chorus]\n迷雾中的迷惘\n是谁在指引方向\n在这漆黑夜里\n寻找一点光亮`,
    isInstrumental: true,
    gradient: ['#9D8DF1', '#778DA9']
  },
  calm: {
    title: '湖面微风',
    prompt: 'peaceful ambient music, gentle piano, nature sounds, serene, relaxing, zen, peaceful lake, gentle breeze, meditation atmosphere',
    lyrics: `[Verse 1]\n湖面波光粼粼\n微风轻轻吹过\n放下所有烦恼\n感受此刻宁静\n\n[Chorus]\n湖面微风轻拂\n心如止水宁静\n在这美好时光\n感受生命意义`,
    isInstrumental: true,
    gradient: ['#81B29A', '#4EA8DE']
  },
  joy: {
    title: '晨光',
    prompt: 'uplifting cheerful music, major key, bright melody, light percussion, happy atmosphere, joyful, celebration, sunshine',
    lyrics: `[Verse 1]\n阳光洒满大地\n花儿绽放美丽\n快乐充满心里\n世界充满奇迹\n\n[Chorus]\n这是快乐时光\n让我们一起唱\n开心的日子\n就在你身旁`,
    isInstrumental: true,
    gradient: ['#FFD166', '#F4845F']
  },
  hope: {
    title: '曙光',
    prompt: 'inspiring cinematic music, epic orchestral, hopeful melody, uplifting, motivational, sunrise, new beginning, triumphant',
    lyrics: `[Verse 1]\n穿过黑夜的长廊\n终会见到曙光\n心中有光不惧怕\n勇敢向前飞翔\n\n[Chorus]\n曙光照亮前路\n梦想不再遥远\n不管多少困难\n都无法阻挡`,
    isInstrumental: true,
    gradient: ['#4EA8DE', '#81B29A']
  }
}

// 风格参考映射
export const styleReferences: Record<string, string> = {
  '周杰伦': 'Jay Chou style, Chinese pop, R&B, slow tempo, melodic rap, nostalgic, emotional lyrics, piano and guitar accompaniment',
  '林俊杰': 'JJ Lin style, Chinese pop, soulful, romantic, powerful vocals, emotional ballads, melodic',
  '陈奕迅': 'Eason Chan style, Cantonese pop, emotional depth, mature, storytelling lyrics, soulful voice, dramatic',
  '邓紫棋': 'G.E.M. style, powerful vocals, R&B, pop rock, high energy, emotional, dynamic range',
  '李荣浩': 'Li Ronghao style, Chinese rock, soulful, folk elements, guitar-driven, storytelling',
  '薛之谦': 'Xue Zhiqian style, Chinese pop, emotional lyrics, melancholic, love songs, piano ballads',
  '告五人': 'Accusefive style, Taiwanese indie pop, dreamy, atmospheric, emotional, indie rock',
  '久石让': 'Joe Hisaishi style, cinematic orchestral, anime soundtrack, emotional, grand, piano and orchestra',
  'Hans Zimmer': 'Hans Zimmer style, epic cinematic, dramatic orchestral, film score, powerful, electronic elements',
  '班得瑞': 'Bandari style, new age, peaceful, nature sounds, instrumental, relaxing, ambient, spa music'
}

export const emotionColors: Record<string, string> = {
  melancholy: '#778DA9',
  solitude: '#415A77',
  anxiety: '#E07A5F',
  confusion: '#9D8DF1',
  calm: '#81B29A',
  joy: '#FFD166',
  hope: '#4EA8DE'
}

export const emotionLabels: Record<string, string> = {
  melancholy: '忧郁',
  solitude: '孤独',
  anxiety: '焦虑',
  confusion: '迷茫',
  calm: '平静',
  joy: '喜悦',
  hope: '希望'
}

export const emotionFrequencies: Record<string, number> = {
  melancholy: 432,
  solitude: 396,
  anxiety: 528,
  confusion: 417,
  calm: 285,
  joy: 639,
  hope: 528
}

// 检测用户输入中是否包含风格参考
export function detectStyleReference(userText: string): string | null {
  const styleKeywords = Object.keys(styleReferences)
  for (const keyword of styleKeywords) {
    if (userText.includes(keyword)) {
      return keyword
    }
  }
  return null
}

// 检测用户是否想要歌曲
export function detectWantsSong(userText: string): boolean {
  const songKeywords = ['歌', '歌曲', '唱', '歌词', '唱歌', '听歌']
  const text = userText.toLowerCase()
  return songKeywords.some(keyword => text.includes(keyword))
}

interface EmotionRecord {
  id: string
  createdAt: string
  text: string
  emotions: Record<string, number>
  dominant: string
  intensity: number
  music: {
    title: string
    prompt?: string
    gradient: string[]
    musicUrl?: string
  }
}

interface Capsule {
  id: string
  createdAt: string
  unlockAt: string
  text: string
  emotion: EmotionRecord
  musicTitle: string
  isPublic: boolean
  echoes: number
}

interface MusicGenerationResult {
  success: boolean
  musicUrl?: string
  music?: {
    title: string
    prompt: string
    gradient: string[]
  }
  error?: string
}

interface EmotionContextType {
  emotionHistory: EmotionRecord[]
  capsules: Capsule[]
  currentEmotion: EmotionRecord | null
  musicResult: MusicGenerationResult | null
  isGeneratingMusic: boolean
  nowPlaying: EmotionRecord | null
  isPlaying: boolean
  addEmotionRecord: (record: EmotionRecord) => void
  addCapsule: (capsule: Capsule) => void
  deleteCapsule: (id: string) => void
  setCurrentEmotion: (emotion: EmotionRecord | null) => void
  setNowPlaying: (emotion: EmotionRecord | null) => void
  setIsPlaying: (playing: boolean) => void
  generateMusic: (emotion: string, userText: string, musicType?: 'instrumental' | 'song', styleHint?: string, onProgress?: (stage: string) => void) => Promise<MusicGenerationResult>
}

const EmotionContext = createContext<EmotionContextType | null>(null)

export function useEmotion() {
  const context = useContext(EmotionContext)
  if (!context) {
    throw new Error('useEmotion must be used within EmotionProvider')
  }
  return context
}

export function EmotionProvider({ children }: { children: ReactNode }) {
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([])
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [currentEmotion, setCurrentEmotion] = useState<EmotionRecord | null>(null)
  const [nowPlaying, setNowPlaying] = useState<EmotionRecord | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [musicResult, setMusicResult] = useState<MusicGenerationResult | null>(null)
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false)

  const generateMusic = useCallback(async (
    emotion: string,
    userText: string,
    musicType: 'instrumental' | 'song' = 'instrumental',
    styleHint: string = '',
    onProgress?: (stage: string) => void
  ): Promise<MusicGenerationResult> => {
    setIsGeneratingMusic(true)
    setMusicResult(null)

    try {
      const style = emotionToMusicStyle[emotion] || emotionToMusicStyle.calm

      // 检测是否包含风格参考
      const styleRef = detectStyleReference(userText)
      let finalUserText = userText
      if (styleRef) {
        finalUserText = `${userText}\nStyle reference: ${styleReferences[styleRef]}`
      }

      console.log('🎵 Generating music via backend proxy')
      console.log('🎵 Music type:', musicType === 'song' ? '歌曲' : '纯音乐')

      const generated = await generateEmotionMusic({
        emotion,
        userText: finalUserText,
        musicType,
        styleHint,
        onProgress: stage => {
          console.log('🎵', stage)
          onProgress?.(stage)
        }
      })

      const result: MusicGenerationResult = {
        success: true,
        musicUrl: generated.musicUrl || mockMusicUrls[emotion] || mockMusicUrls.calm,
        music: {
          title: generated.title || style.title,
          prompt: style.prompt,
          gradient: generated.gradient || style.gradient
        },
        error: generated.error
      }

      setMusicResult(result)
      return result
    } catch (error) {
      console.error('Music generation error:', error)

      const style = emotionToMusicStyle[emotion] || emotionToMusicStyle.calm
      const mockUrl = mockMusicUrls[emotion] || mockMusicUrls.calm
      const result: MusicGenerationResult = {
        success: true,
        musicUrl: mockUrl,
        music: {
          title: style.title,
          prompt: style.prompt,
          gradient: style.gradient
        },
        error: '模拟模式 - 真实AI音乐生成待接入'
      }

      console.log('🎵 Using mock music:', mockUrl)
      setMusicResult(result)
      return result
    } finally {
      setIsGeneratingMusic(false)
    }
  }, [])

  const addEmotionRecord = useCallback((record: EmotionRecord) => {
    setEmotionHistory(prev => [record, ...prev].slice(0, 100))
    setCurrentEmotion(record)
  }, [])

  const addCapsule = useCallback((capsule: Capsule) => {
    setCapsules(prev => [capsule, ...prev])
  }, [])

  const deleteCapsule = useCallback((id: string) => {
    setCapsules(prev => prev.filter(c => c.id !== id))
  }, [])

  return (
    <EmotionContext.Provider value={{
      emotionHistory,
      capsules,
      currentEmotion,
      musicResult,
      isGeneratingMusic,
      nowPlaying,
      isPlaying,
      addEmotionRecord,
      addCapsule,
      deleteCapsule,
      setCurrentEmotion,
      setNowPlaying,
      setIsPlaying,
      generateMusic
    }}>
      {children}
    </EmotionContext.Provider>
  )
}

export { emotionToMusicStyle }
