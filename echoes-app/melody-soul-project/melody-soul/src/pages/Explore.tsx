import React from 'react';
import { Search, TrendingUp, Flame, Music, Headphones, Star, Zap, Mic, Heart } from 'lucide-react';
import { UserCard } from '../components/common/UserCard';
import { MusicCard } from '../components/common/MusicCard';
import { categories, feedPosts } from '../data/mockData';

const categoryIcons: Record<string, React.ElementType> = {
  zap: Zap,
  music: Music,
  star: Star,
  headphones: Headphones,
  heart: Heart,
  mic: Mic,
};

export const ExplorePage: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-effect border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-display font-bold">发现</h1>
          </div>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="搜索音乐、用户或风格..."
              className="w-full bg-surface rounded-full pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-start/50 transition-all placeholder:text-text-secondary/50"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 py-4">
        {/* Trending Categories */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-secondary-end" />
            <h2 className="text-lg font-display font-bold">热门分类</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.slice(0, 4).map((category) => {
              const Icon = categoryIcons[category.icon] || Music;
              return (
                <div
                  key={category.id}
                  className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer card-hover group"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}40, transparent)`,
                    }}
                  />
                  <div className="relative p-4 h-full flex flex-col justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{category.name}</h3>
                      <p className="text-xs text-white/70">探索更多</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trending Music */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-display font-bold">飙升歌曲</h2>
            </div>
            <button className="text-sm text-accent font-medium">查看全部</button>
          </div>
          <div className="space-y-3">
            {feedPosts.slice(0, 4).map((post, index) => (
              <div
                key={post.id}
                className="flex items-center gap-3 bg-surface rounded-xl p-3 animate-slide-up card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                    ${index < 3 ? 'gradient-primary text-white' : 'bg-surface text-text-secondary'}
                  `}
                >
                  {index + 1}
                </span>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={post.music.cover}
                    alt={post.music.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{post.music.title}</h3>
                  <p className="text-xs text-text-secondary truncate">@{post.user.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-accent">{post.likes}</p>
                  <p className="text-xs text-text-secondary">播放</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Categories */}
        <section className="mb-6">
          <h2 className="text-lg font-display font-bold mb-4">全部分类</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface text-sm font-medium btn-press hover:bg-surface/80 transition-colors"
                style={{ borderColor: `${category.color}40`, borderWidth: 1 }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Recommended Users */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold">热门创作�?/h2>
            <button className="text-sm text-accent font-medium">查看全部</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-32 text-center cursor-pointer"
              >
                <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary-start to-secondary-end p-1">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 100}?w=100&h=100&fit=crop`}
                    alt=""
                    className="w-full h-full rounded-full object-cover bg-surface"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-sm truncate">创作者{i}</h3>
                <p className="text-xs text-text-secondary">{3.2 + i}k 粉丝</p>
              </div>
            ))}
          </div>
        </section>

        {/* For You Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold">为你推荐</h2>
            <button className="text-sm text-accent font-medium">刷新</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {feedPosts.slice(2, 4).map((post) => (
              <div
                key={post.id}
                className="bg-surface rounded-2xl overflow-hidden card-hover"
              >
                <div className="relative aspect-square">
                  <img
                    src={post.music.cover}
                    alt={post.music.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-white text-sm truncate">{post.music.title}</h3>
                    <p className="text-xs text-white/70">@{post.user.username}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{post.music.duration}</span>
                  <div className="flex items-center gap-1 text-text-secondary">
                    <Heart className="w-4 h-4" fill="currentColor" />
                    <span className="text-xs">{post.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
