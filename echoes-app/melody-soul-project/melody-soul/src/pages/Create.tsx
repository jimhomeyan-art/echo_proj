import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, Sparkles, Clock, Share2, Heart, Download, X, Music2, Play, Pause } from 'lucide-react'
import { sendChatMessage, type ChatMessage } from '../services/chat'
import { generateEmotionMusic, type MusicGenerationResult } from '../services/music'
import { useChat, type ChatBubbleMessage, type ChatMusicCard } from '../context/ChatContext'
import { EchoAvatar } from '../components/common/EchoAvatar'
import { NamingCard } from '../components/common/NamingCard'
import { currentUser } from '../data/mockData'

type Message = ChatBubbleMessage
type MusicCard = ChatMusicCard

const defaultMusicCover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'

const emotionTags = [
  { id: 'e1', label: '开心', emoji: '😊', color: '#FFD93D' },
  { id: 'e2', label: '悲伤', emoji: '😢', color: '#6C93F0' },
  { id: 'e3', label: '兴奋', emoji: '🎉', color: '#FF6B6B' },
  { id: 'e4', label: '平静', emoji: '😌', color: '#00D9FF' },
  { id: 'e5', label: '浪漫', emoji: '💕', color: '#F5576C' },
  { id: 'e6', label: '愤怒', emoji: '😤', color: '#FF4757' },
]

// 风格 / 心情 / 场景的丰富建议池
const suggestionPool = [
  // —— 风格类 ——
  '想做一首温柔的钢琴民谣',
  '来一首中国风的歌',
  '复古城市流行',
  'lofi 嘻哈陪我学习',
  '夜晚的爵士酒吧',
  '90 年代港乐风',
  '宫崎骏式的治愈钢琴',
  '电子梦核风',
  'shoegaze 朦胧吉他',
  '木吉他清新民谣',
  '摇滚但带一点伤感',
  'R&B 慢摇',
  'bossa nova 慵懒',
  '童声合唱',
  '管弦乐电影感',
  '日系 city pop',
  '神秘氛围合成器',
  // —— 情绪类 ——
  '今天有点累',
  '我想哭一会儿',
  '心情不错',
  '感觉很孤独',
  '焦虑得睡不着',
  '在期待一件事',
  '想被治愈一下',
  '提点劲，要去拼一下',
  // —— 场景类 ——
  '雨夜独自走路',
  '深夜失眠',
  '清晨咖啡馆',
  '回家的地铁上',
  '想念一个人',
  '工作太多想喘口气',
  // —— 参考艺人 ——
  '像周杰伦的中国风',
  '像陈奕迅的港乐',
  '像 Taylor Swift 的民谣',
  '像 Lana Del Rey 的氛围',
  '像草东的失意感'
]

function pickRandomSuggestions(n: number) {
  const arr = [...suggestionPool]
  // Fisher-Yates 取前 n 个
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, n)
}

/**
 * 从 AI 反问句里提取风格选项
 * 支持："比如：A / B / C" / "比如 A、B、C" / "A 还是 B 还是 C"
 */
function extractStyleOptions(text: string): string[] {
  if (!text) return []
  // 必须是问句才提取（避免误判普通陈述句）
  if (!/[?？]/.test(text)) return []

  // pattern 1: "比如：A / B / C" 或 "比如 A、B、C"
  const m1 = text.match(/比如[：:]?\s*(.+?)(?:[?？。.]|$)/)
  if (m1) {
    const list = m1[1].split(/[\/、,，]|或者|或/).map(s => s.trim().replace(/^还是\s*/, '')).filter(Boolean)
    if (list.length >= 2 && list.length <= 5) return list.slice(0, 5)
  }

  // pattern 2: "A 还是 B 还是 C"
  const m2 = text.match(/(.+?(?:\s*还是\s*.+?){1,4})\s*[?？]/)
  if (m2) {
    const list = m2[1].split(/\s*还是\s*/).map(s => s.trim()).filter(Boolean)
    // 过滤过长的句子（避免把整段问句误当选项）
    if (list.length >= 2 && list.every(s => s.length <= 14)) return list.slice(0, 5)
  }

  return []
}

const initialGreeting: Message = {
  id: 'init-greeting',
  role: 'assistant',
  type: 'text',
  content: '嗨，我是 Echo。你今天怎么样？\n想聊聊还是想直接做一首歌？',
  timestamp: '刚刚'
}

