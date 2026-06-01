import { createContext, useCallback, useContext, useState, ReactNode } from 'react'

type ChatMessageRole = 'ai' | 'user'

export interface PersistedChatMessage {
  id: string
  role: ChatMessageRole
  text: string
  music?: {
    title: string
    url?: string
    isGenerating?: boolean
    status?: string
    error?: string
  }
}

interface ChatState {
  isOpen: boolean
  initialText: string
  sessionId: number
  messages: PersistedChatMessage[]
  collectedUserText: string
  activeMusicGeneration: boolean
  lastGeneratedSignature: string
}

interface ChatContextValue extends ChatState {
  openChat: (initialText?: string) => void
  closeChat: () => void
  setMessages: React.Dispatch<React.SetStateAction<PersistedChatMessage[]>>
  setCollectedUserText: React.Dispatch<React.SetStateAction<string>>
  setActiveMusicGeneration: React.Dispatch<React.SetStateAction<boolean>>
  setLastGeneratedSignature: React.Dispatch<React.SetStateAction<string>>
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialText, setInitialText] = useState('')
  const [sessionId, setSessionId] = useState(0)
  const [messages, setMessages] = useState<PersistedChatMessage[]>([])
  const [collectedUserText, setCollectedUserText] = useState('')
  const [activeMusicGeneration, setActiveMusicGeneration] = useState(false)
  const [lastGeneratedSignature, setLastGeneratedSignature] = useState('')

  const openChat = useCallback((text = '') => {
    const trimmed = text.trim()
    setIsOpen(true)

    setMessages(prev => {
      if (prev.length > 0) return prev
      setInitialText(trimmed)
      setCollectedUserText(trimmed)
      setSessionId(id => id + 1)
      return trimmed
        ? [{ id: 'initial_user', role: 'user', text: trimmed }]
        : [{ id: 'initial_ai', role: 'ai', text: '我在。先不用整理语言，说一点点也可以。' }]
    })
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <ChatContext.Provider value={{
      isOpen,
      initialText,
      sessionId,
      messages,
      collectedUserText,
      activeMusicGeneration,
      lastGeneratedSignature,
      openChat,
      closeChat,
      setMessages,
      setCollectedUserText,
      setActiveMusicGeneration,
      setLastGeneratedSignature
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
