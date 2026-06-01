import React from 'react';
import { Settings, Edit3, Heart, Music, MessageCircle, Share2, ChevronRight, Shield, Bell, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { currentUser } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const [isFollowing, setIsFollowing] = React.useState(false);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-effect border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">个人中心</h1>
          <button className="p-2 rounded-xl bg-surface text-text-secondary hover:text-text-primary transition-colors btn-press">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar with gradient border */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-start to-secondary-end p-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* User Info */}
          <h2 className="text-xl font-display font-bold">{currentUser.name}</h2>
          <p className="text-text-secondary text-sm mt-1">{currentUser.username}</p>
          <p className="text-sm mt-3 max-w-xs">{currentUser.bio}</p>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-6 py-4 border-y border-white/10 w-full justify-center">
            <div className="text-center">
              <p className="text-xl font-bold">{currentUser.songs}</p>
              <p className="text-xs text-text-secondary">作品</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-bold">{currentUser.followers}</p>
              <p className="text-xs text-text-secondary">粉丝</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-bold">{currentUser.following}</p>
              <p className="text-xs text-text-secondary">关注</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-bold">{currentUser.likes}</p>
              <p className="text-xs text-text-secondary">获赞</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 w-full">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`
                flex-1 py-3 rounded-full font-semibold text-sm
                transition-all duration-300 btn-press
                ${isFollowing
                  ? 'bg-surface border border-white/20 text-text-secondary'
                  : 'gradient-primary text-white'
                }
              `}
            >
              {isFollowing ? '已关注' : '关注'}
            </button>
            <button className="p-3 rounded-full bg-surface text-text-secondary hover:text-text-primary transition-colors btn-press">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-full bg-surface text-text-secondary hover:text-text-primary transition-colors btn-press">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-md mx-auto px-5">
        <div className="flex border-b border-white/10">
          {[
            { id: 'works', icon: Music, label: '作品' },
            { id: 'liked', icon: Heart, label: '赞过' },
            { id: 'moments', icon: MessageCircle, label: '动态' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-text-secondary hover:text-text-primary transition-colors border-b-2 border-transparent hover:border-accent"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-md mx-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden bg-surface cursor-pointer group"
            >
              <img
                src={`https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop`}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  <span className="text-xs font-medium">{Math.floor(Math.random() * 1000)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Menu */}
      <div className="max-w-md mx-auto px-5 py-4 space-y-2">
        <h3 className="text-sm font-semibold text-text-secondary mb-2 px-2">设置</h3>

        {[
          { icon: Shield, label: '隐私设置', color: 'text-accent' },
          { icon: Bell, label: '通知设置', color: 'text-success' },
          { icon: HelpCircle, label: '帮助与反馈', color: 'text-warning' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 bg-surface rounded-xl p-4 hover:bg-surface/80 transition-colors btn-press"
            >
              <div className={`w-10 h-10 rounded-xl bg-surface flex items-center justify-center ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </button>
          );
        })}

        <button className="w-full flex items-center gap-4 bg-surface rounded-xl p-4 hover:bg-surface/80 transition-colors btn-press text-red-400">
          <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left text-sm font-medium">退出登录</span>
        </button>
      </div>

      {/* App Version */}
      <div className="max-w-md mx-auto px-5 py-6 text-center">
        <p className="text-xs text-text-secondary">MelodySoul v1.0.0</p>
        <p className="text-xs text-text-secondary/50 mt-1">用音乐连接世界</p>
      </div>
    </div>
  );
};