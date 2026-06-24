import { io, Socket } from 'socket.io-client'
import { config } from '../config/env'
import type { AuthUser } from './auth'

const TOKEN_KEY = 'echoes_token'

export interface IMMessage {
  id: number
  conversationId: number
  senderId: number
  type: 'text' | 'music'
  content: any
  createdAt: number
}

export interface Conversation {
  conversationId: number
  updatedAt: number
  user: AuthUser
  lastMessage: { type: string; content: string; senderId: number; createdAt: number } | null
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(init?.headers || {}) }
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.error || '请求失败')
  return data.data as T
}

export function listConversations() {
  return request<Conversation[]>('/conversations')
}

export function getMessages(friendId: number) {
  return request<{ conversationId: number; messages: IMMessage[] }>(`/conversations/${friendId}/messages`)
}

// ── socket 单例 ──
let socket: Socket | null = null

export function getSocket(): Socket {
  if (socket) return socket
  socket = io('/', {
    path: '/socket.io',
    auth: { token: localStorage.getItem(TOKEN_KEY) || '' },
    transports: ['websocket', 'polling']
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// 发送消息（带 ack）
export function sendMessage(toUserId: number, type: 'text' | 'music', content: any): Promise<IMMessage> {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    s.emit('message:send', { toUserId, type, content }, (resp: any) => {
      if (resp?.success) resolve(resp.message as IMMessage)
      else reject(new Error(resp?.error || '发送失败'))
    })
  })
}

// ── 情绪匹配 ──
export interface MatchResult {
  matched: boolean
  partner?: AuthUser
  emotion?: string
}

export function joinMatch(emotion: string): Promise<MatchResult> {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    s.emit('match:join', { emotion }, (resp: any) => {
      if (resp?.success) resolve({ matched: resp.matched, partner: resp.partner, emotion: resp.emotion })
      else reject(new Error(resp?.error || '匹配失败'))
    })
  })
}

export function cancelMatch(): Promise<void> {
  return new Promise((resolve) => {
    const s = getSocket()
    s.emit('match:cancel', {}, () => resolve())
  })
}

// 监听被动匹配成功（对方先入队，我后入队触发）
export function onMatchFound(cb: (data: { partner: AuthUser; emotion: string }) => void): () => void {
  const s = getSocket()
  s.on('match:found', cb)
  return () => { s.off('match:found', cb) }
}
