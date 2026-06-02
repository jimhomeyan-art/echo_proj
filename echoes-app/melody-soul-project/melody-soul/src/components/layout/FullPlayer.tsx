import React, { useEffect } from 'react'
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Heart, Share2, Download, MoreVertical } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { EchoAvatar } from '../common/EchoAvatar'
import { ProgressBar } from '../common/ProgressBar'

/**
 * 全屏歌曲详情 - Tinder 风：黑底 + 大封面 + 干净控件
 */
export const FullPlayer: React.FC = () => {
  const {
    isFullPlayerOpen, closeFullPlayer, nowPlaying, isPlaying, togglePlay, audioRef,
    currentTime, duration, seek,
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
  const liked = isCapsuled(nowPlaying.id)

  return (
    <div className="fixed inset-0 z-[100] bg-ink-900 animate-slide-up overflow-hidden">
      {/* 模糊封面背景 */}
      {nowPlaying.cover && (
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <img
            src={nowPlaying.cover}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-125"
          />
          <div className="absolute inset-0 bg-ink-900/60" />
        </div>
      )}
      {/* 绿色环境光，呼应品牌色 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(30,215,96,0.18) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[380px] h-[380px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(155,242,133,0.12) 0%, transparent 70%)' }} />
      </div>

      <div className="relative h-full flex flex-col max-w-md mx-auto text-white">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-12 pb-3 flex-shrink-0">
          <button
            onClick={closeFullPlayer}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press"
            aria-label="关闭"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 px-2">
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em]">正在播放</p>
            <p className="text-[13px] font-semibold truncate mt-0.5">{nowPlaying.title}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press">
            <MoreVertical className="w-5 h-5" />
          </button>
        </header>

        {/* 大封面 */}
        <div className="px-6 mt-2 flex-shrink-0">
          <div className="aspect-square w-full max-w-[280px] mx-auto rounded-card overflow-hidden shadow-pop relative bg-ink-700">
            {nowPlaying.cover ? (
              <img src={nowPlaying.cover} alt={nowPlaying.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-ink-700 flex items-center justify-center">
                <EchoAvatar size={120} />
              </div>
            )}
          </div>
        </div>

        {/* 标题 + 艺人 */}
        <div className="px-6 mt-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-[24px] font-display font-bold tracking-tight truncate">
                {nowPlaying.title}
              </h2>
              <p className="text-[13px] text-white/60 mt-1 truncate">
                {nowPlaying.creator || nowPlaying.artist || 'Echoes AI'}
                {nowPlaying.mood && (
                  <span className="ml-2 text-white/40">· 「{nowPlaying.mood}」</span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                toggleCapsule({
                  id: nowPlaying.id,
                  title: nowPlaying.title,
                  cover: nowPlaying.cover,
                  url: nowPlaying.url,
                  mood: nowPlaying.mood,
                  createdAt: new Date().toISOString().slice(0, 10),
                  plays: 0,
                  source: 'liked',
                  creator: nowPlaying.creator,
                  lyrics: nowPlaying.lyrics,
                })
              }}
              aria-label={liked ? '从胶囊移除' : '收入胶囊'}
              className={`w-11 h-11 rounded-full flex items-center justify-center btn-press transition-colors ${
                liked ? 'bg-tinder-flame text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* 歌词区 */}
        <div className="flex-1 overflow-y-auto mt-6 scrollbar-hide">
          {lyricsLines.length > 0 && lyricsLines.some(l => l.trim()) ? (
            <div className="px-6 space-y-1 pb-6 text-center">
              {lyricsLines.map((line, idx) => {
                const trimmed = line.trim()
                if (!trimmed) return <div key={idx} className="h-3" />
                const isSection = /^\[.+\]$/.test(trimmed)
                return (
                  <p
                    key={idx}
                    className={
                      isSection
                        ? 'text-[10px] uppercase tracking-[0.25em] text-tinder-flame mt-5 mb-1 font-semibold'
                        : 'text-[15px] text-white/80 leading-relaxed'
                    }
                  >
                    {trimmed}
                  </p>
                )
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40 text-sm">
              {nowPlaying.url ? '这是一段纯音乐，没有歌词。' : '歌词正在生成…'}
            </div>
          )}
        </div>

        {/* 控件区 */}
        <div className="flex-shrink-0 px-6 pb-10 pt-4">
          {/* 进度条 */}
          <ProgressBar
            variant="full"
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            className="mb-5"
          />

          {/* 主控件：上一曲 / 大圆 play / 下一曲 */}
          <div className="flex items-center justify-center gap-10">
            <button
              onClick={() => audioRef.current && (audioRef.current.currentTime = 0)}
              aria-label="上一曲"
              className="text-white/70 hover:text-white btn-press"
            >
              <SkipBack className="w-7 h-7" fill="currentColor" strokeWidth={0} />
            </button>
            <button
              onClick={togglePlay}
              disabled={!nowPlaying.url}
              aria-label={isPlaying ? '暂停' : '播放'}
              className="w-[72px] h-[72px] rounded-full bg-echo-green text-ink-900 flex items-center justify-center shadow-flame btn-press disabled:opacity-40 hover:scale-105 transition-transform"
            >
              {isPlaying
                ? <Pause className="w-8 h-8" fill="currentColor" strokeWidth={0} />
                : <Play className="w-8 h-8 ml-1" fill="currentColor" strokeWidth={0} />}
            </button>
            <button aria-label="下一曲" className="text-white/70 hover:text-white btn-press">
              <SkipForward className="w-7 h-7" fill="currentColor" strokeWidth={0} />
            </button>
          </div>

          {/* 次操作：分享 / 下载 */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              aria-label="分享"
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {nowPlaying.url && (
              <a
                href={nowPlaying.url}
                download
                aria-label="下载"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 btn-press"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
