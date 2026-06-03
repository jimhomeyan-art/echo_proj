import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { initialSavedCapsules } from '../data/mockData'

export interface ChatMusicCard {
  id: string
  title: string
  cover?: string
  duration?: string
  style?: string
  mood?: string
  url?: string
  lyrics?: string
  creator?: string
  isGenerating?: boolean
  status?: string
  error?: string
}

export interface NamingPrompt {
  emotion: string
  userText: string
  musicType: 'instrumental' | 'song'
  styleHint: string
  aiTitle: string
  status: 'choosing' | 'awaitingInput' | 'done'
}

export interface ChatBubbleMessage {
  id: string
  role: 'user' | 'assistant'
  content?: string
  type?: 'text' | 'music' | 'naming'
  music?: ChatMusicCard
  naming?: NamingPrompt
  timestamp: string
}

export interface NowPlaying {
  id: string
  title: string
  cover?: string
  artist?: string
  url?: string
  lyrics?: string
  creator?: string
  mood?: string
}

/** 胶囊（用户收藏的音乐 + 自创音乐）条目 */
export interface CapsuleEntry {
  id: string
  title: string
  cover?: string
  duration?: string
  url?: string
  mood?: string        // 创作时的情绪 / 收藏时的情绪
  moment?: string      // 情境短句，如「那天你心情不太好」
  styleTag?: string
  createdAt: string    // 入胶囊时间
  plays: number
  source: 'created' | 'liked'  // 自创 or 喜欢
  creator?: string
  lyrics?: string
}

interface ChatContextValue {
  messages: ChatBubbleMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatBubbleMessage[]>>
  collectedTextRef: React.MutableRefObject<string>
  isTyping: boolean
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  activeMusicGen: boolean
  setActiveMusicGen: React.Dispatch<React.SetStateAction<boolean>>
  nowPlaying: NowPlaying | null
  setNowPlaying: (np: NowPlaying | null) => void
  /** 仅写入 nowPlaying（用作 MiniPlayer 上待播任务），不强行 play() */
  setNowPlayingSilent: (np: NowPlaying | null) => void
  isPlaying: boolean
  setIsPlaying: (p: boolean) => void
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  togglePlay: () => void
  resetChat: () => void
  isFullPlayerOpen: boolean
  openFullPlayer: () => void
  closeFullPlayer: () => void
  // 进度
  currentTime: number  // 秒
  duration: number     // 秒，未加载时为 0
  isBuffering: boolean // 是否正在缓冲
  seek: (sec: number) => void
  // 胶囊
  capsules: CapsuleEntry[]
  addCapsule: (c: CapsuleEntry) => void
  removeCapsule: (id: string) => void
  isCapsuled: (id: string) => boolean
  toggleCapsule: (c: CapsuleEntry) => boolean  // 返回操作后的状态 true=已收藏
}

const initialGreeting: ChatBubbleMessage = {
  id: 'init-greeting',
  role: 'assistant',
  type: 'text',
  content: '嗨，我是 Echo。你今天怎么样？\n想聊聊还是想直接做一首歌？',
  timestamp: '刚刚'
}

const ChatContext = createContext<ChatContextValue | null>(null)

const STORAGE_KEY_CAPSULES = 'echoes.capsules.v1'

const CAPSULES_VERSION = 'v2' // ← 改这里触发自动重置

