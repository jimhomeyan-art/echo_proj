import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Download } from 'lucide-react'
import { generatePoster } from '../../services/poster'
import type { ShareSongMeta } from '../../services/share'

export const PosterModal: React.FC<{
  music: ShareSongMeta
  onClose: () => void
}> = ({ music, onClose }) => {
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    generatePoster(music)
      .then((url) => { if (alive) setDataUrl(url) })
      .catch(() => { if (alive) setError('海报生成失败，封面可能不支持跨域') })
    return () => { alive = false }
  }, [music])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${music.title}-Echoes.png`
    a.click()
  }

  return createPortal(
    <div className="fixed inset-0 z-[130] flex flex-col bg-black/80" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <span className="text-white text-[15px] font-semibold">分享海报</span>
        <button onClick={onClose} className="p-1 text-white/80"><X className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 flex items-center justify-center">
        {error ? (
          <p className="text-white/70 text-[14px] text-center">{error}</p>
        ) : dataUrl ? (
          <img src={dataUrl} alt="分享海报" onClick={(e) => e.stopPropagation()} className="w-full max-w-[340px] rounded-2xl shadow-2xl" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/70">
            <Loader2 className="w-7 h-7 animate-spin" />
            <span className="text-[13px]">正在生成精美海报…</span>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 pt-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {dataUrl && (
          <>
            <button
              onClick={download}
              className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3.5 rounded-pill bg-echo-green text-ink-900 text-[15px] font-semibold btn-press"
            >
              <Download className="w-5 h-5" />保存到相册
            </button>
            <p className="text-center text-[12px] text-white/50 mt-3">
              手机可长按图片保存，再发到朋友圈 / 小红书 / 抖音
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
