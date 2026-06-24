import { config } from '../config/env'
import type { AuthUser } from './auth'

const TOKEN_KEY = 'echoes_token'

export type Relation = 'none' | 'outgoing' | 'incoming' | 'friends'

export interface SearchResult extends AuthUser {
  relation: Relation
}

export interface FriendRequest {
  requestId: number
  createdAt: number
  user: AuthUser
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {})
    }
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || '请求失败')
  }
  return data.data as T
}

export function searchUsers(q: string) {
  return request<SearchResult[]>(`/friends/search?q=${encodeURIComponent(q)}`)
}

export function listFriends() {
  return request<AuthUser[]>('/friends')
}

export function listRequests() {
  return request<FriendRequest[]>('/friends/requests')
}

export function sendFriendRequest(targetId: number) {
  return request<{ status: Relation }>('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ targetId })
  })
}

export function respondRequest(requestId: number, action: 'accept' | 'reject') {
  return request<{ status: string }>('/friends/respond', {
    method: 'POST',
    body: JSON.stringify({ requestId, action })
  })
}
