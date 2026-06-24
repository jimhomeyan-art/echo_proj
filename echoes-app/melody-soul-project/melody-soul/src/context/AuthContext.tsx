import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { registerUser, loginUser, fetchMe, type AuthUser } from '../services/auth'
import { disconnectSocket } from '../services/im'

const TOKEN_KEY = 'echoes_token'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, nickname?: string) => Promise<void>
  logout: () => void
  updateUser: (u: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  // 启动时用已存的 token 校验登录态
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (!saved) {
      setLoading(false)
      return
    }
    fetchMe(saved)
      .then(u => {
        setUser(u)
        setToken(saved)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const applyAuth = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
    setUser(u)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { token: t, user: u } = await loginUser(username, password)
    applyAuth(t, u)
  }, [applyAuth])

  const register = useCallback(async (username: string, password: string, nickname?: string) => {
    const { token: t, user: u } = await registerUser(username, password, nickname)
    applyAuth(t, u)
  }, [applyAuth])

  const logout = useCallback(() => {
    disconnectSocket()
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((u: AuthUser) => {
    setUser(u)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
