import React, { useState, useEffect } from 'react';
import { Search, Bell, Send, Heart, MessageCircle, Play, TrendingUp, Wifi, WifiOff, Users, Hash } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { FeedCard } from '../components/common/FeedCard';
import { feedPosts, recommendedUsers, currentUser } from '../data/mockData';
import { useChat } from '../context/ChatContext';

export const ChannelPage: React.FC = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState(285);
  const [selectedMood, setSelectedMood] = useState('平静');
  const [activeSection, setActiveSection] = useState<'feed' | 'frequency'>('feed');
  const [resonateSubTab, setResonateSubTab] = useState<'people' | 'groups'>('people');
  const { setNowPlaying, openFullPlayer, toggleCapsule, isCapsuled, nowPlaying, isPlaying, togglePlay } = useChat();

  const moods = ['平静', '忧郁', '兴奋', '开心', '浪漫', '沉思'];

  function playPostMusic(post: typeof feedPosts[number]) {
    if (nowPlaying?.id === post.music.id) {
      togglePlay();
      return;
    }
    setNowPlaying({
      id: post.music.id,
      title: post.music.title,
      cover: post.music.cover,
      artist: post.user.name,
      url: post.music.url,
      mood: post.music.mood,
    });
  }

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

  const resonateGroups = [
    {
      id: 'g1',
      name: '深夜钢琴会客厅',
      desc: '在凌晨找钢琴的人',
      members: 327,
      online: 32,
      mood: '沉思',
      cover: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
      avatars: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
      ],
      joined: true,
    },
    {
      id: 'g2',
      name: '失眠人士同频',
      desc: '一起把夜晚熬成歌',
      members: 1568,
      online: 156,
      mood: '忧郁',
      cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
      avatars: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop',
      ],
      joined: false,
    },
    {
      id: 'g3',
      name: 'Shoegaze 朦胧吉他',
      desc: '失真之下都温柔',
      members: 894,
      online: 89,
      mood: '梦幻',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      avatars: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
      ],
      joined: false,
    },
    {
      id: 'g4',
      name: '雨天散步小屋',
      desc: '雨声 + 慢节奏',
      members: 462,
      online: 41,
      mood: '平静',
      cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      avatars: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop',
      ],
      joined: true,
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="max-w-md mx-auto px-5 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-display font-bold text-ink-900 leading-none tracking-tight">
                {activeSection === 'feed' ? '发现' : '同频'}
              </h1>
              <p className="text-[13px] text-ink-500 mt-1.5">
                {activeSection === 'feed'
                  ? '最近有人在创作什么'
                  : `${currentFrequency} Hz · 与同频者共振`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press">
                <Search className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tinder-flame" />
              </button>
            </div>
          </div>

          {/* Segmented control 切换 */}
          <div className="flex gap-6 border-b border-ink-100 mt-4">
            <button
              onClick={() => setActiveSection('feed')}
              className={`relative py-3 text-[15px] font-semibold transition-colors ${
                activeSection === 'feed' ? 'text-ink-900' : 'text-ink-500'
              }`}
            >
              动态
              {activeSection === 'feed' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-ink-900 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveSection('frequency')}
              className={`relative py-3 text-[15px] font-semibold transition-colors ${
                activeSection === 'frequency' ? 'text-ink-900' : 'text-ink-500'
              }`}
            >
              同频
              {activeSection === 'frequency' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-ink-900 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-4">
        {activeSection === 'feed' ? (
          <>
            {/* 热门 - 横滑大卡 */}
            <section className="mb-6 -mx-5">
              <div className="flex items-center justify-between mb-3 px-5">
                <h2 className="text-[18px] font-display font-bold text-ink-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  热门创作
                </h2>
                <button className="text-[13px] text-ink-500 font-medium">查看全部</button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 px-5 scrollbar-hide">
                {feedPosts.slice(0, 4).map((post) => {
                  const isCurr = nowPlaying?.id === post.music.id;
                  return (
                    <button
                      key={post.id}
                      onClick={() => playPostMusic(post)}
                      className="flex-shrink-0 w-[160px] text-left btn-press"
                    >
                      <div className="relative aspect-[4/5] rounded-card overflow-hidden bg-ink-100">
                        <img
                          src={post.music.cover}
                          alt={post.music.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 photo-overlay" />
                        <div className="absolute top-2 right-2">
                          <span className="px-1.5 py-0.5 rounded-pill bg-black/40 text-[10px] text-white">
                            {post.music.duration}
                          </span>
                        </div>
                        <div className="absolute left-3 right-3 bottom-3 flex items-end justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-display font-bold text-[15px] leading-tight truncate">
                              {post.music.title}
                            </p>
                            <p className="text-white/70 text-[11px] truncate mt-0.5">
                              {post.user.username}
                            </p>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-pop flex-shrink-0">
                            <Play
                              className="w-3.5 h-3.5 ml-0.5 text-ink-900"
                              fill="currentColor"
                              strokeWidth={0}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-2.5">❤️ {post.likes}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 最新动态 */}
            <section className="space-y-6 pb-6">
              <h2 className="text-[18px] font-display font-bold text-ink-900">最新动态</h2>
              {feedPosts.map((post, index) => {
                const isCurr = nowPlaying?.id === post.music.id;
                return (
                  <div
                    key={post.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <FeedCard
                      post={post}
                      isCurrentlyPlaying={isCurr && isPlaying}
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
                );
              })}
            </section>

            {/* 推荐关注 */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-display font-bold text-ink-900">推荐关注</h2>
                <button className="text-[13px] text-ink-500 font-medium">换一批</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recommendedUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="border border-ink-100 rounded-card p-4 animate-slide-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover mb-2"
                      />
                      <h3 className="font-semibold text-[14px] text-ink-900 truncate w-full">
                        {user.name}
                      </h3>
                      <p className="text-[11px] text-ink-500 truncate w-full">{user.username}</p>
                    </div>
                    <button className="w-full mt-3 py-2 rounded-pill bg-ink-900 text-white text-[12px] font-semibold">
                      + 关注
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Frequency Hero */}
            <div className="rounded-card border border-ink-100 p-6 mb-5">
              <div className="text-center">
                <p className="text-[12px] text-ink-500">当前情绪频率</p>
                <div className="flex items-baseline justify-center gap-2 mt-1">
                  <span className="text-[56px] font-display font-bold text-ink-900 tabular-nums leading-none">
                    {currentFrequency}
                  </span>
                  <span className="text-[18px] text-ink-500">Hz</span>
                </div>
                <p className="text-[13px] text-ink-900 mt-2 font-medium">
                  {selectedMood} · {isBroadcasting ? '广播中' : '静默'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`
                      px-3 py-1.5 rounded-pill text-[12px] font-medium btn-press transition-colors
                      ${selectedMood === mood
                        ? 'bg-ink-900 text-white'
                        : 'bg-ink-50 text-ink-500 hover:text-ink-900'}
                    `}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* 广播开关 */}
            <div className="flex items-center justify-between rounded-card border border-ink-100 p-4 mb-5">
              <div className="flex items-center gap-3">
                {isBroadcasting ? (
                  <Wifi className="w-5 h-5 text-tinder-flame" />
                ) : (
                  <WifiOff className="w-5 h-5 text-ink-500" />
                )}
                <div>
                  <p className="text-[14px] font-medium text-ink-900">广播共振</p>
                  <p className="text-[12px] text-ink-500">
                    {isBroadcasting ? '同频者可以发现你' : '已隐藏你的频率'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcasting(!isBroadcasting)}
                className={`
                  relative w-12 h-7 rounded-full transition-colors
                  ${isBroadcasting ? 'bg-ink-900' : 'bg-ink-100'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-5 h-5 rounded-full bg-white shadow
                    transition-all duration-200
                    ${isBroadcasting ? 'left-6' : 'left-1'}
                  `}
                />
              </button>
            </div>

            {/* 同频者 / 群组 子 tab */}
            <div className="mb-3">
              <div className="inline-flex p-1 rounded-pill bg-ink-50">
                <button
                  onClick={() => setResonateSubTab('people')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[13px] font-semibold transition-colors ${
                    resonateSubTab === 'people' ? 'bg-ink-900 text-white' : 'text-ink-500'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  同频者
                </button>
                <button
                  onClick={() => setResonateSubTab('groups')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[13px] font-semibold transition-colors ${
                    resonateSubTab === 'groups' ? 'bg-ink-900 text-white' : 'text-ink-500'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  兴趣群组
                </button>
              </div>
            </div>

            {/* 个人 */}
            {resonateSubTab === 'people' && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[18px] font-display font-bold text-ink-900">附近同频者</h2>
                  <span className="text-[12px] text-ink-500">{nearbyUsers.length} 人在线</span>
                </div>
                <div className="space-y-2">
                  {nearbyUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-card border border-ink-100 p-3 hover:border-ink-300 transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-pill bg-ink-900 text-white text-[10px] font-semibold">
                          {user.frequency}Hz
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] text-ink-900">{user.name}</h3>
                        <p className="text-[12px] text-ink-500">{user.mood}</p>
                      </div>
                      <button className="w-9 h-9 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center text-ink-900">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-tinder-flame/10 hover:bg-tinder-flame/20 flex items-center justify-center text-tinder-flame">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 群组 */}
            {resonateSubTab === 'groups' && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[18px] font-display font-bold text-ink-900">兴趣群组</h2>
                  <button className="text-[12px] text-ink-500 font-medium">+ 创建群</button>
                </div>
                <div className="space-y-3">
                  {resonateGroups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-card border border-ink-100 overflow-hidden hover:border-ink-300 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-ink-100">
                          <img
                            src={group.cover}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-1 left-1 right-1 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-tinder-lime" />
                            <span className="text-[9px] font-semibold text-white">
                              {group.online} 在线
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-[14.5px] text-ink-900 truncate">
                                # {group.name}
                              </h3>
                              <p className="text-[12px] text-ink-500 truncate mt-0.5">{group.desc}</p>
                            </div>
                            <button
                              className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-[12px] font-semibold btn-press transition-colors ${
                                group.joined
                                  ? 'border border-ink-100 text-ink-900 bg-white'
                                  : 'bg-ink-900 text-white'
                              }`}
                            >
                              {group.joined ? '已加入' : '加入'}
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {group.avatars.map((a, i) => (
                                <img
                                  key={i}
                                  src={a}
                                  alt=""
                                  className="w-5 h-5 rounded-full border-2 border-white object-cover"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-ink-500">
                              {group.members.toLocaleString()} 成员 · 「{group.mood}」
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full py-3.5 rounded-pill bg-ink-900 text-white font-semibold flex items-center justify-center gap-2">
              {resonateSubTab === 'people' ? (
                <>
                  <Send className="w-5 h-5" />
                  发起流星通话
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5" />
                  发现更多群组
                </>
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
};
