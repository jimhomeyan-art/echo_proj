import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Pause } from 'lucide-react';
import { Avatar } from './Avatar';

interface FeedCardProps {
  post: {
    id: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar: string;
    };
    music: {
      id: string;
      title: string;
      cover: string;
      duration: string;
      mood?: string;
    };
    caption: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    isLiked: boolean;
  };
  isLiked?: boolean;
  isCurrentlyPlaying?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onPlay?: () => void;
}

/**
 * Tinder 风格 Feed Card：大照片 + 黑色渐变叠字 + 圆形浮起播放按钮
 */
export const FeedCard: React.FC<FeedCardProps> = ({
  post,
  isLiked,
  isCurrentlyPlaying,
  onLike,
  onComment,
  onShare,
  onPlay,
}) => {
  const liked = isLiked !== undefined ? isLiked : post.isLiked;
  const likeCount = post.likes + (liked && !post.isLiked ? 1 : 0);

  return (
    <div className="bg-white animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-1 mb-3">
        <Avatar src={post.user.avatar} alt={post.user.name} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[14px] text-ink-900 leading-tight">{post.user.name}</h3>
          <p className="text-[12px] text-ink-500 leading-tight mt-0.5">
            {post.user.username} · {post.createdAt}
          </p>
        </div>
        <button className="p-2 text-ink-500 hover:text-ink-900 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-[14px] mb-3 leading-relaxed text-ink-900 px-1">{post.caption}</p>
      )}

      {/* 大照片卡 */}
      <div className="relative rounded-card overflow-hidden bg-ink-900 shadow-card">
        <div className="relative aspect-[4/5] w-full">
          <img
            src={post.music.cover}
            alt={post.music.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 photo-overlay" />

          {/* Top right duration */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-pill bg-black/40 backdrop-blur-sm text-[11px] text-white font-medium">
              {post.music.duration}
            </span>
          </div>

          {/* Bottom info + play */}
          <div className="absolute left-4 right-4 bottom-4">
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-[22px] text-white tracking-tight leading-tight truncate">
                  {post.music.title}
                </h2>
                {post.music.mood && (
                  <span className="chip-dark mt-2">「{post.music.mood}」</span>
                )}
              </div>
              <button
                onClick={onPlay}
                aria-label={isCurrentlyPlaying ? '暂停' : '播放'}
                className="w-14 h-14 rounded-full bg-white text-ink-900 flex items-center justify-center shadow-pop btn-press flex-shrink-0"
              >
                {isCurrentlyPlaying
                  ? <Pause className="w-5 h-5" fill="currentColor" strokeWidth={0} />
                  : <Play className="w-5 h-5 ml-0.5" fill="currentColor" strokeWidth={0} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 px-1">
        <button
          onClick={onLike}
          className={`
            flex items-center gap-1.5 pr-3 py-2 rounded-pill btn-press transition-colors
            ${liked ? 'text-tinder-flame' : 'text-ink-900 hover:text-tinder-flame'}
          `}
        >
          <Heart className="w-[22px] h-[22px]" fill={liked ? 'currentColor' : 'none'} />
          <span className="text-[13px] font-semibold tabular-nums">{likeCount}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-1.5 px-3 py-2 rounded-pill text-ink-900 btn-press"
        >
          <MessageCircle className="w-[22px] h-[22px]" />
          <span className="text-[13px] font-semibold tabular-nums">{post.comments}</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-pill text-ink-900 btn-press ml-auto"
        >
          <Share2 className="w-[22px] h-[22px]" />
          <span className="text-[13px] font-semibold tabular-nums">{post.shares}</span>
        </button>
      </div>
    </div>
  );
};
