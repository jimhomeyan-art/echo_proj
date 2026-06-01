import React, { useState } from 'react';
import { Heart, Share2, Download, MoreHorizontal, Music, Inbox, ArrowDownToLine, Pill, Play, Pause } from 'lucide-react';
import { useChat, type CapsuleEntry } from '../context/ChatContext';
import { receivedCapsules } from '../data/mockData';

type CapsuleTab = 'saved' | 'received';

export const CapsulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CapsuleTab>('saved');
  const {
    capsules,
    removeCapsule,
    nowPlaying,
    isPlaying,
    setNowPlaying,
    togglePlay,
    openFullPlayer,
  } = useChat();

  function playCapsule(c: CapsuleEntry) {
    if (nowPlaying?.id === c.id) {
      togglePlay();
      return;
    }
    setNowPlaying({
      id: c.id,
      title: c.title,
      cover: c.cover,
      artist: c.creator || 'Echoes AI',
      url: c.url,
      lyrics: c.lyrics,
      creator: c.creator,
      mood: c.mood,
    });
  }

  return (
    <div className="min-h-screen pb-20 bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-text-primary">胶囊</h1>
          </div>
          <p className="text-xs text-text-secondary mt-1">收藏你的音乐时光</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-5 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm
              transition-all duration-300 btn-press
              ${activeTab === 'saved'
                ? 'gradient-primary text-white shadow-primary'
                : 'bg-gray-100 text-text-secondary hover:text-text-primary'
              }
            `}
          >
            <Pill className="w-5 h-5" />
            我的胶囊
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm
              transition-all duration-300 btn-press
              ${activeTab === 'received'
                ? 'gradient-primary text-white shadow-primary'
                : 'bg-gray-100 text-text-secondary hover:text-text-primary'
              }
            `}
          >
            <ArrowDownToLine className="w-5 h-5" />
            收到的
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-md mx-auto px-5 pb-4">
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 text-center shadow-soft">
                <p className="text-2xl font-bold text-gradient-primary">{capsules.length}</p>
                <p className="text-xs text-text-secondary mt-1">我的创作</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-soft">
                <p className="text-2xl font-bold text-primary">
                  {capsules.reduce((acc, c) => acc + (c.plays || 0), 0)}
                </p>
                <p className="text-xs text-text-secondary mt-1">总播放</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-soft">
                <p className="text-2xl font-bold text-success">89</p>
                <p className="text-xs text-text-secondary mt-1">收藏者</p>
              </div>
            </div>

            {capsules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Pill className="w-10 h-10 text-text-secondary" />
                </div>
                <h3 className="font-medium text-lg text-text-primary">胶囊空空的</h3>
                <p className="text-sm text-text-secondary mt-2">
                  在创作页点 ❤️ 把喜欢的歌收进来
                </p>
              </div>
            )}

            {/* Capsule List */}
            {capsules.map((capsule, index) => {
              const isCurrent = nowPlaying?.id === capsule.id;
              const showPause = isCurrent && isPlaying;
              return (
                <div
                  key={capsule.id}
                  className="bg-white rounded-2xl overflow-hidden animate-slide-up card-hover shadow-soft"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Cover */}
                  <div className="relative aspect-video">
                    <img
                      src={capsule.cover}
                      alt={capsule.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Play Button */}
                    <button
                      onClick={() => playCapsule(capsule)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-primary opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                        {showPause
                          ? <Pause className="w-7 h-7 text-white" fill="white" />
                          : <Play className="w-7 h-7 text-white ml-1" fill="white" />}
                      </div>
                    </button>

                    {/* Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                      <h3 className="font-semibold text-lg text-white">{capsule.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {capsule.mood && (
                          <span className="text-xs text-white/90 px-2 py-0.5 rounded-full bg-primary/40">
                            创作于「{capsule.mood}」
                          </span>
                        )}
                        {capsule.styleTag && (
                          <span className="text-xs text-white/90 px-2 py-0.5 rounded-full bg-primary/40">
                            {capsule.styleTag}
                          </span>
                        )}
                        <span className="text-xs text-white/70 ml-auto">{capsule.duration}</span>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 text-xs text-white pointer-events-none">
                      {capsule.duration || ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-text-secondary">{capsule.createdAt}</span>
                      <span className="text-xs text-text-secondary">{capsule.plays || 0} 播放</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeCapsule(capsule.id)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-secondary"
                        title="从胶囊移除"
                      >
                        <Heart className="w-5 h-5" fill="currentColor" />
                      </button>
                      <button
                        onClick={() => { playCapsule(capsule); openFullPlayer(); }}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="查看详情"
                      >
                        <Music className="w-5 h-5 text-primary" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <Share2 className="w-5 h-5 text-text-secondary" />
                      </button>
                      {capsule.url && (
                        <a
                          href={capsule.url}
                          download
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Download className="w-5 h-5 text-text-secondary hover:text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedCapsules.map((capsule, index) => {
              const isCurrent = nowPlaying?.id === capsule.music.id;
              const showPause = isCurrent && isPlaying;
              return (
                <div
                  key={capsule.id}
                  className="bg-white rounded-2xl overflow-hidden animate-slide-up card-hover shadow-soft"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Sender Info */}
                  <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                    <img
                      src={capsule.senderAvatar}
                      alt={capsule.sender}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text-primary">{capsule.sender}</span>
                        <span className="text-xs text-primary px-2 py-0.5 rounded-full bg-primary/10">赠送</span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">"{capsule.message}"</p>
                    </div>
                  </div>

                  {/* Capsule Content */}
                  <div className="flex gap-4 p-4">
                    {/* Cover */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-soft">
                      <img
                        src={capsule.music.cover}
                        alt={capsule.music.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <button
                        onClick={() => {
                          if (isCurrent) {
                            togglePlay();
                          } else {
                            setNowPlaying({
                              id: capsule.music.id,
                              title: capsule.music.title,
                              cover: capsule.music.cover,
                              artist: capsule.sender,
                              url: capsule.music.url,
                              mood: capsule.music.mood,
                            });
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center group"
                      >
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-primary group-hover:scale-110 transition-transform">
                          {showPause
                            ? <Pause className="w-4 h-4 text-white" fill="white" />
                            : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
                        </div>
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-semibold text-sm text-text-primary">{capsule.music.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-text-secondary">{capsule.music.duration}</span>
                        {capsule.music.mood && (
                          <>
                            <span className="text-xs text-text-secondary">·</span>
                            <span className="text-xs text-primary">创作于「{capsule.music.mood}」</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-2">点击收听这个胶囊</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-2">
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <Heart className="w-5 h-5 text-text-secondary" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {receivedCapsules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Inbox className="w-10 h-10 text-text-secondary" />
                </div>
                <h3 className="font-medium text-lg text-text-primary">暂无收到的胶囊</h3>
                <p className="text-sm text-text-secondary mt-2">你的朋友们正在为你准备惊喜</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
