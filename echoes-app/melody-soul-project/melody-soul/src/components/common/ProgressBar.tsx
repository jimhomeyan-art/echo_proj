import React, { useEffect, useRef, useState } from 'react'

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (sec: number) => void
  /** 'mini' = 底部贴边的细条；'full' = 全屏播放器的可拖动条带时间戳 */
  variant?: 'mini' | 'full'
  className?: string
}

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  variant = 'full',
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [previewTime, setPreviewTime] = useState<number | null>(null)

  // duration 为 Infinity（流式 mp3）时，用 currentTime+30 作为显示长度
  const safeDur = isFinite(duration) && duration > 0
    ? duration
    : (currentTime > 0 ? currentTime + 30 : 0)
  const isStreaming = !isFinite(duration) || duration <= 0
  const displayTime = previewTime !== null ? previewTime : currentTime
  const pct = safeDur > 0 ? Math.min(100, (displayTime / safeDur) * 100) : 0

  function pickTimeFromEvent(clientX: number): number | null {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    // 流式 duration 未知时，按轨道比例映射到已缓冲范围
    const effectiveDur = safeDur > 0 ? safeDur : currentTime > 0 ? currentTime * 2 : null
    if (!effectiveDur) return null
    return (x / rect.width) * effectiveDur
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      const t = pickTimeFromEvent(e.clientX)
      if (t !== null) setPreviewTime(t)
    }
    const onUp = (e: PointerEvent) => {
      const t = pickTimeFromEvent(e.clientX)
      if (t !== null) onSeek(t)
      setDragging(false)
      setPreviewTime(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    window.addEventListener('pointercancel', () => setDragging(false), { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
    }
  }, [dragging, safeDur, onSeek])

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    const t = pickTimeFromEvent(e.clientX)
    if (t !== null) setPreviewTime(t)
  }

  if (variant === 'mini') {
    return (
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          e.stopPropagation()
          const t = pickTimeFromEvent(e.clientX)
          if (t !== null) onSeek(t)
        }}
        className={`relative h-1 w-full bg-gray-200 cursor-pointer ${className}`}
      >
        <div
          className="absolute inset-y-0 left-0 gradient-primary rounded-r-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        className="relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer touch-none"
      >
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-transform"
          style={{
            left: `${pct}%`,
            transform: `translate(-50%, -50%) scale(${dragging ? 1.4 : 1})`
          }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[11px] text-white/70 tabular-nums">
        <span>{fmt(displayTime)}</span>
        <span>{isStreaming ? '∞' : fmt(safeDur)}</span>
      </div>
    </div>
  )
}
