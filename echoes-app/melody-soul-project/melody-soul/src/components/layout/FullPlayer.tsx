import React, { useEffect } from 'react'
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Heart, Share2, Download, MoreVertical } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { EchoAvatar } from '../common/EchoAvatar'
import { ProgressBar } from '../common/ProgressBar'

export const FullPlayer: React.FC = () => {
  const {
    isFullPlayerOpen, closeFullPlayer, nowPlaying, isPlaying, togglePlay, audioRef,
    currentTime, duration, seek, isBuffering,
    isCapsuled, toggleCapsule,
  } = useChat()

  useEffect(() => {
    if (isFullPlayerOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = original }
    }
  }, [isFullPlayerOpen])

  useEffect(() => {
    if (!isFullPlayerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullPlayer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullPlayerOpen, closeFullPlayer])

  if (!isFullPlayerOpen || !nowPlaying) return null

  const lyricsLines = (nowPlaying.lyrics || '').split('\n')
  const hasLyrics = lyricsLines.some(l => l.trim())
  const liked = isCapsuled(nowPlaying.id)

  return (
    <div className="fixed inset-0 z-[100] bg-ink-900 animate-slide-up">
      {/* 模糊封面背景 */}
      {nowPlaying.cover && (
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <img src={nowPlaying.cover} alt="" className="w-full h-full object-cover blur-3xl scale-125" />
          <div className="absolute inset-0 bg-ink-900/70" />
        </div>
      )}
      {/* 绿色环境光 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(30,215,96,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[380px] h-[380px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(155,242,133,0.10) 0%, transparent 70%)' }} />
      </div>

      <div className="relative h-full flex flex-col max-w-md mx-auto text-white">

        {/* ── Header ── */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 pb-2"
          style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top, 1.5rem))' }}
        >
          <button
            onClick={closeFullPlayer}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press"
            aria-label="关闭"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] flex-1 text-center px-2">正在播放</p>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press">
            <MoreVertical className="w-5 h-5" />
          </button>
        </header>

        {/* ── 封面缩略图 + 标题横排 ── */}
        <div className="flex-shrink-0 flex items-center gap-4 px-4 py-3">
          {/* 小封面 */}
          <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-ink-700 shadow-pop">
            {nowPlaying.cover
              ? <img src={nowPlaying.cover} alt={nowPlaying.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><EchoAvatar size={48} /></div>
            }
          </div>
          {/* 标题 + 艺人 */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-display font-bold tracking-tight truncate leading-tight">
              {nowPlaying.title}
            </h2>
            <p className="text-[12px] text-white/55 mt-0.5 truncate">
              {nowPlaying.creator || nowPlaying.artist || 'Echoes AI'}
              {nowPlaying.mood && <span className="ml-1.5 text-white/35">· 「{nowPlaying.mood}」</span>}
            </p>
          </div>
          {/* 收藏按钮 */}
          <button
            onClick={() => toggleCapsule({
              id: nowPlaying.id,
              title: nowPlaying.title,
              cover: nowPlaying.cover,
              url: nowPlaying.url,
              mood: nowPlaying.mood,
              moment: nowPlaying.mood ? `一段「${nowPlaying.mood}」的心情` : undefined,
              createdAt: new Date().toISOString().slice(0, 10),
              plays: 0,
              source: 'liked',
              creator: nowPlaying.creator,
              lyrics: nowPlaying.lyrics,
            })}
            aria-label={liked ? '从胶囊移除' : '收入胶囊'}
            className={`w-10 h-10 rounded-full flex items-center justify-center btn-press transition-colors flex-shrink-0 ${
              liked ? 'bg-tinder-flame text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* ── 歌词区（占主体空间）── */}
        <div
          className="flex-1 min-h-0 scrollbar-hide"
          style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' as any, touchAction: 'pan-y' }}
        >
          {hasLyrics ? (
            <div className="px-6 space-y-1 pt-2 pb-8 text-center">
              {lyricsLines.map((line, idx) => {
                const trimmed = line.trim()
                if (!trimmed) return <div key={idx} className="h-3" />
                const isSection = /^\[.+\]$/.test(trimmed)
                return (
                  <p key={idx} className={
                    isSection
                      ? 'text-[10px] uppercase tracking-[0.25em] text-tinder-flame mt-5 mb-1 font-semibold'
                      : 'text-[15px] text-white/80 leading-relaxed'
                  }>
                    {trimmed}
                  </p>
                )
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-white/30 text-sm px-8 text-center">
              {!nowPlaying.url
                ? <>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    </div>
                    <p>歌词正在生成…</p>
                  </>
                : <p>这是一段纯音乐，没有歌词。</p>
              }
            </div>
          )}
        </div>

        {/* ── 控件区 ── */}
        <div
          className="flex-shrink-0 px-5 pt-3"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
        >
          <ProgressBar variant="full" currentTime={currentTime} duration={duration} onSeek={seek} className="mb-4" />

          <div className="flex items-center justify-center gap-10">
            <button
              onClick={() => audioRef.current && (audioRef.current.currentTime = 0)}
              aria-label="上一曲"
              className="text-white/70 hover:text-white btn-press"
            >
              <SkipBack className="w-7 h-7" fill="currentColor" strokeWidth={0} />
            </button>
            <button
              onClick={() => { if (!isBuffering) togglePlay() }}
              disabled={!nowPlaying.url}
              aria-label={isBuffering ? '缓冲中' : isPlaying ? '暂停' : '播放'}
              className="w-16 h-16 rounded-full bg-echo-green text-ink-900 flex items-center justify-center shadow-flame btn-press disabled:opacity-40 hover:scale-105 transition-transform"
            >
              {isBuffering
                ? <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                : isPlaying
                  ? <Pause className="w-7 h-7" fill="currentColor" strokeWidth={0} />
                  : <Play className="w-7 h-7 ml-1" fill="currentColor" strokeWidth={0} />
              }
            </button>
            <button aria-label="下一曲" className="text-white/70 hover:text-white btn-press">
              <SkipForward className="w-7 h-7" fill="currentColor" strokeWidth={0} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <button aria-label="分享" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press">
              <Share2 className="w-4 h-4" />
            </button>
            {nowPlaying.url && (
              <a href={nowPlaying.url} download aria-label="下载"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press">
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