function nowTimestamp() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function toApiMessages(messages: Message[], nextUserText?: string): ChatMessage[] {
  const history: ChatMessage[] = messages
    .map(m => {
      // 把已生成的音乐卡片转成 AI 视角的"我已经生成了《xxx》"以便千问理解上下文
      if (m.music && !m.music.isGenerating && m.music.url) {
        return {
          role: 'assistant' as const,
          content: `[已生成歌曲：《${m.music.title || '未命名'}》。已经放到播放器里了。]`
        }
      }
      if (m.music) return null
      // 命名卡片转成 assistant 在询问命名
      if (m.naming) {
        return { role: 'assistant' as const, content: '[正在让用户决定歌曲名字]' }
      }
      return { role: m.role, content: m.content || '' }
    })
    .filter((m): m is ChatMessage => Boolean(m && m.content))
  return nextUserText
    ? [...history, { role: 'user' as const, content: nextUserText }].slice(-20)
    : history.slice(-20)
}

export const CreatePage: React.FC = () => {
  const chat = useChat()
  const {
    messages, setMessages, collectedTextRef, isTyping, setIsTyping,
    activeMusicGen, setActiveMusicGen,
    setNowPlaying, setNowPlayingSilent, nowPlaying, isPlaying,
    openFullPlayer, togglePlay,
    isCapsuled, toggleCapsule,
  } = chat
  const [inputValue, setInputValue] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(() => pickRandomSuggestions(5))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function appendMessage(msg: Message) {
    setMessages(prev => [...prev, msg])
  }

  function updateMusicMessage(id: string, patch: Partial<MusicCard>) {
    setMessages(prev => prev.map(m => (
      m.id === id && m.music ? { ...m, music: { ...m.music, ...patch } } : m
    )))
  }

  function updateNamingMessage(id: string, patch: Partial<NonNullable<Message['naming']>>) {
    setMessages(prev => prev.map(m => (
      m.id === id && m.naming ? { ...m, naming: { ...m.naming, ...patch } } : m
    )))
  }

  function handleNamingChoose(messageId: string, mode: 'ai' | 'self') {
    const msg = messages.find(m => m.id === messageId)
    if (!msg?.naming) return

    if (mode === 'ai') {
      // AI 命名 → 直接生成（用 千问的 musicTitle，最终也会被 buildDisplayMusicTitle 兜底）
      updateNamingMessage(messageId, { status: 'done' })
      generateMusicInChat({
        emotion: msg.naming.emotion,
        userText: msg.naming.userText,
        musicType: msg.naming.musicType,
        styleHint: msg.naming.styleHint,
        customTitle: msg.naming.aiTitle || undefined
      })
    } else {
      // 自己命名 → 等用户输入
      updateNamingMessage(messageId, { status: 'awaitingInput' })
    }
  }

  function handleNamingSubmit(messageId: string, title: string) {
    const msg = messages.find(m => m.id === messageId)
    if (!msg?.naming) return
    const trimmed = title.trim()
    if (!trimmed) return

    updateNamingMessage(messageId, { status: 'done' })
    appendMessage({
      id: `user-name-${Date.now()}`,
      role: 'user',
      type: 'text',
      content: `就叫《${trimmed}》吧`,
      timestamp: nowTimestamp()
    })

    generateMusicInChat({
      emotion: msg.naming.emotion,
      userText: msg.naming.userText,
      musicType: msg.naming.musicType,
      styleHint: msg.naming.styleHint,
      customTitle: trimmed
    })
  }

  async function generateMusicInChat(params: {
    emotion: string
    userText: string
    musicType: 'instrumental' | 'song'
    styleHint: string
    customTitle?: string
  }) {
    if (activeMusicGen) return
    setActiveMusicGen(true)

    const initialTitle = params.customTitle || '正在创作中…'

    const musicMsgId = `music-${Date.now()}`
    appendMessage({
      id: musicMsgId,
      role: 'assistant',
      type: 'music',
      timestamp: nowTimestamp(),
      music: {
        id: musicMsgId,
        title: initialTitle,
        cover: defaultMusicCover,
        isGenerating: true,
        status: '正在提交音乐生成任务',
        style: 'AI生成',
        mood: params.musicType === 'song' ? '歌曲' : '纯音乐'
      }
    })

    try {
      const result: MusicGenerationResult = await generateEmotionMusic({
        emotion: params.emotion,
        userText: params.userText,
        musicType: params.musicType,
        styleHint: params.styleHint,
        musicTitle: params.customTitle,
        onProgress: status => updateMusicMessage(musicMsgId, { status })
      })

      const finalTitle = params.customTitle || result.title || '未命名'
      const finalLyrics = result.lyrics || ''

      updateMusicMessage(musicMsgId, {
        title: finalTitle,
        url: result.musicUrl,
        lyrics: finalLyrics,
        creator: currentUser.name,
        isGenerating: false,
        status: result.musicUrl ? '已生成，可以播放了' : '生成完成，但没有音频地址',
        error: result.error
      })

      // 把生成完成的音乐推到全局 MiniPlayer
      // 行为规则：如果当前有别的音乐正在播放，则不打断，只静默写入卡片；用户主动点才播
      if (result.musicUrl) {
        // 预热：立即在 <head> 插一条 preload link，让浏览器提前下载 mp3
        try {
          const preload = document.createElement('link')
          preload.rel = 'preload'
          preload.as = 'audio'
          preload.href = result.musicUrl
          document.head.appendChild(preload)
        } catch {}
        const trackPayload = {
          id: musicMsgId,
          title: finalTitle,
          cover: defaultMusicCover,
          artist: 'Echoes AI',
          url: result.musicUrl,
          lyrics: finalLyrics,
          creator: currentUser.name,
          mood: params.emotion,
        }
        const hasActiveAudio = Boolean(nowPlaying?.url) && isPlaying
        if (hasActiveAudio) {
          // 不打断：只更新音乐卡片本身，MiniPlayer 维持当前歌
          // 用户可以在音乐卡片里点播放按钮切换
        } else {
          setNowPlaying(trackPayload)
        }
      }
    } catch (err) {
      updateMusicMessage(musicMsgId, {
        isGenerating: false,
        status: '生成失败，可以换一种描述再试',
        error: err instanceof Error ? err.message : '生成失败'
      })
    } finally {
      setActiveMusicGen(false)
    }
  }

  async function handleAIResponse(apiMessages: ChatMessage[]) {
    setIsTyping(true)
    try {
      const result = await sendChatMessage(apiMessages)
      appendMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        type: 'text',
        content: result.reply,
        timestamp: nowTimestamp()
      })

      if (result.readyToGenerate && result.musicType && !activeMusicGen) {
        // 弹一张精简的命名卡片让用户决定（默认建议名 = 千问的 musicTitle）
        setTimeout(() => {
          appendMessage({
            id: `naming-${Date.now()}`,
            role: 'assistant',
            type: 'naming',
            timestamp: nowTimestamp(),
            naming: {
              emotion: result.emotion || 'calm',
              userText: collectedTextRef.current,
              musicType: result.musicType || 'song',
              styleHint: result.styleHint || '',
              aiTitle: result.musicTitle || '',
              status: 'choosing'
            }
          })
        }, 500)
      }
    } catch (err) {
      console.error('Chat error:', err)
      const tip = err instanceof Error && err.message.includes('慢')
        ? '刚刚网络有点慢，没收到回复。再发一次试试？'
        : '这里刚刚有点卡住了，再发一次试试？'
      appendMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        type: 'text',
        content: tip,
        timestamp: nowTimestamp()
      })
    } finally {
      setIsTyping(false)
    }
  }

  async function handleSend(text?: string) {
    const value = (text ?? inputValue).trim()
    if (!value || isTyping) return

    setInputValue('')
    // 发送后换一批建议
    setSuggestions(pickRandomSuggestions(5))

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'text',
      content: value,
      timestamp: nowTimestamp()
    }
    appendMessage(userMsg)

    collectedTextRef.current = [collectedTextRef.current, value].filter(Boolean).join('\n')

    const apiMessages = toApiMessages(messages, value)
    await handleAIResponse(apiMessages)
  }

  const handleEmotionClick = (emotion: typeof emotionTags[0]) => {
    handleSend(`我现在感觉${emotion.label}，${emotion.emoji}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-md mx-auto px-5 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-display font-bold text-ink-900 leading-none tracking-tight">
              创作
            </h1>
            <p className="text-[13px] text-ink-500 mt-1.5">和 Echo 聊聊，把心情变成一首歌</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press relative"
            aria-label="历史"
          >
            <Clock className="w-4 h-4" />
            {showHistory && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-tinder-flame" />
            )}
          </button>
        </div>
      </header>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white border-b border-ink-100 animate-slide-down">
          <div className="max-w-md mx-auto px-5 py-3 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink-900">创作历史</h3>
            <button onClick={() => setShowHistory(false)} className="p-1 text-ink-500 hover:text-ink-900">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="px-5 pb-3 text-[12px] text-ink-500">历史记录将在登录后同步。</p>
        </div>
      )}

      {/* 心情标签 - chip 风格 */}
      <div className="max-w-md mx-auto px-5 py-2 w-full">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {emotionTags.map(emotion => (
            <button
              key={emotion.id}
              onClick={() => handleEmotionClick(emotion)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-white border border-ink-100 text-[12px] font-medium text-ink-900 hover:border-ink-300 btn-press transition-colors"
            >
              <span>{emotion.emoji}</span>
              <span>{emotion.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <main
        className="flex-1 overflow-y-auto px-5 py-4 transition-[padding] duration-300"
        style={{ paddingBottom: nowPlaying ? '290px' : '220px' }}
      >
        <div className="max-w-md mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.role === 'assistant' ? (
                  <EchoAvatar size={36} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center">
                    <span className="text-ink-500 text-[12px] font-semibold">
                      {currentUser.name?.slice(0, 1) || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} flex-1 max-w-[78%]`}>
                {message.role === 'assistant' && (
                  <p className="text-[11px] font-semibold text-ink-500 mb-1 ml-0.5">Echo</p>
                )}
                {message.type === 'music' && message.music ? (
                  <div className="rounded-card overflow-hidden bg-white border border-ink-100">
                    {/* 大封面 */}
                    <div className="relative aspect-[4/5] bg-ink-100">
                      <img
                        src={message.music.cover || defaultMusicCover}
                        alt={message.music.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 photo-overlay" />
                      {message.music.isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="flex items-end gap-1 h-10">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className="w-2 bg-white rounded-full music-wave"
                                style={{ height: `${10 + i * 4}px`, animationDelay: `${i * 80}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {/* 状态 chip */}
                      <div className="absolute top-3 left-3">
                        <span className="chip-dark">
                          <Sparkles className="w-3 h-3" />
                          {message.music.isGenerating ? 'AI 正在创作' : 'AI 创作'}
                        </span>
                      </div>
                      {/* 底部标题 */}
                      <div className="absolute left-4 right-4 bottom-4">
                        <h3 className="font-display font-bold text-2xl text-white tracking-tight leading-tight">
                          {message.music.title}
                        </h3>
                        {message.music.status && (
                          <p className="text-[12px] text-white/70 mt-1.5">{message.music.status}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {message.music.style && (
                            <span className="chip-dark">{message.music.style}</span>
                          )}
                          {message.music.mood && (
                            <span className="chip-dark">{message.music.mood}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 操作栏 */}
                    <div className="bg-white p-3">
                      {message.music.url ? (() => {
                        const m = message.music!
                        const isCurrent = nowPlaying?.id === m.id
                        const showPause = isCurrent && isPlaying
                        const liked = isCapsuled(m.id)
                        return (
                          <div className="flex items-center gap-2">
                            {/* 播放 */}
                            <button
                              onClick={() => {
                                if (isCurrent) {
                                  togglePlay()
                                } else {
                                  setNowPlaying({
                                    id: m.id,
                                    title: m.title,
                                    cover: m.cover,
                                    artist: 'Echoes AI',
                                    url: m.url,
                                    lyrics: m.lyrics,
                                    creator: m.creator || currentUser.name,
                                    mood: m.mood,
                                  })
                                }
                              }}
                              aria-label={showPause ? '暂停' : '播放'}
                              className="w-11 h-11 rounded-full bg-echo-green text-ink-900 flex items-center justify-center btn-press flex-shrink-0"
                            >
                              {showPause
                                ? <Pause className="w-4 h-4" fill="currentColor" strokeWidth={0} />
                                : <Play className="w-4 h-4 ml-0.5" fill="currentColor" strokeWidth={0} />}
                            </button>
                            {/* 详情 */}
                            <button
                              onClick={() => {
                                setNowPlaying({
                                  id: m.id,
                                  title: m.title,
                                  cover: m.cover,
                                  artist: 'Echoes AI',
                                  url: m.url,
                                  lyrics: m.lyrics,
                                  creator: m.creator || currentUser.name,
                                  mood: m.mood,
                                })
                                openFullPlayer()
                              }}
                              className="flex-1 h-11 rounded-pill bg-ink-50 text-ink-900 text-[13px] font-semibold flex items-center justify-center gap-1.5 btn-press hover:bg-ink-100"
                            >
                              <Music2 className="w-4 h-4" />
                              打开详情
                            </button>
                            {/* 心 */}
                            <button
                              onClick={() => {
                                // 取最近一条用户消息作为情境短句
                                const lastUserMsg = [...messages].reverse().find(msg => msg.role === 'user' && msg.type === 'text')
                                const moment = lastUserMsg?.content
                                  ? lastUserMsg.content.slice(0, 24) + (lastUserMsg.content.length > 24 ? '…' : '')
                                  : undefined
                                toggleCapsule({
                                  id: m.id,
                                  title: m.title,
                                  cover: m.cover,
                                  duration: m.duration,
                                  url: m.url,
                                  mood: m.mood,
                                  moment,
                                  styleTag: m.style,
                                  createdAt: new Date().toISOString().slice(0, 10),
                                  plays: 0,
                                  source: 'created',
                                  creator: m.creator || currentUser.name,
                                  lyrics: m.lyrics,
                                })
                              }}
                              aria-label={liked ? '已收入胶囊' : '收入胶囊'}
                              className={`w-11 h-11 rounded-full flex items-center justify-center btn-press transition-colors ${
                                liked ? 'bg-tinder-flame/10 text-tinder-flame' : 'bg-ink-50 text-ink-500 hover:text-tinder-flame'
                              }`}
                            >
                              <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
                            </button>
                            {/* 下载 */}
                            <a
                              href={m.url}
                              download
                              aria-label="下载"
                              className="w-11 h-11 rounded-full bg-ink-50 text-ink-500 hover:text-ink-900 flex items-center justify-center btn-press"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )
                      })() : (
                        <p className="text-[12px] text-ink-500 text-center py-2">
                          {message.music.status || '正在创作…'}
                        </p>
                      )}
                    </div>
                  </div>
                ) : message.type === 'naming' && message.naming ? (
                  <NamingCard
                    messageId={message.id}
                    naming={message.naming}
                    onChoose={handleNamingChoose}
                    onSubmit={handleNamingSubmit}
                  />
                ) : (
                  <div className={`rounded-2xl px-4 py-2.5 ${message.role === 'user'
                    ? 'bg-echo-green text-white rounded-tr-md'
                    : 'bg-ink-50 text-ink-900 rounded-tl-md'
                  }`}>
                    <p className={`text-[14.5px] leading-relaxed whitespace-pre-line ${message.role === 'user' ? 'text-white' : 'text-ink-900'}`}>
                      {message.content}
                    </p>
                    {message.role === 'assistant' && extractStyleOptions(message.content || '').length > 0 && (() => {
                      const isLastAI = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.id === message.id
                      if (!isLastAI) return null
                      return (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {extractStyleOptions(message.content || '').map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleSend(opt)}
                              disabled={isTyping}
                              className="px-3 py-1.5 rounded-pill bg-white border border-ink-100 text-ink-900 text-[12px] font-medium hover:border-ink-300 transition-colors disabled:opacity-50"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}
                <p className="text-[11px] text-ink-300 mt-1 px-1">{message.timestamp}</p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-slide-up">
              <EchoAvatar size={36} />
              <div className="flex flex-col items-start flex-1 max-w-[78%]">
                <p className="text-[11px] font-semibold text-ink-500 mb-1 ml-0.5">Echo</p>
                <div className="bg-ink-50 rounded-2xl rounded-tl-md px-4 py-3 inline-flex items-center gap-1.5">
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-ink-500 music-wave"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area: 在 BottomNav(64px) 上方，MiniPlayer 显示时再往上推 72px */}
      <div className="fixed left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-white/60 z-20 transition-[bottom] duration-300"
        style={{ bottom: nowPlaying ? 'calc(64px + 72px)' : '64px' }}>
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-500 hover:text-ink-900 btn-press">
              <Mic className="w-4 h-4" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="说说你的心情，或者想要的风格…"
                disabled={isTyping}
                className="w-full bg-ink-50 rounded-pill px-4 py-2.5 text-[14px] outline-none focus:bg-white focus:ring-1 focus:ring-ink-900 transition-all placeholder:text-ink-300 disabled:opacity-60"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              aria-label="发送"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 btn-press ${
                inputValue.trim() && !isTyping
                  ? 'bg-tinder-flame text-white shadow-flame'
                  : 'bg-ink-100 text-ink-300'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5 scrollbar-hide items-center">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={isTyping}
                className="flex-shrink-0 px-3 py-1.5 rounded-pill bg-ink-50 text-[12px] text-ink-900 hover:bg-ink-100 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setSuggestions(pickRandomSuggestions(5))}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-50 text-[12px] text-ink-500 hover:bg-ink-100 transition-colors flex items-center justify-center"
              title="换一批"
            >
              ⟳
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
