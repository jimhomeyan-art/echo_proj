import React from 'react';
import { Music, Heart, ListMusic, Clock, Play, MoreHorizontal, Folder, Plus } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { myLibrary, currentUser } from '../data/mockData';

type TabType = 'created' | 'liked' | 'playlists';

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('created');
  const [selectedSong, setSelectedSong] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-effect border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-display font-bold">音乐库</h1>
            <button className="p-2 rounded-xl bg-surface text-text-secondary hover:text-text-primary transition-colors btn-press">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* User Stats */}
          <div className="flex items-center gap-4 mb-4">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" gradientBorder />
            <div className="flex-1">
              <h2 className="font-semibold">{currentUser.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                <span><strong className="text-text-primary">{currentUser.songs}</strong> 作品</span>
                <span><strong className="text-text-primary">{currentUser.likes}</strong> 获赞</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'created' as TabType, icon: Music, label: '我的创作' },
              { id: 'liked' as TabType, icon: Heart, label: '收藏' },
              { id: 'playlists' as TabType, icon: ListMusic, label: '歌单' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-300 btn-press
                    ${isActive
                      ? 'gradient-primary text-white'
                      : 'bg-surface text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 py-4">
        {/* Created Tab */}
        {activeTab === 'created' && (
          <div className="space-y-4">
            {myLibrary.created.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 bg-surface rounded-2xl p-4 animate-slide-up card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedSong(selectedSong === song.id ? null : song.id)}
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedSong === song.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" fill="white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{song.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                    <span>{song.duration}</span>
                    <span>·</span>
                    <span>{song.plays} 次播放</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    创建于 {song.createdAt}
                  </p>
                </div>
                <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Liked Tab */}
        {activeTab === 'liked' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">共 {myLibrary.liked.length} 首收藏</span>
            </div>
            {myLibrary.liked.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 bg-surface rounded-2xl p-4 animate-slide-up card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{song.title}</h3>
                  <p className="text-xs text-text-secondary truncate">{song.artist}</p>
                  <p className="text-xs text-text-secondary mt-1">{song.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-secondary-end" fill="currentColor" />
                  <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="space-y-4">
            {/* Create New Playlist */}
            <button className="w-full flex items-center gap-4 bg-surface/50 rounded-2xl p-4 border-2 border-dashed border-white/10 hover:border-accent/50 transition-colors btn-press">
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
                <Plus className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-medium">创建新歌单</span>
            </button>

            {myLibrary.playlists.map((playlist, index) => (
              <div
                key={playlist.id}
                className="flex items-center gap-4 bg-surface rounded-2xl p-4 animate-slide-up card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-start/30 to-secondary-end/30 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-primary-start" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{playlist.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">{playlist.count} 首歌曲</p>
                </div>
                <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recently Played */}
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-text-secondary" />
            <h2 className="text-lg font-display font-bold">最近播放</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-32 bg-surface rounded-xl overflow-hidden card-hover"
              >
                <div className="relative aspect-square">
                  <img
                    src={`https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">最近播放{i}</p>
                  <p className="text-xs text-text-secondary truncate">刚才</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};