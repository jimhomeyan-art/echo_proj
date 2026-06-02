import React from 'react'
import { Play, Pause, ChevronUp } from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { EchoAvatar } from '../common/EchoAvatar'
import { ProgressBar } from '../common/ProgressBar'

interface MiniPlayerProps {
  onExpand?: () => void
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const {
    nowPlaying, isPlaying, togglePlay, openFullPlayer,
    currentTime, duration, seek,
  } = useChat()

  if (!nowPlaying) return null

  const hasUrl = Boolean(nowPlaying.url)
  const handleExpand = onExpand || openFullPlayer

  return (
    <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white border-t border-ink-100">
      <div className="max-w-md mx-auto">
        <ProgressBar
          variant="mini"
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />
      </div>
      <div
        className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3 cursor-pointer btn-press"
        onClick={handleExpand}
      >
        {/* 封面 */}
        <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-ink-100">
          {nowPlaying.cover ? (
            <img src={nowPlaying.cover} alt={nowPlaying.title} className="w-full h-full object-cover" />
          ) : (
            <EchoAvatar size={44} className="!rounded-xl" />
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-3.5">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-0.5 bg-white rounded-full music-wave"
                    style={{ height: `${5 + (i % 3) * 4}px`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 标题 */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink-900 truncate leading-tight">
            {nowPlaying.title}
          </p>
          <p className="text-xs text-ink-500 truncate mt-0.5">
            {nowPlaying.artist || 'Echoes AI'}
            {!hasUrl && <span className="ml-1.5 text-tinder-flame">· 生成中</span>}
          </p>
        </div>

        {/* 主操作：仅一个圆形 play/pause */}
        <button
          onClick={e => { e.stopPropagation(); togglePlay() }}
          disabled={!hasUrl}
          aria-label={isPlaying ? '暂停' : '播放'}
          className="w-11 h-11 rounded-full bg-ink-900 text-white flex items-center justify-center btn-press disabled:opacity-40"
        >
          {isPlaying
            ? <Pause className="w-4.5 h-4.5" fill="white" strokeWidth={0} />
            : <Play className="w-4.5 h-4.5 ml-0.5" fill="white" strokeWidth={0} />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); handleExpand() }}
          aria-label="展开播放器"
          className="p-2 text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
