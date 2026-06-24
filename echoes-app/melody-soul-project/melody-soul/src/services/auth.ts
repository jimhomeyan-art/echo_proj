import { config } from '../config/env'

export interface AuthUser {
  id: number
  username: string
  nickname: string
  avatar: string
  bio: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

async function postAuth(path: string, body: Record<string, unknown>): Promise<AuthResponse> {
  const res = await fetch(`${config.apiBaseUrl}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || '请求失败')
  }
  return data.data
}

export function registerUser(username: string, password: string, nickname?: string) {
  return postAuth('register', { username, password, nickname })
}

export function loginUser(username: string, password: string) {
  return postAuth('login', { username, password })
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${config.apiBaseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || '登录已过期')
  }
  return data.data.user
}

export async function updateProfile(
  token: string,
  patch: { nickname?: string; bio?: string; avatar?: string }
): Promise<AuthUser> {
  const res = await fetch(`${config.apiBaseUrl}/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch)
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || '更新失败')
  }
  return data.data.user
}

export async function fetchAvatars(): Promise<string[]> {
  const res = await fetch(`${config.apiBaseUrl}/auth/avatars`)
  const data = await res.json()
  if (!res.ok || !data.success) return []
  return data.data
}
