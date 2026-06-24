import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      if (isRegister) {
        await register(username.trim(), password, nickname.trim() || undefined)
      } else {
        await login(username.trim(), password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F3F5] flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-echo-green/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-echo-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Logo / 标语 */}
        <div className="mb-10 text-center">
          <h1 className="text-[40px] font-display font-bold text-ink-900 leading-none tracking-tight">
            Echoes
          </h1>
          <p className="text-[14px] text-ink-500 mt-3">给你的情绪配一首歌</p>
        </div>

        {/* 切换 登录/注册 */}
        <div className="flex bg-ink-50 rounded-pill p-1 mb-6">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2.5 rounded-pill text-[14px] font-semibold transition-all ${
                mode === m ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
              }`}
            >
              {m === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="用户名（字母/数字/下划线，≥3位）"
            autoComplete="username"
            className="w-full px-4 py-3.5 bg-white rounded-card text-[15px] text-ink-900 placeholder:text-ink-300 border border-ink-100 focus:ring-1 focus:ring-ink-900 outline-none transition-all"
          />
          {isRegister && (
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="昵称（选填，默认用用户名）"
              className="w-full px-4 py-3.5 bg-white rounded-card text-[15px] text-ink-900 placeholder:text-ink-300 border border-ink-100 focus:ring-1 focus:ring-ink-900 outline-none transition-all"
            />
          )}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="密码（≥6位）"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            className="w-full px-4 py-3.5 bg-white rounded-card text-[15px] text-ink-900 placeholder:text-ink-300 border border-ink-100 focus:ring-1 focus:ring-ink-900 outline-none transition-all"
          />

          {error && (
            <p className="text-[13px] text-tinder-flame px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            className="w-full py-3.5 rounded-pill bg-echo-green text-ink-900 text-[15px] font-semibold shadow-flame btn-press disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? '注册并进入' : '登录'}
          </button>
        </form>

        <p className="text-center text-[12px] text-ink-300 mt-8">
          {isRegister ? '注册即代表同意用户协议' : '用音乐连接彼此的情绪'}
        </p>
      </div>
    </div>
  )
}
