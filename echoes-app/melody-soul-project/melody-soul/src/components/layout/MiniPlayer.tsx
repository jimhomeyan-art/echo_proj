import React from 'react'
import { Play, Pause, SkipBack, SkipForward, ChevronUp } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { EchoAvatar } from '../common/EchoAvatar'
import { ProgressBar } from '../common/ProgressBar'

interface MiniPlayerProps {
  onExpand?: () => void
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const {
    nowPlaying, isPlaying, togglePlay, audioRef, openFullPlayer,
    currentTime, duration, seek,
  } = useChat()

  // 没有正在播放的音乐时，不显示
  if (!nowPlaying) return null

  const hasUrl = Boolean(nowPlaying.url)
  const handleExpand = onExpand || openFullPlayer

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg">
      {/* 顶部贴边的细进度条（限宽到手机容器） */}
      <div className="max-w-md mx-auto">
        <ProgressBar
          variant="mini"
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />
      </div>
      <div
        className="max-w-md mx-auto p-3 flex items-center gap-3 cursor-pointer btn-press"
        onClick={handleExpand}
      >
        {/* 封面 */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          {nowPlaying.cover ? (
            <img src={nowPlaying.cover} alt={nowPlaying.title} className="w-full h-full object-cover" />
          ) : (
            <EchoAvatar size={48} className="!rounded-xl" />
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="w-0.5 bg-white rounded-full music-wave"
                    style={{ height: `${4 + (i % 3) * 4}px`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 标题 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{nowPlaying.title}</p>
          <p className="text-xs text-text-secondary truncate">
            {nowPlaying.artist || 'Echoes AI'}
          </p>
          {!hasUrl && (
            <div className="mt-1.5 flex gap-1 items-center">
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-primary/60 music-wave"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-text-muted">生成中</span>
            </div>
          )}
        </div>

        {/* 控件 */}
        <div className="flex items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); audioRef.current?.currentTime && (audioRef.current.currentTime = 0) }}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); togglePlay() }}
            disabled={!hasUrl}
            className="p-2.5 rounded-full gradient-primary shadow-primary text-white btn-press disabled:opacity-50"
          >
            {isPlaying
              ? <Pause className="w-4 h-4" fill="white" />
              : <Play className="w-4 h-4 ml-0.5" fill="white" />}
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleExpand() }}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
