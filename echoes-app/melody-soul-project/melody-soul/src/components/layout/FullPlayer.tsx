import React, { useEffect } from 'react'
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Heart, Share2, Download, MoreVertical } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { EchoAvatar } from '../common/EchoAvatar'

/**
 * 全屏歌曲详情 - 类似 Spotify / 网易云
 * 显示：封面、标题、创作者、分段歌词、播放控件
 */
export const FullPlayer: React.FC = () => {
  const { isFullPlayerOpen, closeFullPlayer, nowPlaying, isPlaying, togglePlay, audioRef } = useChat()

  // 阻止 body 背景滚动
  useEffect(() => {
    if (isFullPlayerOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = original }
    }
  }, [isFullPlayerOpen])

  // ESC 关闭
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

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 animate-slide-up overflow-hidden">
      {/* 装饰光球 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl" />
      </div>

      <div className="relative h-full flex flex-col max-w-md mx-auto text-white">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <button
            onClick={closeFullPlayer}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors btn-press"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <p className="text-[11px] text-white/60 uppercase tracking-widest">Echoes</p>
            <p className="text-sm font-medium truncate max-w-[200px] mx-auto">{nowPlaying.title}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors btn-press">
            <MoreVertical className="w-5 h-5" />
          </button>
        </header>

        {/* 封面 + 标题 */}
        <div className="px-6 mt-2">
          <div className="aspect-square w-full max-w-xs mx-auto rounded-3xl overflow-hidden shadow-2xl relative">
            {nowPlaying.cover ? (
              <img src={nowPlaying.cover} alt={nowPlaying.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <EchoAvatar size={120} />
              </div>
            )}
            {/* 浮动播放波纹 */}
            {isPlaying && (
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-center gap-1 h-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-white/80 rounded-full music-wave"
                    style={{
                      height: `${8 + (i % 4) * 4}px`,
                      animationDelay: `${i * 80}ms`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold tracking-wide">{nowPlaying.title}</h2>
            <p className="text-sm text-white/60 mt-2">
              创作者:&nbsp;<span className="text-white/90">{nowPlaying.creator || '我自己'}</span>
              <span className="mx-2 text-white/30">·</span>
              <span className="text-white/70">{nowPlaying.artist || 'Echoes AI'}</span>
            </p>
          </div>
        </div>

        {/* 歌词区 */}
        <div className="flex-1 overflow-y-auto px-6 mt-6 mb-32 scrollbar-hide">
          {lyricsLines.length > 0 && lyricsLines.some(l => l.trim()) ? (
            <div className="space-y-2 pb-8 text-center">
              {lyricsLines.map((line, idx) => {
                const trimmed = line.trim()
                if (!trimmed) return <div key={idx} className="h-4" />
                const isSection = /^\[.+\]$/.test(trimmed)
                return (
                  <p
                    key={idx}
                    className={
                      isSection
                        ? 'text-[11px] uppercase tracking-widest text-pink-300 mt-6 mb-1 font-medium'
                        : 'text-base text-white/85 leading-relaxed'
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

        {/* 控件 */}
        <div className="absolute left-0 right-0 bottom-0 px-6 pb-10 pt-4 bg-gradient-to-t from-black/40 via-black/20 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            {nowPlaying.url && (
              <a
                href={nowPlaying.url}
                download
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <div className="flex-1" />
          </div>

          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => audioRef.current && (audioRef.current.currentTime = 0)}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <SkipBack className="w-7 h-7" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!nowPlaying.url}
              className="w-16 h-16 rounded-full bg-white text-purple-900 flex items-center justify-center shadow-2xl btn-press disabled:opacity-50"
            >
              {isPlaying
                ? <Pause className="w-7 h-7" fill="currentColor" />
                : <Play className="w-7 h-7 ml-1" fill="currentColor" />}
            </button>
            <button className="p-2 text-white/70 hover:text-white transition-colors">
              <SkipForward className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
