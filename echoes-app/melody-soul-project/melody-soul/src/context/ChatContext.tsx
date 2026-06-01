import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react'

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
  isPlaying: boolean
  setIsPlaying: (p: boolean) => void
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  togglePlay: () => void
  resetChat: () => void
  isFullPlayerOpen: boolean
  openFullPlayer: () => void
  closeFullPlayer: () => void
}

const initialGreeting: ChatBubbleMessage = {
  id: 'init-greeting',
  role: 'assistant',
  type: 'text',
  content: '嗨，我是 Echo。你今天怎么样？\n想聊聊还是想直接做一首歌？',
  timestamp: '刚刚'
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([initialGreeting])
  const [isTyping, setIsTyping] = useState(false)
  const [activeMusicGen, setActiveMusicGen] = useState(false)
  const [nowPlaying, setNowPlayingState] = useState<NowPlaying | null>(null)
  const [isPlaying, setIsPlayingState] = useState(false)
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false)
  const collectedTextRef = useRef<string>('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const openFullPlayer = useCallback(() => setIsFullPlayerOpen(true), [])
  const closeFullPlayer = useCallback(() => setIsFullPlayerOpen(false), [])

  const setNowPlaying = useCallback((np: NowPlaying | null) => {
    setNowPlayingState(np)
    if (np?.url) {
      // 自动开始播放
      setIsPlayingState(true)
    } else {
      setIsPlayingState(false)
    }
  }, [])

  const setIsPlaying = useCallback((p: boolean) => {
    setIsPlayingState(p)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlayingState(prev => !prev)
  }, [])

  // src 变化时主动 reload，否则浏览器不会切换音轨
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!nowPlaying?.url) {
      audio.pause()
      return
    }
    // 强制重新加载新音频源
    audio.load()
    audio.play().catch(err => {
      console.warn('Audio autoplay blocked:', err.message)
      setIsPlayingState(false)
    })
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
      isPlaying,
      setIsPlaying,
      audioRef,
      togglePlay,
      resetChat,
      isFullPlayerOpen,
      openFullPlayer,
      closeFullPlayer
    }}>
      {children}
      {/* 全局 audio 元素：跨 Tab 切换不会停 */}
      <audio
        ref={audioRef}
        src={nowPlaying?.url || ''}
        preload="auto"
        onEnded={() => setIsPlayingState(false)}
        onPlay={() => setIsPlayingState(true)}
        onPause={() => setIsPlayingState(false)}
        onError={() => {
          console.warn('Audio source failed to load (可能流式 URL 已过期)')
          setIsPlayingState(false)
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
