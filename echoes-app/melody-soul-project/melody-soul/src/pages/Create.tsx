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
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EchoAvatar size={40} withGlow />
            <div>
              <h1 className="text-lg font-display font-bold text-text-primary">Echo · 情绪音乐</h1>
              <p className="text-xs text-text-secondary">和我聊聊，我帮你做一首歌</p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-xl bg-gray-100 text-text-secondary hover:text-text-primary transition-colors btn-press relative"
          >
            <Clock className="w-5 h-5" />
            {showHistory && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </header>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white border-b border-gray-100 animate-slide-down">
          <div className="max-w-md mx-auto px-5 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">创作历史</h3>
              <button onClick={() => setShowHistory(false)} className="p-1 text-text-secondary hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-text-muted">历史记录将在登录后同步。</div>
          </div>
        </div>
      )}

      {/* Emotion Tags */}
      <div className="max-w-md mx-auto px-5 py-3 w-full">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {emotionTags.map(emotion => (
            <button
              key={emotion.id}
              onClick={() => handleEmotionClick(emotion)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-sm font-medium whitespace-nowrap btn-press hover:shadow-soft transition-all"
              style={{ borderColor: `${emotion.color}40`, borderWidth: 1 }}
            >
              <span>{emotion.emoji}</span>
              <span style={{ color: emotion.color }}>{emotion.label}</span>
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
              {message.role === 'assistant' ? (
                <EchoAvatar size={40} />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
              )}

              {/* Content */}
              <div className={`flex-1 max-w-[78%] ${message.role === 'user' ? 'items-end' : ''}`}>
                {message.type === 'music' && message.music ? (
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        {message.music.isGenerating ? 'AI 正在创作' : 'AI 已为你创作'}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden shadow-soft">
                      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                        <img
                          src={message.music.cover || defaultMusicCover}
                          alt={message.music.title}
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        {message.music.isGenerating ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-end gap-1 h-10">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div
                                  key={i}
                                  className="w-2 bg-white rounded-full music-wave"
                                  style={{ height: `${10 + i * 4}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-primary">
                              <Music2 className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-base text-text-primary">{message.music.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          {message.music.style && (
                            <span className="text-xs text-text-secondary px-2 py-1 rounded-full bg-gray-100">
                              {message.music.style}
                            </span>
                          )}
                          {message.music.mood && (
                            <span className="text-xs text-text-secondary px-2 py-1 rounded-full bg-gray-100">
                              {message.music.mood}
                            </span>
                          )}
                        </div>
                        {message.music.status && (
                          <p className="text-xs text-text-muted mt-3">{message.music.status}</p>
                        )}
                        {message.music.url && (
                          <button
                            onClick={() => {
                              setNowPlaying({
                                id: message.music!.id,
                                title: message.music!.title,
                                cover: message.music!.cover,
                                artist: 'Echoes AI',
                                url: message.music!.url,
                                lyrics: message.music!.lyrics,
                                creator: message.music!.creator || currentUser.name
                              })
                              openFullPlayer()
                            }}
                            className="w-full mt-3 py-2.5 rounded-xl gradient-primary shadow-primary text-white text-sm font-medium flex items-center justify-center gap-2 btn-press"
                          >
                            <Music2 className="w-4 h-4" />
                            打开歌曲详情
                          </button>
                        )}
                        {!message.music.isGenerating && message.music.url && (() => {
                          const m = message.music!
                          const isCurrent = nowPlaying?.id === m.id
                          const showPause = isCurrent && isPlaying
                          const liked = isCapsuled(m.id)
                          return (
                            <div className="mt-3 flex items-center justify-between gap-2">
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
                                className="flex items-center gap-1.5 px-3 py-2 rounded-full gradient-primary shadow-primary text-white text-xs font-medium btn-press"
                              >
                                {showPause
                                  ? <Pause className="w-3.5 h-3.5" fill="white" />
                                  : <Play className="w-3.5 h-3.5 ml-0.5" fill="white" />}
                                {showPause ? '暂停' : '播放'}
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    toggleCapsule({
                                      id: m.id,
                                      title: m.title,
                                      cover: m.cover,
                                      duration: m.duration,
                                      url: m.url,
                                      mood: m.mood,
                                      styleTag: m.style,
                                      createdAt: new Date().toISOString().slice(0, 10),
                                      plays: 0,
                                      source: 'created',
                                      creator: m.creator || currentUser.name,
                                      lyrics: m.lyrics,
                                    })
                                  }}
                                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${liked ? 'text-secondary' : 'text-text-secondary'}`}
                                  title={liked ? '已收入胶囊' : '收入胶囊'}
                                >
                                  <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                  <Share2 className="w-4 h-4 text-text-secondary" />
                                </button>
                                <a
                                  href={m.url}
                                  download
                                  className="p-2 rounded-full gradient-primary shadow-primary"
                                >
                                  <Download className="w-4 h-4 text-white" />
                                </a>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
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
                  <div className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'gradient-primary text-white rounded-tr-sm'
                    : 'bg-white rounded-tl-sm shadow-soft'
                  }`}>
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${message.role === 'user' ? 'text-white' : 'text-text-primary'}`}>
                      {message.content}
                    </p>
                    {message.role === 'assistant' && extractStyleOptions(message.content || '').length > 0 && (() => {
                      const isLastAI = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.id === message.id
                      if (!isLastAI) return null
                      return (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {extractStyleOptions(message.content || '').map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleSend(opt)}
                              disabled={isTyping}
                              className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}
                <p className="text-xs text-text-muted mt-1 px-1">{message.timestamp}</p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-slide-up">
              <EchoAvatar size={40} />
              <div className="flex-1 max-w-[78%]">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-4 shadow-soft inline-flex items-center gap-2">
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60 music-wave"
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
      <div className="fixed left-0 right-0 bg-white border-t border-gray-100 shadow-soft z-20 transition-[bottom] duration-300"
        style={{ bottom: nowPlaying ? 'calc(64px + 72px)' : '64px' }}>
        <div className="max-w-md mx-auto px-5 py-3">
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-full bg-gray-100 text-text-secondary hover:text-primary transition-colors btn-press">
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="说说你的心情，或者想要的风格…"
                disabled={isTyping}
                className="w-full bg-gray-100 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-muted disabled:opacity-60"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className={`p-3 rounded-full gradient-primary shadow-primary transition-all duration-300 btn-press ${inputValue.trim() && !isTyping ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 items-center">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={isTyping}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setSuggestions(pickRandomSuggestions(5))}
              className="flex-shrink-0 px-2 py-1.5 rounded-full bg-primary/10 text-xs text-primary hover:bg-primary/20 transition-colors"
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
