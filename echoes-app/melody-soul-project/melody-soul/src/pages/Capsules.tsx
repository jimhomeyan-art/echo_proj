import React, { useState } from 'react';
import { Heart, Share2, Download, Inbox, Pill, Play, Pause, Filter } from 'lucide-react';
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
    <div className="min-h-screen pb-20 bg-white">
      {/* Header — 大标题，无紫色 */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="max-w-md mx-auto px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-display font-bold text-ink-900 leading-none tracking-tight">
              胶囊
            </h1>
            <p className="text-[13px] text-ink-500 mt-1.5">收藏你的音乐时光</p>
          </div>
          <button className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented control 风格 tab */}
        <div className="max-w-md mx-auto px-5 pb-3">
          <div className="flex gap-6 border-b border-ink-100">
            <button
              onClick={() => setActiveTab('saved')}
              className={`relative py-3 text-[15px] font-semibold transition-colors ${
                activeTab === 'saved' ? 'text-ink-900' : 'text-ink-500'
              }`}
            >
              我的胶囊
              {activeTab === 'saved' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-ink-900 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`relative py-3 text-[15px] font-semibold transition-colors ${
                activeTab === 'received' ? 'text-ink-900' : 'text-ink-500'
              }`}
            >
              收到的
              {activeTab === 'received' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-ink-900 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5">
        {activeTab === 'saved' && (
          <div>
            {/* Stats - kpi 大数字 */}
            <div className="grid grid-cols-3 gap-2 my-5">
              <div className="rounded-card border border-ink-100 p-4">
                <p className="text-2xl font-display font-bold text-ink-900">{capsules.length}</p>
                <p className="text-[11px] text-ink-500 mt-1">我的创作</p>
              </div>
              <div className="rounded-card border border-ink-100 p-4">
                <p className="text-2xl font-display font-bold text-ink-900">
                  {capsules.reduce((acc, c) => acc + (c.plays || 0), 0)}
                </p>
                <p className="text-[11px] text-ink-500 mt-1">总播放</p>
              </div>
              <div className="rounded-card border border-ink-100 p-4">
                <p className="text-2xl font-display font-bold text-ink-900">89</p>
                <p className="text-[11px] text-ink-500 mt-1">收藏者</p>
              </div>
            </div>

            {capsules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-ink-50 flex items-center justify-center mb-4">
                  <Pill className="w-7 h-7 text-ink-300" />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink-900">胶囊空空的</h3>
                <p className="text-sm text-ink-500 mt-1.5">在创作页点 ❤️ 把喜欢的歌收进来</p>
              </div>
            )}

            {/* 大卡片列表 */}
            <div className="space-y-4 pb-4">
              {capsules.map((capsule, index) => {
                const isCurrent = nowPlaying?.id === capsule.id;
                const showPause = isCurrent && isPlaying;
                return (
                  <div
                    key={capsule.id}
                    className="relative rounded-card overflow-hidden bg-ink-900 shadow-card animate-slide-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* 大照片 */}
                    <div className="relative aspect-[4/5] w-full">
                      <img
                        src={capsule.cover}
                        alt={capsule.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 photo-overlay" />

                      {/* 顶部右侧：心 + 时长 */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                        <span className="px-2 py-1 rounded-pill bg-black/40 backdrop-blur-sm text-[11px] text-white font-medium">
                          {capsule.duration || ''}
                        </span>
                      </div>

                      {/* 底部信息 */}
                      <div className="absolute left-4 right-4 bottom-4">
                        <div className="flex items-end justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-2xl text-white tracking-tight leading-tight truncate">
                              {capsule.title}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-wrap mt-2">
                              {capsule.mood && (
                                <span className="chip-dark">
                                  创作于「{capsule.mood}」
                                </span>
                              )}
                              {capsule.styleTag && (
                                <span className="chip-dark">{capsule.styleTag}</span>
                              )}
                            </div>
                          </div>
                          {/* 圆形大播放按钮 */}
                          <button
                            onClick={() => playCapsule(capsule)}
                            aria-label={showPause ? '暂停' : '播放'}
                            className="w-14 h-14 rounded-full bg-white text-ink-900 flex items-center justify-center shadow-pop btn-press flex-shrink-0"
                          >
                            {showPause
                              ? <Pause className="w-5 h-5" fill="currentColor" strokeWidth={0} />
                              : <Play className="w-5 h-5 ml-0.5" fill="currentColor" strokeWidth={0} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 底栏：日期 + 操作 */}
                    <div className="px-4 py-3 flex items-center justify-between bg-white">
                      <div className="text-[11px] text-ink-500">
                        {capsule.createdAt} · {capsule.plays || 0} 播放
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeCapsule(capsule.id)}
                          className="p-2 rounded-full hover:bg-ink-50 transition-colors text-tinder-flame"
                          title="从胶囊移除"
                        >
                          <Heart className="w-[18px] h-[18px]" fill="currentColor" />
                        </button>
                        <button
                          onClick={() => { playCapsule(capsule); openFullPlayer(); }}
                          className="p-2 rounded-full hover:bg-ink-50 transition-colors text-ink-900"
                          title="查看详情"
                        >
                          <Pill className="w-[18px] h-[18px]" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-ink-50 transition-colors text-ink-500">
                          <Share2 className="w-[18px] h-[18px]" />
                        </button>
                        {capsule.url && (
                          <a
                            href={capsule.url}
                            download
                            className="p-2 rounded-full hover:bg-ink-50 transition-colors text-ink-500"
                          >
                            <Download className="w-[18px] h-[18px]" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'received' && (
          <div className="space-y-4 py-5">
            {receivedCapsules.map((capsule, index) => {
              const isCurrent = nowPlaying?.id === capsule.music.id;
              const showPause = isCurrent && isPlaying;
              return (
                <div
                  key={capsule.id}
                  className="rounded-card border border-ink-100 overflow-hidden bg-white animate-slide-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Sender 顶栏 */}
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-ink-100">
                    <img
                      src={capsule.senderAvatar}
                      alt={capsule.sender}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-ink-900">{capsule.sender}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-pill bg-tinder-flame/10 text-tinder-flame font-medium">赠送</span>
                      </div>
                      <p className="text-[12px] text-ink-500 truncate">"{capsule.message}"</p>
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="flex gap-3 p-4">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-ink-100">
                      <img
                        src={capsule.music.cover}
                        alt={capsule.music.title}
                        className="w-full h-full object-cover"
                      />
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
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                          {showPause
                            ? <Pause className="w-4 h-4 text-ink-900" fill="currentColor" strokeWidth={0} />
                            : <Play className="w-4 h-4 ml-0.5 text-ink-900" fill="currentColor" strokeWidth={0} />}
                        </div>
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h3 className="font-display font-semibold text-[16px] text-ink-900 truncate">
                        {capsule.music.title}
                      </h3>
                      <p className="text-[12px] text-ink-500 mt-0.5">{capsule.music.duration}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {capsule.music.mood && (
                          <span className="chip">创作于「{capsule.music.mood}」</span>
                        )}
                      </div>
                    </div>
                    <button className="p-2 rounded-full text-ink-500 hover:text-tinder-flame self-start">
                      <Heart className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}

            {receivedCapsules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-ink-50 flex items-center justify-center mb-4">
                  <Inbox className="w-7 h-7 text-ink-300" />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink-900">暂无收到的胶囊</h3>
                <p className="text-sm text-ink-500 mt-1.5">你的朋友们正在为你准备惊喜</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
