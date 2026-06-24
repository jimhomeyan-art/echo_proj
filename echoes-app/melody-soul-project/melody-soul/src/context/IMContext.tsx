import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import {
  getSocket, listConversations,
  type Conversation, type IMMessage
} from '../services/im'
import type { AuthUser } from '../services/auth'

interface IMContextValue {
  conversations: Conversation[]
  unread: Record<number, number>
  totalUnread: number
  refresh: () => Promise<void>
  setActiveUser: (id: number | null) => void
  markRead: (userId: number) => void
  // 本地（自己发出/收到）后更新某会话预览并置顶
  bump: (userId: number, message: IMMessage, fromMe: boolean) => void
}

const IMContext = createContext<IMContextValue | null>(null)

function previewOf(message: IMMessage) {
  return {
    type: message.type,
    content: message.type === 'music' ? '[音乐]' : (typeof message.content === 'string' ? message.content : ''),
    senderId: message.senderId,
    createdAt: message.createdAt
  }
}

export function IMProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unread, setUnread] = useState<Record<number, number>>({})
  const activeUserRef = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    try { setConversations(await listConversations()) } catch { /* ignore */ }
  }, [])

  const setActiveUser = useCallback((id: number | null) => {
    activeUserRef.current = id
    if (id != null) setUnread(prev => (prev[id] ? { ...prev, [id]: 0 } : prev))
  }, [])

  const markRead = useCallback((userId: number) => {
    setUnread(prev => (prev[userId] ? { ...prev, [userId]: 0 } : prev))
  }, [])

  // 更新会话预览 + 置顶；必要时补拉用户信息
  const bump = useCallback((userId: number, message: IMMessage, fromMe: boolean) => {
    setConversations(prev => {
      const idx = prev.findIndex(c => c.user.id === userId)
      if (idx === -1) {
        // 新会话：列表里还没有 → 拉一次
        refresh()
        return prev
      }
      const conv = { ...prev[idx], updatedAt: message.createdAt, lastMessage: previewOf(message) }
      const next = [conv, ...prev.slice(0, idx), ...prev.slice(idx + 1)]
      return next
    })
    if (!fromMe && activeUserRef.current !== userId) {
      setUnread(prev => ({ ...prev, [userId]: (prev[userId] || 0) + 1 }))
    }
  }, [refresh])

  // 登录后连接 socket + 拉会话；全局监听新消息
  useEffect(() => {
    refresh()
    const socket = getSocket()
    const onNew = (payload: { from: number; message: IMMessage }) => {
      bump(payload.from, payload.message, false)
    }
    socket.on('message:new', onNew)
    return () => { socket.off('message:new', onNew) }
  }, [refresh, bump])

  const totalUnread = Object.values(unread).reduce((s, n) => s + n, 0)

  return (
    <IMContext.Provider value={{ conversations, unread, totalUnread, refresh, setActiveUser, markRead, bump }}>
      {children}
    </IMContext.Provider>
  )
}

export function useIM() {
  const ctx = useContext(IMContext)
  if (!ctx) throw new Error('useIM must be used within IMProvider')
  return ctx
}

export type { Conversation, IMMessage, AuthUser }
