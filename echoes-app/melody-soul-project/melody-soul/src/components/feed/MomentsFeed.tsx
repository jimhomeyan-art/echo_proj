import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { FeedCard } from '../common/FeedCard'
import { CommentsSheet } from './CommentsSheet'
import { listFeed, toggleLike, sharePost, type FeedPost } from '../../services/feed'
import { useChat } from '../../context/ChatContext'
import type { ShareMusic } from '../chat/ShareToFriendSheet'

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

function toCardPost(p: FeedPost) {
  return {
    id: String(p.id),
    user: {
      id: String(p.user.id),
      name: p.user.nickname,
      username: '@' + p.user.username,
      avatar: p.user.avatar,
    },
    music: {
      id: p.music?.id || '',
      title: p.music?.title || '未命名',
      cover: p.music?.cover || '',
      duration: p.music?.duration || '',
      mood: p.music?.mood,
    },
    caption: p.caption,
    likes: p.likes,
    comments: p.comments,
    shares: p.shares,
    createdAt: relTime(p.createdAt),
    isLiked: p.isLiked,
  }
}

export const MomentsFeed: React.FC<{ onShare: (m: ShareMusic) => void }> = ({ onShare }) => {
  const [tab, setTab] = useState<'friends' | 'global'>('friends')
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [commentPostId, setCommentPostId] = useState<number | null>(null)
  const { nowPlaying, isPlaying, setNowPlaying, togglePlay } = useChat()

  const load = (scope: 'friends' | 'global') => {
    setLoading(true)
    listFeed(scope)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(tab) }, [tab])

  const handleLike = async (p: FeedPost) => {
    // 乐观更新
    setPosts((prev) => prev.map((x) => x.id === p.id
      ? { ...x, isLiked: !x.isLiked, likes: x.likes + (x.isLiked ? -1 : 1) }
      : x))
    try {
      const r = await toggleLike(p.id)
      setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, isLiked: r.liked, likes: r.likes } : x))
    } catch {
      load(tab) // 回滚
    }
  }

  const handlePlay = (p: FeedPost) => {
    if (!p.music?.url) return
    if (nowPlaying?.id === p.music.id) { togglePlay(); return }
    setNowPlaying({
      id: p.music.id,
      title: p.music.title,
      cover: p.music.cover,
      artist: p.user.nickname,
      url: p.music.url,
      mood: p.music.mood,
    })
  }

  const bumpCommentCount = (postId: number) => {
    setPosts((prev) => prev.map((x) => x.id === postId ? { ...x, comments: x.comments + 1 } : x))
  }

  const handleShare = (p: FeedPost) => {
    if (!p.music) return
    setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, shares: x.shares + 1 } : x))
    sharePost(p.id)
      .then((r) => setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, shares: r.shares } : x)))
      .catch(() => {})
    onShare({
      id: p.music.id, title: p.music.title, cover: p.music.cover,
      duration: p.music.duration, url: p.music.url, mood: p.music.mood,
    })
  }

  return (
    <section className="pb-6">
      {/* 子 tab：好友 / 全站 */}
      <div className="flex gap-2 mb-4">
        {(['friends', 'global'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-pill text-[13px] font-semibold transition-colors ${
              tab === t ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-500'
            }`}
          >
            {t === 'friends' ? '好友' : '全站'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-ink-300 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[14px] text-ink-400">{tab === 'friends' ? '好友还没有发布动态' : '还没有人发布动态'}</p>
          <p className="text-[12px] text-ink-300 mt-1">去创作页生成一首歌，发布到动态吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((p, index) => {
            const isCurr = nowPlaying?.id === p.music?.id
            return (
              <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
                <FeedCard
                  post={toCardPost(p)}
                  isCurrentlyPlaying={isCurr && isPlaying}
                  isLiked={p.isLiked}
                  onLike={() => handleLike(p)}
                  onComment={() => setCommentPostId(p.id)}
                  onShare={() => handleShare(p)}
                  onPlay={() => handlePlay(p)}
                />
              </div>
            )
          })}
        </div>
      )}

      {commentPostId !== null && (
        <CommentsSheet
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
          onAdded={() => bumpCommentCount(commentPostId)}
        />
      )}
    </section>
  )
}
