import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Share2, Link2, Check, Image as ImageIcon } from 'lucide-react'
import { listFriends } from '../../services/friends'
import { sendMessage } from '../../services/im'
import type { AuthUser } from '../../services/auth'
import { buildShareUrl, copyText, weiboShareUrl } from '../../services/share'
import { PosterModal } from './PosterModal'

export interface ShareMusic {
  id: string
  title: string
  cover?: string
  duration?: string
  url?: string
  mood?: string
}

export const ShareToFriendSheet: React.FC<{
  music: ShareMusic
  onClose: () => void
  onShared: (friendName: string) => void
}> = ({ music, onClose, onShared }) => {
  const [friends, setFriends] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPoster, setShowPoster] = useState(false)

  useEffect(() => {
    listFriends()
      .then(setFriends)
      .catch(() => setError('加载好友失败'))
      .finally(() => setLoading(false))
  }, [])

  const share = async (f: AuthUser) => {
    if (sendingId) return
    setSendingId(f.id)
    setError('')
    try {
      await sendMessage(f.id, 'music', music)
      onShared(f.nickname)
    } catch (err) {
      setError(err instanceof Error ? err.message : '分享失败')
      setSendingId(null)
    }
  }

  const shareUrl = buildShareUrl(music)

  const handleCopy = async () => {
    const ok = await copyText(shareUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } else {
      setError('复制失败，请手动复制')
    }
  }

  const handleWeibo = () => {
    window.open(weiboShareUrl(shareUrl, music.title), '_blank')
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl flex flex-col animate-slide-up"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 抓手 */}
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="w-9 h-1 rounded-full bg-ink-200" />
        </div>

        <div className="flex items-center justify-between px-5 pt-1 pb-3 border-b border-ink-100">
          <div className="flex items-center gap-2 min-w-0">
            {music.cover && <img src={music.cover} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
            <h3 className="text-[15px] font-semibold text-ink-900 truncate">分享《{music.title}》</h3>
          </div>
          <button onClick={onClose} className="p-1 text-ink-500 flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div
          className="overflow-y-auto px-3 py-2"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
        >
          {error && <p className="text-center text-[13px] text-tinder-flame py-2">{error}</p>}

          {/* 外部分享 */}
          <div className="flex items-center gap-5 px-3 py-3">
            <button onClick={handleCopy} className="flex flex-col items-center gap-1.5 btn-press">
              <span className="w-12 h-12 rounded-full bg-ink-50 flex items-center justify-center text-ink-900">
                {copied ? <Check className="w-5 h-5 text-echo-green" /> : <Link2 className="w-5 h-5" />}
              </span>
              <span className="text-[11px] text-ink-500">{copied ? '已复制' : '复制链接'}</span>
            </button>
            <button onClick={handleWeibo} className="flex flex-col items-center gap-1.5 btn-press">
              <span className="w-12 h-12 rounded-full bg-[#E6162D] flex items-center justify-center text-white text-[18px] font-bold">微</span>
              <span className="text-[11px] text-ink-500">微博</span>
            </button>
            <button onClick={() => setShowPoster(true)} className="flex flex-col items-center gap-1.5 btn-press">
              <span className="w-12 h-12 rounded-full bg-gradient-to-br from-echo-green to-[#0a8f43] flex items-center justify-center text-white">
                <ImageIcon className="w-5 h-5" />
              </span>
              <span className="text-[11px] text-ink-500">生成海报</span>
            </button>
          </div>
          <p className="text-[11px] text-ink-300 px-3 pb-2">微信 / 小红书 / 抖音：复制链接后粘贴分享</p>

          <div className="border-t border-ink-100 pt-2">
            <p className="text-[12px] font-semibold text-ink-400 px-3 pb-1">发送给好友</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-ink-300 animate-spin" /></div>
          ) : friends.length === 0 ? (
            <p className="text-center text-[13px] text-ink-400 py-12">还没有好友，先去添加吧</p>
          ) : (
            <div className="space-y-1">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => share(f)}
                  disabled={sendingId !== null}
                  className="w-full flex items-center gap-3 p-2.5 rounded-card hover:bg-ink-50 text-left disabled:opacity-50"
                >
                  <img src={f.avatar} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink-900 truncate">{f.nickname}</p>
                    <p className="text-[12px] text-ink-500 truncate">@{f.username}</p>
                  </div>
                  {sendingId === f.id
                    ? <Loader2 className="w-5 h-5 text-echo-green animate-spin flex-shrink-0" />
                    : <span className="px-3 py-1.5 rounded-pill bg-echo-green/12 text-echo-green text-[12px] font-semibold flex items-center gap-1 flex-shrink-0">
                        <Share2 className="w-3.5 h-3.5" />发送
                      </span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPoster && (
        <PosterModal
          music={{ id: music.id, title: music.title, cover: music.cover, url: music.url, mood: music.mood }}
          onClose={() => setShowPoster(false)}
        />
      )}
    </div>,
    document.body
  )
}
