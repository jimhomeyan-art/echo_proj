import { config } from '../config/env'
import type { AuthUser } from './auth'

const TOKEN_KEY = 'echoes_token'

export interface FeedMusic {
  id: string
  title: string
  cover?: string
  url?: string
  mood?: string
  duration?: string
}

export interface FeedPost {
  id: number
  user: AuthUser
  music: FeedMusic | null
  caption: string
  createdAt: number
  likes: number
  comments: number
  shares: number
  isLiked: boolean
}

export interface PostComment {
  id: number
  user: AuthUser
  content: string
  createdAt: number
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

export function createPost(music: FeedMusic, caption: string) {
  return request<FeedPost>('/posts', {
    method: 'POST',
    body: JSON.stringify({ music, caption })
  })
}

export function listFeed(scope: 'friends' | 'global') {
  return request<FeedPost[]>(`/posts?scope=${scope}`)
}

export function toggleLike(postId: number) {
  return request<{ liked: boolean; likes: number }>(`/posts/${postId}/like`, { method: 'POST' })
}

export function listComments(postId: number) {
  return request<PostComment[]>(`/posts/${postId}/comments`)
}

export function addComment(postId: number, content: string) {
  return request<PostComment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  })
}

export function sharePost(postId: number) {
  return request<{ shares: number }>(`/posts/${postId}/share`, { method: 'POST' })
}
