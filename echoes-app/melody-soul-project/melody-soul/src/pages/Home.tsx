import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { FeedCard } from '../components/common/FeedCard';
import { UserCard } from '../components/common/UserCard';
import { feedPosts, recommendedUsers, currentUser } from '../data/mockData';

interface HomePageProps {
  onNavigate?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen pb-20 bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" gradientBorder />
            <div>
              <h1 className="text-lg font-display font-bold text-text-primary">MelodySoul</h1>
              <p className="text-xs text-text-secondary">欢迎回来，{currentUser.name}</p>
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
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 py-4">
        {/* Stories Section */}
        <section className="mb-6">
          <h2 className="text-lg font-display font-bold mb-4 text-text-primary">音乐故事</h2>
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
            <h2 className="text-lg font-display font-bold text-text-primary">热门创作</h2>
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
          <h2 className="text-lg font-display font-bold text-text-primary">最新动�?/h2>
          {feedPosts.map((post, index) => (
            <div
              key={post.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FeedCard
                post={post}
                onLike={() => console.log('Like', post.id)}
                onComment={() => console.log('Comment', post.id)}
                onShare={() => console.log('Share', post.id)}
                onPlay={() => console.log('Play', post.id)}
              />
            </div>
          ))}
        </section>

        {/* Recommended Users */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-text-primary">推荐关注</h2>
            <button className="text-sm text-primary font-medium">换一�?/button>
          </div>
          <div className="space-y-3">
            {recommendedUsers.map((user, index) => (
              <div
                key={user.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <UserCard
                  user={user}
                  onFollow={() => console.log('Follow', user.id)}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
