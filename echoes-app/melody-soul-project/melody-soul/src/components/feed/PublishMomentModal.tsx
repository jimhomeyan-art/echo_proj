import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Send } from 'lucide-react'
import { createPost, type FeedMusic } from '../../services/feed'

export const PublishMomentModal: React.FC<{
  music: FeedMusic
  onClose: () => void
  onPublished: () => void
}> = ({ music, onClose, onPublished }) => {
  const [caption, setCaption] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const publish = async () => {
    setError('')
    setPosting(true)
    try {
      await createPost(music, caption.trim())
      onPublished()
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败')
      setPosting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <button onClick={onClose} className="text-ink-500"><X className="w-5 h-5" /></button>
          <h3 className="text-[16px] font-semibold text-ink-900">发布动态</h3>
          <button
            onClick={publish}
            disabled={posting}
            className="text-echo-green font-semibold text-[14px] disabled:opacity-40 flex items-center gap-1"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}发布
          </button>
        </div>

        <div className="p-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))' }}>
          {error && <p className="text-[13px] text-tinder-flame mb-3">{error}</p>}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            rows={3}
            autoFocus
            placeholder="说点什么，分享这首歌的心情…"
            className="w-full text-[15px] text-ink-900 outline-none resize-none placeholder:text-ink-300"
          />

          {/* 音乐卡预览 */}
          <div className="mt-3 flex items-center gap-3 p-3 rounded-card bg-ink-50">
            {music.cover && <img src={music.cover} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink-900 truncate">{music.title}</p>
              <p className="text-[12px] text-ink-500 truncate">{music.mood || 'AI 音乐'}</p>
            </div>
          </div>

          <p className="text-[11px] text-ink-300 text-right mt-2">{caption.length}/200</p>
        </div>
      </div>
    </div>,
    document.body
  )
}
