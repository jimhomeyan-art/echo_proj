import React, { useRef, useState } from 'react'
import { Play, Pause, Sparkles } from 'lucide-react'

function getParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    title: p.get('t') || '未命名',
    cover: p.get('c') || '',
    url: p.get('u') || '',
    mood: p.get('m') || '',
  }
}

export const SharePage: React.FC = () => {
  const { title, cover, url, mood } = getParams()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const a = audioRef.current
    if (!a || !url) return
    if (a.paused) { a.play().catch(() => {}) } else { a.pause() }
  }

  return (
    <div className="min-h-screen bg-ink-900 text-white max-w-md mx-auto relative overflow-hidden">
      {cover && (
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <img src={cover} alt="" className="w-full h-full object-cover blur-3xl scale-125" />
          <div className="absolute inset-0 bg-ink-900/70" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center px-6 pt-16 pb-10 min-h-screen">
        <div className="flex items-center gap-1.5 text-[13px] text-white/70 mb-8">
          <Sparkles className="w-4 h-4 text-echo-green" />
          Echoes · AI 音乐
        </div>

        <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl bg-white/10">
          {cover
            ? <img src={cover} alt={title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white/40">无封面</div>}
        </div>

        <h1 className="text-[24px] font-bold mt-6 text-center">{title}</h1>
        {mood && <span className="mt-2 px-3 py-1 rounded-pill bg-white/10 text-[12px] text-white/80">「{mood}」</span>}

        <button
          onClick={toggle}
          disabled={!url}
          className="mt-8 w-16 h-16 rounded-full bg-echo-green text-ink-900 flex items-center justify-center shadow-lg btn-press disabled:opacity-40"
          aria-label={playing ? '暂停' : '播放'}
        >
          {playing
            ? <Pause className="w-7 h-7" fill="currentColor" strokeWidth={0} />
            : <Play className="w-7 h-7 ml-1" fill="currentColor" strokeWidth={0} />}
        </button>
        {!url && <p className="text-[12px] text-white/50 mt-3">该链接没有可播放音频</p>}

        <div className="flex-1" />

        <a
          href="/"
          className="mt-10 w-full max-w-xs py-3.5 rounded-pill bg-white text-ink-900 text-[14px] font-semibold text-center btn-press"
        >
          ✨ 用 Echoes 创作属于你的音乐
        </a>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  )
}
