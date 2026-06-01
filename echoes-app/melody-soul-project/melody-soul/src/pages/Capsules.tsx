import React, { useState } from 'react';
import { Heart, Share2, Download, MoreHorizontal, Music, Inbox, ArrowDownToLine } from 'lucide-react';

type CapsuleTab = 'saved' | 'received';

export const CapsulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CapsuleTab>('saved');

  const savedCapsules = [
    {
      id: '1',
      title: '雨夜思绪',
      cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      duration: '4:15',
      createdAt: '2024-01-15',
      plays: 2345,
      mood: '忧郁',
      style: '钢琴',
    },
    {
      id: '2',
      title: '都市漫游',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      duration: '3:56',
      createdAt: '2024-01-12',
      plays: 1892,
      mood: '平静',
      style: '电子',
    },
    {
      id: '3',
      title: '星空漫步',
      cover: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
      duration: '5:22',
      createdAt: '2024-01-10',
      plays: 3421,
      mood: '沉思',
      style: '氛围',
    },
  ];

  const receivedCapsules = [
    {
      id: 'r1',
      sender: '星空旋律',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      title: '深海低语',
      cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
      duration: '4:33',
      message: '送给你，愿你找到内心的平静',
      mood: '平静',
    },
    {
      id: 'r2',
      sender: '电子精灵',
      senderAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
      title: '赛博梦境',
      cover: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop',
      duration: '3:58',
      message: '和你分享这个节奏',
      mood: '兴奋',
    },
    {
      id: 'r3',
      sender: '月光咖啡馆',
      senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      title: '午后时光',
      cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
      duration: '5:01',
      message: '这杯咖啡送给你 🍵',
      mood: '浪漫',
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4">
          <h1 className="text-2xl font-display font-bold text-text-primary">胶囊</h1>
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
            <Inbox className="w-5 h-5" />
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
                <p className="text-2xl font-bold text-gradient-primary">{savedCapsules.length}</p>
                <p className="text-xs text-text-secondary mt-1">我的创作</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-soft">
                <p className="text-2xl font-bold text-primary">
                  {savedCapsules.reduce((acc, c) => acc + c.plays, 0)}
                </p>
                <p className="text-xs text-text-secondary mt-1">总播放</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-soft">
                <p className="text-2xl font-bold text-success">89</p>
                <p className="text-xs text-text-secondary mt-1">收藏者</p>
              </div>
            </div>

            {/* Capsule List */}
            {savedCapsules.map((capsule, index) => (
              <div
                key={capsule.id}
                className="bg-white rounded-2xl overflow-hidden animate-slide-up card-hover shadow-soft"
                style={{ animationDelay: `${index * 100}ms` }}
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-primary opacity-80 hover:opacity-100 transition-opacity">
                      <Music className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-lg text-white">{capsule.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/90 px-2 py-0.5 rounded-full bg-primary/40">
                        {capsule.mood}
                      </span>
                      <span className="text-xs text-white/90 px-2 py-0.5 rounded-full bg-primary/40">
                        {capsule.style}
                      </span>
                      <span className="text-xs text-white/70 ml-auto">{capsule.duration}</span>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 text-xs text-white">
                    {capsule.duration}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-secondary">{capsule.createdAt}</span>
                    <span className="text-xs text-text-secondary">{capsule.plays} 播放</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Heart className="w-5 h-5 text-text-secondary hover:text-secondary" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Share2 className="w-5 h-5 text-text-secondary" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Download className="w-5 h-5 text-text-secondary hover:text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedCapsules.map((capsule, index) => (
              <div
                key={capsule.id}
                className="bg-white rounded-2xl overflow-hidden animate-slide-up card-hover shadow-soft"
                style={{ animationDelay: `${index * 100}ms` }}
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
                      src={capsule.cover}
                      alt={capsule.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-primary">
                        <Music className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-semibold text-sm text-text-primary">{capsule.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-secondary">{capsule.duration}</span>
                      <span className="text-xs text-text-secondary">·</span>
                      <span className="text-xs text-primary">{capsule.mood}</span>
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
            ))}

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