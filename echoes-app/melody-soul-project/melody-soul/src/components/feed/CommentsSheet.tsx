import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Send } from 'lucide-react'
import { listComments, addComment, type PostComment } from '../../services/feed'

function relTime(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}天前`
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

export const CommentsSheet: React.FC<{
  postId: number
  onClose: () => void
  onAdded: () => void
}> = ({ postId, onClose, onAdded }) => {
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listComments(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  const submit = async () => {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const c = await addComment(postId, content)
      setComments((prev) => [...prev, c])
      setText('')
      onAdded()
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
    } catch {} finally {
      setSending(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl flex flex-col animate-slide-up"
        style={{ height: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-100 flex-shrink-0">
          <span className="w-5" />
          <h3 className="text-[15px] font-semibold text-ink-900">{comments.length} 条评论</h3>
          <button onClick={onClose} className="text-ink-500"><X className="w-5 h-5" /></button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-ink-300 animate-spin" /></div>
          ) : comments.length === 0 ? (
            <p className="text-center text-[13px] text-ink-400 py-10">还没有评论，来抢沙发</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <img src={c.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink-700">{c.user.nickname}</p>
                    <p className="text-[14px] text-ink-900 mt-0.5 break-words">{c.content}</p>
                    <p className="text-[11px] text-ink-300 mt-1">{relTime(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-2 px-4 py-3 border-t border-ink-100 flex-shrink-0"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            maxLength={300}
            placeholder="说点什么…"
            className="flex-1 px-4 py-2.5 bg-ink-50 rounded-pill text-[14px] text-ink-900 outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-echo-green text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
