import React from 'react';
import { Avatar } from './Avatar';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    followers: number;
    isFollowing: boolean;
  };
  onFollow?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onFollow }) => {
  const formatFollowers = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="bg-surface rounded-2xl p-4 flex items-center gap-4 animate-slide-up card-hover">
      <Avatar src={user.avatar} alt={user.name} size="lg" gradientBorder />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{user.name}</h3>
        <p className="text-xs text-text-secondary truncate">@{user.username}</p>
        <p className="text-xs text-text-secondary mt-1">
          {formatFollowers(user.followers)} 粉丝
        </p>
      </div>

      {onFollow && (
        <button
          onClick={onFollow}
          className={`
            px-4 py-2 rounded-full text-sm font-semibold
            transition-all duration-300 btn-press
            ${
              user.isFollowing
                ? 'bg-surface border border-white/20 text-text-secondary hover:border-secondary-end hover:text-secondary-end'
                : 'gradient-secondary text-white'
            }
          `}
        >
          {user.isFollowing ? '已关注' : '关注'}
        </button>
      )}
    </div>
  );
};