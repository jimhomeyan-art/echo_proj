import React, { useState, useEffect } from 'react';
import { Search, Bell, Wifi, WifiOff, Send, Heart, MessageCircle, UserPlus, Play, MoreHorizontal, TrendingUp } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { FeedCard } from '../components/common/FeedCard';
import { feedPosts, recommendedUsers, currentUser } from '../data/mockData';
import { useChat } from '../context/ChatContext';

export const ChannelPage: React.FC = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState(285);
  const [selectedMood, setSelectedMood] = useState('平静');
  const [activeSection, setActiveSection] = useState<'feed' | 'frequency'>('feed');
  const { setNowPlaying, openFullPlayer, toggleCapsule, isCapsuled } = useChat();

  function playPostMusic(post: typeof feedPosts[number]) {
    setNowPlaying({
      id: post.music.id,
      title: post.music.title,
      cover: post.music.cover,
      artist: post.user.name,
      url: post.music.url,
      mood: post.music.mood,
    });
    openFullPlayer();
  }

  const moods = ['平静', '忧郁', '兴奋', '开心', '浪漫', '沉思'];

  // Simulate frequency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrequency(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const nearbyUsers = [
    { id: 1, name: '海浪低语', frequency: 285, mood: '平静', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: 2, name: '星空漫步', frequency: 320, mood: '沉思', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' },
    { id: 3, name: '月光咖啡馆', frequency: 296, mood: '平静', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' },
  ];

  return (
    <div className="min-h-screen pb-20 bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" gradientBorder />
              <div>
                <h1 className="text-xl font-display font-bold text-text-primary">频道</h1>
                <p className="text-xs text-primary">{currentFrequency} Hz · 与同频者共振</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-gray-100 text-text-secondary hover:text-text-primary transition-colors btn-press">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl bg-gray-100 text-text-secondary hover:text-text-primary transition-colors btn-press relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
              </button>
            </div>
          </div>

          {/* Section Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveSection('feed')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === 'feed'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              动态
            </button>
            <button
              onClick={() => setActiveSection('frequency')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === 'frequency'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              同频
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 py-4">
        {activeSection === 'feed' ? (
          <>
            {/* Stories Section */}
            <section className="mb-6">
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-20 text-center cursor-pointer"
                  >
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <img
                            src={`https://images.unsplash.com/photo-${1500000000000 + i * 100}?w=100&h=100&fit=crop`}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`;
                            }}
                          />
                        </div>
                      </div>
                      {i === 0 && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-primary flex items-center justify-center shadow-primary">
                          <span className="text-white text-xs font-bold">+</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate">
                      {i === 0 ? '我的故事' : `用户${i}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Section */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-bold text-text-primary">热门创作</h2>
                </div>
                <button className="text-sm text-primary font-medium">查看全部</button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
                {feedPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="flex-shrink-0 w-36 bg-white rounded-xl overflow-hidden card-hover shadow-soft"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={post.music.cover}
                        alt={post.music.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-sm font-semibold text-white truncate">{post.music.title}</p>
                        <p className="text-xs text-white/70 truncate">@{post.user.username}</p>
                      </div>
                      <button
                        onClick={() => playPostMusic(post)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center btn-press"
                      >
                        <Play className="w-4 h-4 text-primary" fill="#6366F1" />
                      </button>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-xs text-text-secondary">{post.music.duration}</span>
                      <div className="flex items-center gap-1 text-text-secondary">
                        <span className="text-xs">❤️ {post.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Feed */}
            <section className="space-y-4">
              <h2 className="text-lg font-display font-bold text-text-primary">最新动态</h2>
              {feedPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FeedCard
                    post={post}
                    onLike={() => {
                      toggleCapsule({
                        id: post.music.id,
                        title: post.music.title,
                        cover: post.music.cover,
                        duration: post.music.duration,
                        url: post.music.url,
                        mood: post.music.mood,
                        styleTag: post.music.styleTag,
                        createdAt: new Date().toISOString().slice(0, 10),
                        plays: 0,
                        source: 'liked',
                        creator: post.user.name,
                      });
                    }}
                    isLiked={isCapsuled(post.music.id) || post.isLiked}
                    onComment={() => console.log('Comment', post.id)}
                    onShare={() => console.log('Share', post.id)}
                    onPlay={() => playPostMusic(post)}
                  />
                </div>
              ))}
            </section>

            {/* Recommended Users */}
            <section className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-text-primary">推荐关注</h2>
                <button className="text-sm text-primary font-medium">换一批</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recommendedUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl p-3 card-hover shadow-soft animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-text-primary truncate">{user.name}</h3>
                        <p className="text-xs text-text-secondary">@{user.username}</p>
                      </div>
                    </div>
                    <button className="w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                      + 关注
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Frequency Hero Section */}
            <div className="relative bg-white rounded-3xl p-6 mb-6 overflow-hidden shadow-soft">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative text-center">
                <p className="text-xs text-text-secondary mb-2">当前情绪频率</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-display font-bold text-gradient-primary">{currentFrequency}</span>
                  <span className="text-lg text-text-secondary">Hz</span>
                </div>
                <p className="text-sm text-primary mt-2 font-medium">{selectedMood} · {isBroadcasting ? '广播中' : '静默'}</p>
              </div>

              {/* Mood Tags */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium
                      transition-all duration-300 btn-press
                      ${selectedMood === mood
                        ? 'bg-primary text-white shadow-primary'
                        : 'bg-gray-100 text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    {mood}
                  </button>
                ))}
              </div>

              {/* Resonance Radar */}
              <div className="relative h-32 flex items-center justify-center mt-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border-2 border-primary/20"
                    style={{
                      width: `${i * 80}px`,
                      height: `${i * 80}px`,
                      animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
                    }}
                  />
                ))}
                <div className="relative z-10 w-4 h-4 rounded-full bg-primary animate-pulse" />
              </div>
            </div>

            {/* Broadcast Toggle */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 mb-6 shadow-soft">
              <div className="flex items-center gap-3">
                {isBroadcasting ? (
                  <Wifi className="w-5 h-5 text-primary" />
                ) : (
                  <WifiOff className="w-5 h-5 text-text-secondary" />
                )}
                <div>
                  <p className="text-sm font-medium text-text-primary">广播共振</p>
                  <p className="text-xs text-text-secondary">
                    {isBroadcasting ? '同频者可以发现你' : '已隐藏你的频率'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcasting(!isBroadcasting)}
                className={`
                  relative w-12 h-7 rounded-full transition-all duration-300
                  ${isBroadcasting ? 'bg-primary' : 'bg-gray-200'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-5 h-5 rounded-full bg-white shadow-md
                    transition-all duration-300
                    ${isBroadcasting ? 'left-6' : 'left-1'}
                  `}
                />
              </button>
            </div>

            {/* Nearby Users */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-text-primary">附近同频者</h2>
                <span className="text-xs text-text-secondary">{nearbyUsers.length} 人在线</span>
              </div>

              <div className="space-y-3">
                {nearbyUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 hover:border-primary/30 transition-colors cursor-pointer shadow-soft"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-primary/10 text-xs text-primary font-medium">
                        {user.frequency}Hz
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-text-primary">{user.name}</h3>
                      <p className="text-xs text-text-secondary">{user.mood}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 transition-colors">
                        <Heart className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 transition-colors">
                        <MessageCircle className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button className="flex-1 py-4 rounded-2xl gradient-secondary text-white font-semibold btn-press flex items-center justify-center gap-2 shadow-pink">
                <Send className="w-5 h-5" />
                发起流星通话
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
