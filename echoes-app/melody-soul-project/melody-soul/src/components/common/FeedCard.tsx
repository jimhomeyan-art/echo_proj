import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar } from './Avatar';
import { MusicCard } from './MusicCard';

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
    };
    caption: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    isLiked: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onPlay?: () => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onPlay,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 animate-fade-in shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={post.user.avatar} alt={post.user.name} size="md" gradientBorder />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-text-primary">{post.user.name}</h3>
          <p className="text-xs text-text-secondary">@{post.user.username} · {post.createdAt}</p>
        </div>
        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Caption */}
      <p className="text-sm mb-3 leading-relaxed text-text-primary">{post.caption}</p>

      {/* Music Card */}
      <div className="mb-4">
        <MusicCard
          id={post.music.id}
          title={post.music.title}
          cover={post.music.cover}
          duration={post.music.duration}
          isPlaying={false}
          onPlay={onPlay}
          size="md"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={onLike}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl
            transition-all duration-300 btn-press
            ${post.isLiked ? 'text-secondary' : 'text-text-secondary hover:text-secondary'}
          `}
        >
          <Heart
            className="w-5 h-5"
            fill={post.isLiked ? 'currentColor' : 'none'}
          />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-primary transition-colors btn-press"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.comments}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-success transition-colors btn-press"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{post.shares}</span>
        </button>
      </div>
    </div>
  );
};