import React from 'react';
import { Settings, Edit3, Heart, Music, MessageCircle, Share2, ChevronRight, Shield, Bell, HelpCircle, LogOut } from 'lucide-react';
import { currentUser, myLibrary } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'works' | 'liked' | 'moments'>('works');

  const works = myLibrary.created.concat(myLibrary.liked.slice(0, 4) as any).slice(0, 9);

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="max-w-md mx-auto px-5 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-[28px] font-display font-bold text-ink-900 leading-none tracking-tight">
            个人中心
          </h1>
          <button className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Profile */}
      <div className="max-w-md mx-auto px-5 pt-2 pb-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-1 ring-ink-100">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ink-900 text-white flex items-center justify-center btn-press">
              <Edit3 className="w-3 h-3" />
            </button>
          </div>

          <h2 className="text-[20px] font-display font-bold text-ink-900">{currentUser.name}</h2>
          <p className="text-[13px] text-ink-500 mt-0.5">{currentUser.username}</p>
          <p className="text-[14px] text-ink-900 mt-3 max-w-xs leading-relaxed">{currentUser.bio}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-5 w-full justify-center">
            <Stat n={currentUser.songs} label="作品" />
            <span className="w-px h-8 bg-ink-100" />
            <Stat n={currentUser.followers} label="粉丝" />
            <span className="w-px h-8 bg-ink-100" />
            <Stat n={currentUser.following} label="关注" />
            <span className="w-px h-8 bg-ink-100" />
            <Stat n={currentUser.likes} label="获赞" />
          </div>

          {/* Action */}
          <div className="flex items-center gap-2 mt-5 w-full">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`
                flex-1 py-3 rounded-pill font-semibold text-[14px] btn-press transition-colors
                ${isFollowing
                  ? 'border border-ink-100 text-ink-900 bg-white'
                  : 'bg-ink-900 text-white'}
              `}
            >
              {isFollowing ? '已关注' : '关注'}
            </button>
            <button className="w-12 h-12 rounded-full border border-ink-100 text-ink-900 flex items-center justify-center btn-press">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="w-12 h-12 rounded-full border border-ink-100 text-ink-900 flex items-center justify-center btn-press">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-5">
        <div className="flex gap-6 border-b border-ink-100">
          {([
            { id: 'works', icon: Music, label: '作品' },
            { id: 'liked', icon: Heart, label: '赞过' },
            { id: 'moments', icon: MessageCircle, label: '动态' },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3 flex items-center gap-1.5 text-[14px] font-semibold transition-colors ${
                  active ? 'text-ink-900' : 'text-ink-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {active && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-ink-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-md mx-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-2">
          {works.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 cursor-pointer group"
            >
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                <p className="text-[11px] text-white font-semibold truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="max-w-md mx-auto px-5 pt-2 pb-4">
        <h3 className="text-[12px] font-semibold text-ink-500 mb-2 px-1">设置</h3>
        <div className="space-y-1">
          {([
            { icon: Shield, label: '隐私设置' },
            { icon: Bell, label: '通知设置' },
            { icon: HelpCircle, label: '帮助与反馈' },
          ] as const).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center text-ink-900">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-[14px] font-medium text-ink-900">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-ink-300" />
              </button>
            );
          })}
          <button className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left text-tinder-flame">
            <div className="w-10 h-10 rounded-full bg-tinder-flame/10 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="flex-1 text-[14px] font-medium">退出登录</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-4 text-center">
        <p className="text-[11px] text-ink-300">Echoes v1.0.0</p>
        <p className="text-[11px] text-ink-300 mt-0.5">用音乐连接世界</p>
      </div>
    </div>
  );
};

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[18px] font-display font-bold text-ink-900 tabular-nums leading-none">{n}</p>
      <p className="text-[11px] text-ink-500 mt-1">{label}</p>
    </div>
  );
}