function loadCapsules(): CapsuleEntry[] {
  try {
    const version = localStorage.getItem(STORAGE_KEY_CAPSULES + '_ver')
    const raw = localStorage.getItem(STORAGE_KEY_CAPSULES)
    if (raw && version === CAPSULES_VERSION) return JSON.parse(raw)
    // 版本不匹配：清旧数据，用最新 mock 重新初始化
    localStorage.removeItem(STORAGE_KEY_CAPSULES)
  } catch {}
  // 第一次 / 版本升级：把 mock 里 initialSavedCapsules 灌进来
  const fresh = initialSavedCapsules.map(c => ({
    id: c.id,
    title: c.title,
    cover: c.cover,
    duration: c.duration,
    url: c.url,
    mood: c.mood,
    moment: (c as any).moment as string | undefined,
    styleTag: c.styleTag,
    createdAt: c.createdAt,
    plays: c.plays,
    source: 'created' as const,
  }))
  try {
    localStorage.setItem(STORAGE_KEY_CAPSULES, JSON.stringify(fresh))
    localStorage.setItem(STORAGE_KEY_CAPSULES + '_ver', CAPSULES_VERSION)
  } catch {}
  return fresh
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([initialGreeting])
  const [isTyping, setIsTyping] = useState(false)
  const [activeMusicGen, setActiveMusicGen] = useState(false)
  const [nowPlaying, setNowPlayingState] = useState<NowPlaying | null>(null)
  const [isPlaying, setIsPlayingState] = useState(false)
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false)
  const [capsules, setCapsules] = useState<CapsuleEntry[]>(() => loadCapsules())
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)
  const collectedTextRef = useRef<string>('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_CAPSULES, JSON.stringify(capsules)) } catch {}
  }, [capsules])

  const openFullPlayer = useCallback(() => setIsFullPlayerOpen(true), [])
  const closeFullPlayer = useCallback(() => setIsFullPlayerOpen(false), [])

  /** 主动播放：用户点了播放、切歌等 → 写入并自动播 */
  const setNowPlaying = useCallback((np: NowPlaying | null) => {
    setNowPlayingState(np)
    if (np?.url) {
      setIsPlayingState(true)
    } else {
      setIsPlayingState(false)
    }
  }, [])

  /** 静默写入：仅展示，不打断当前 audio */
  const setNowPlayingSilent = useCallback((np: NowPlaying | null) => {
    setNowPlayingState(np)
    // 不动 isPlaying
  }, [])

  const setIsPlaying = useCallback((p: boolean) => {
    setIsPlayingState(p)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlayingState(prev => !prev)
  }, [])

  // src 变化时主动 reload，否则浏览器不会切换音轨
  // 仅当 isPlaying=true 时才 .play()；静默写入不会触发自动播放
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    // 切歌：进度归零
    setCurrentTime(0)
    setDuration(0)
    if (!nowPlaying?.url) {
      audio.pause()
      return
    }
    audio.load()
    if (isPlaying) {
      audio.play().catch(err => {
        console.warn('Audio autoplay blocked:', err.message)
        setIsPlayingState(false)
      })
    }
    // 注意：故意不把 isPlaying 加进依赖，避免暂停时回放
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.url])

  // 同步 isPlaying ↔ audio.play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !nowPlaying?.url) return
    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch(err => {
          console.warn('Audio play failed:', err.message)
          setIsPlayingState(false)
        })
      }
    } else {
      if (!audio.paused) audio.pause()
    }
  }, [isPlaying, nowPlaying?.url])

  const resetChat = useCallback(() => {
    setMessages([initialGreeting])
    setIsTyping(false)
    setActiveMusicGen(false)
    collectedTextRef.current = ''
  }, [])

  // 跳转到指定秒数
  const seek = useCallback((sec: number) => {
    const audio = audioRef.current
    if (!audio) return
    const dur = isFinite(audio.duration) ? audio.duration : 0
    if (!dur) return
    const clamped = Math.max(0, Math.min(sec, dur))
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  // ===== 胶囊 =====
  const addCapsule = useCallback((c: CapsuleEntry) => {
    setCapsules(prev => prev.some(x => x.id === c.id) ? prev : [c, ...prev])
  }, [])
  const removeCapsule = useCallback((id: string) => {
    setCapsules(prev => prev.filter(x => x.id !== id))
  }, [])
  const isCapsuled = useCallback((id: string) => capsules.some(x => x.id === id), [capsules])
  const toggleCapsule = useCallback((c: CapsuleEntry) => {
    let nextHas = false
    setCapsules(prev => {
      const exist = prev.some(x => x.id === c.id)
      if (exist) {
        nextHas = false
        return prev.filter(x => x.id !== c.id)
      }
      nextHas = true
      return [c, ...prev]
    })
    return nextHas
  }, [])

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      collectedTextRef,
      isTyping,
      setIsTyping,
      activeMusicGen,
      setActiveMusicGen,
      nowPlaying,
      setNowPlaying,
      setNowPlayingSilent,
      isPlaying,
      setIsPlaying,
      audioRef,
      togglePlay,
      resetChat,
      isFullPlayerOpen,
      openFullPlayer,
      closeFullPlayer,
      currentTime,
      duration,
      isBuffering,
      seek,
      capsules,
      addCapsule,
      removeCapsule,
      isCapsuled,
      toggleCapsule,
    }}>
      {children}
      {/* 全局 audio 元素：跨 Tab 切换不会停 */}
      <audio
        ref={audioRef}
        src={nowPlaying?.url || ''}
        preload="auto"
        onEnded={() => { setIsPlayingState(false); setIsBuffering(false) }}
        onPlay={() => { setIsPlayingState(true); setIsBuffering(false) }}
        onPause={() => setIsPlayingState(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onStalled={() => setIsBuffering(true)}
        onTimeUpdate={e => setCurrentTime((e.target as HTMLAudioElement).currentTime || 0)}
        onLoadedMetadata={e => {
          const d = (e.target as HTMLAudioElement).duration
          setDuration(d >= 0 ? d : 0)
          setCurrentTime((e.target as HTMLAudioElement).currentTime || 0)
          setIsBuffering(false)
        }}
        onDurationChange={e => {
          const d = (e.target as HTMLAudioElement).duration
          setDuration(d >= 0 ? d : 0)
        }}
        onError={e => {
          const audio = e.target as HTMLAudioElement
          const code = audio.error?.code
          const msg = audio.error?.message
          // code=1: 浏览器主动取消（切歌/reload）
          // code=4 + 无 src: audio 初始化时 src="" 的误触发
          if (code === 1) return
          if (code === 4 && !audio.currentSrc) return
          console.warn(`Audio error code=${code} msg=${msg} time=${audio.currentTime.toFixed(1)}s src=${audio.currentSrc}`)
          setIsPlayingState(false)
          setIsBuffering(false)
        }}
        style={{ display: 'none' }}
      />
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
