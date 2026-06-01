import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, type ChatMessage } from '../services/chat'
import { generateEmotionMusic, buildDisplayMusicTitle, type MusicGenerationResult } from '../services/music'
import { useChat, type PersistedChatMessage } from '../context/ChatContext'
import './ChatDialog.css'

type Message = PersistedChatMessage

interface Props {
  initialText?: string
  onClose: () => void
}

function toApiMessages(messages: Message[], nextUserText?: string): ChatMessage[] {
  const history = messages
    .filter(m => !m.music)
    .map(m => ({
      role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
      content: m.text
    }))
  return nextUserText
    ? [...history, { role: 'user' as const, content: nextUserText }].slice(-20)
    : history.slice(-20)
}

function inferFallbackMusicType(text: string): 'instrumental' | 'song' | null {
  if (/歌词|歌曲|唱|人声|歌声|song/.test(text)) return 'song'
  if (/纯音乐|无歌词|伴奏|BGM|bgm|配乐/.test(text)) return 'instrumental'
  return null
}

function createMessageId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export default function ChatDialog({ initialText = '', onClose }: Props) {
  const chat = useChat()
  const trimmedInitialText = initialText.trim()
  const { messages, setMessages } = chat
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(Boolean(trimmedInitialText && messages.length <= 1))
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initialStarted = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!isTyping) inputRef.current?.focus()
  }, [isTyping])

  useEffect(() => {
    if (!trimmedInitialText || initialStarted.current || messages.length > 1) return
    initialStarted.current = true
    handleAIResponse([{ role: 'user', content: trimmedInitialText }], trimmedInitialText)
  }, [])

  function appendAI(text: string) {
    setMessages(prev => [...prev, { id: createMessageId('a'), role: 'ai', text }])
  }

  function appendUser(text: string) {
    setMessages(prev => [...prev, { id: createMessageId('u'), role: 'user', text }])
  }

  function updateMusicMessage(id: string, patch: Partial<NonNullable<Message['music']>>) {
    setMessages(prev => prev.map(msg => (
      msg.id === id && msg.music ? { ...msg, music: { ...msg.music, ...patch } } : msg
    )))
  }

  async function generateMusicInsideChat(params: {
    emotion: string
    userText: string
    musicType: 'instrumental' | 'song'
    styleHint: string
    musicTitle?: string
  }) {
    const title = params.musicTitle || buildDisplayMusicTitle(params.emotion, params.musicType, params.userText + params.styleHint)
    const signature = `${params.musicType}|${params.styleHint}|${params.userText.slice(-120)}`

    if (chat.activeMusicGeneration || chat.lastGeneratedSignature === signature) {
      setMessages(prev => [...prev, {
        id: createMessageId('a'),
        role: 'ai',
        text: '这首已经在生成了，我先不重复提交。你可以继续和我聊，音乐好了会出现在这里。'
      }])
      return
    }

    chat.setActiveMusicGeneration(true)
    chat.setLastGeneratedSignature(signature)

    const musicMsgId = createMessageId('music')

    setMessages(prev => [...prev, {
      id: musicMsgId,
      role: 'ai',
      text: '我开始为你生成这段声音。你可以继续和我说话，音乐好了我会放在这里。',
      music: {
        title,
        isGenerating: true,
        status: '正在提交音乐生成任务...'
      }
    }])

    try {
      const result: MusicGenerationResult = await generateEmotionMusic({
        emotion: params.emotion,
        userText: params.userText,
        musicType: params.musicType,
        styleHint: params.styleHint,
        onProgress: status => updateMusicMessage(musicMsgId, { status })
      })

      updateMusicMessage(musicMsgId, {
        title,
        url: result.musicUrl,
        isGenerating: false,
        status: result.musicUrl ? '已生成，可以播放了' : '生成完成，但没有拿到音频地址',
        error: result.error
      })
    } catch (error) {
      updateMusicMessage(musicMsgId, {
        isGenerating: false,
        status: '生成失败，可以换一种描述再试',
        error: error instanceof Error ? error.message : '生成失败'
      })
    } finally {
      chat.setActiveMusicGeneration(false)
    }
  }

  async function handleAIResponse(apiMessages: ChatMessage[], nextCollectedText: string) {
    setIsTyping(true)
    try {
      const result = await sendChatMessage(apiMessages)
      appendAI(result.reply)

      if (result.readyToGenerate && result.musicType && !chat.activeMusicGeneration) {
        const nextSignature = `${result.musicType}|${result.styleHint || ''}|${nextCollectedText.slice(-120)}`
        if (chat.lastGeneratedSignature === nextSignature) return
        setTimeout(() => {
          generateMusicInsideChat({
            emotion: result.emotion || 'calm',
            userText: nextCollectedText,
            musicType: result.musicType || 'instrumental',
            styleHint: result.styleHint || '',
            musicTitle: result.musicTitle || ''
          })
        }, 800)
      }
    } catch (error) {
      console.error('Chat error:', error)
      appendAI('这里刚刚有点卡住了。但我还在，你可以换一句说，或者直接告诉我想要纯音乐还是有歌词的歌。')
    } finally {
      setIsTyping(false)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isTyping) return

    setInput('')
    appendUser(text)

    const nextCollectedText = [chat.collectedUserText, text].filter(Boolean).join('\n')
    chat.setCollectedUserText(nextCollectedText)

    const fallbackType = inferFallbackMusicType(text)
    if (fallbackType && /生成|开始|就这个|可以|好|行/.test(text) && chat.collectedUserText) {
      await generateMusicInsideChat({
        emotion: 'calm',
        userText: nextCollectedText,
        musicType: fallbackType,
        styleHint: fallbackType === 'song'
          ? 'gentle healing vocal, intimate, warm, emotional'
          : 'soft cinematic ambient, gentle piano, warm, healing',
        musicTitle: fallbackType === 'song' ? '未说出口的歌' : '安静回响'
      })
      return
    }

    const apiMessages = toApiMessages(messages, text)
    await handleAIResponse(apiMessages, nextCollectedText)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="chat-dialog">
        <div className="chat-header">
          <div className="chat-avatar">
            <div className="avatar-ring"></div>
            <span className="avatar-icon">✦</span>
          </div>
          <div className="chat-meta">
            <span className="chat-name">Echo</span>
            <span className="chat-sub">AI 情绪音乐向导</span>
          </div>
          <button className="chat-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chat-body">
          {messages.map(msg => (
            <div key={msg.id} className={`msg-row ${msg.role}`}>
              {msg.role === 'ai' && <span className="msg-avatar">✦</span>}
              <div className="msg-content">
                {msg.text && <div className="msg-bubble">{msg.text}</div>}
                {msg.music && (
                  <div className="music-card">
                    <div className="music-art">
                      <span>{msg.music.isGenerating ? '…' : '♪'}</span>
                    </div>
                    <div className="music-info">
                      <span className="music-title">{msg.music.title}</span>
                      <span className="music-status">{msg.music.status}</span>
                      {msg.music.url && (
                        <audio className="chat-audio" controls src={msg.music.url} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="msg-row ai">
              <span className="msg-avatar">✦</span>
              <div className="msg-content">
                <div className="msg-bubble typing"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-footer visible">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="继续聊，或告诉 Echo：纯音乐 / 有歌词的歌 / 想要什么风格……"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            maxLength={500}
            disabled={isTyping}
          />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim() || isTyping}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
