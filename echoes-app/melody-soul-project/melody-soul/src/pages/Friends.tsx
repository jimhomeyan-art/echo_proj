import React, { useState } from 'react';
import { Search, Bell, Plus, Phone, Video, MoreVertical, Send, Smile, Play, Pause } from 'lucide-react';
import { friends, chatMessages } from '../data/friendsData';
import { currentUser } from '../data/mockData';
import { useChat } from '../context/ChatContext';

export const FriendsPage: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const { nowPlaying, isPlaying, setNowPlaying, togglePlay, openFullPlayer } = useChat();

  const onlineFriends = friends.filter(f => f.status === 'online');
  const offlineFriends = friends.filter(f => f.status === 'offline');
  const totalUnread = friends.reduce((sum, f) => sum + f.unreadCount, 0);

  const friend = friends.find(f => f.id === selectedFriend);

  return (
    <div className="min-h-screen pb-20 bg-white">
      {!selectedFriend ? (
        <>
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white">
            <div className="max-w-md mx-auto px-5 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[28px] font-display font-bold text-ink-900 leading-none tracking-tight">
                    好友
                  </h1>
                  <p className="text-[13px] text-ink-500 mt-1.5">{friends.length} 位好友</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press relative">
                    <Bell className="w-4 h-4" />
                    {totalUnread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-tinder-flame text-white text-[10px] font-semibold flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                  </button>
                  <button className="w-10 h-10 rounded-full bg-ink-900 text-white flex items-center justify-center btn-press">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                <input
                  type="text"
                  placeholder="搜索好友..."
                  className="w-full pl-10 pr-4 py-2.5 bg-ink-50 rounded-pill text-[14px] text-ink-900 placeholder:text-ink-300 focus:bg-white focus:ring-1 focus:ring-ink-900 outline-none transition-all"
                />
              </div>
            </div>
          </header>

          {/* List */}
          <main className="max-w-md mx-auto px-5 pt-3">
            {onlineFriends.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[12px] font-semibold text-ink-500 mb-2 px-1">
                  在线 · {onlineFriends.length}
                </h2>
                <div className="space-y-1">
                  {onlineFriends.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFriend(f.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tinder-lime border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] text-ink-900">{f.name}</h3>
                        <p className="text-[12px] text-ink-500 truncate">{f.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[11px] text-ink-300">{f.lastMessageTime}</span>
                        {f.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-tinder-flame text-white text-[10px] font-semibold flex items-center justify-center">
                            {f.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {offlineFriends.length > 0 && (
              <section>
                <h2 className="text-[12px] font-semibold text-ink-500 mb-2 px-1">
                  离线 · {offlineFriends.length}
                </h2>
                <div className="space-y-1">
                  {offlineFriends.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFriend(f.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-12 h-12 rounded-full object-cover opacity-70"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-ink-300 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] text-ink-900">{f.name}</h3>
                        <p className="text-[12px] text-ink-500 truncate">{f.lastMessage}</p>
                      </div>
                      <span className="text-[11px] text-ink-300 flex-shrink-0">{f.lastMessageTime}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </main>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-ink-100">
            <div className="max-w-md mx-auto px-3 py-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedFriend(null)}
                className="p-2 rounded-full hover:bg-ink-50 text-ink-900"
                aria-label="返回"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={friend?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    friend?.status === 'online' ? 'bg-tinder-lime' : 'bg-ink-300'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h1 className="font-semibold text-[15px] text-ink-900 truncate">{friend?.name}</h1>
                  <p className="text-[11px] text-ink-500">
                    {friend?.status === 'online' ? '在线' : '离线'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button className="p-2 rounded-full hover:bg-ink-50 text-ink-900">
                  <Phone className="w-[18px] h-[18px]" />
                </button>
                <button className="p-2 rounded-full hover:bg-ink-50 text-ink-900">
                  <Video className="w-[18px] h-[18px]" />
                </button>
                <button className="p-2 rounded-full hover:bg-ink-50 text-ink-500">
                  <MoreVertical className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </header>

          {/* Messages */}
          <main
            className="max-w-md mx-auto px-4 py-4 transition-[padding] duration-300"
            style={{ paddingBottom: nowPlaying ? '220px' : '150px' }}
          >
            <div className="space-y-3">
              {(chatMessages[selectedFriend] || []).map((msg) => {
                const isMe = msg.senderId === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[78%]">
                      {msg.type === 'text' ? (
                        <div className={`px-3.5 py-2 rounded-2xl ${
                          isMe
                            ? 'bg-echo-green text-white rounded-br-md'
                            : 'bg-ink-50 text-ink-900 rounded-bl-md'
                        }`}>
                          <p className="text-[14px] leading-relaxed">{msg.content}</p>
                        </div>
                      ) : msg.type === 'music' ? (
                        <div className={`bg-white border border-ink-100 rounded-card overflow-hidden ${
                          isMe ? 'rounded-br-md' : 'rounded-bl-md'
                        }`}>
                          <div className="flex items-center gap-3 p-2.5">
                            <div
                              className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 bg-ink-100"
                              onClick={() => {
                                if (!msg.music) return;
                                setNowPlaying({
                                  id: msg.music.id,
                                  title: msg.music.title,
                                  cover: msg.music.cover,
                                  artist: friend?.name,
                                  url: msg.music.url,
                                  mood: msg.music.mood,
                                });
                                openFullPlayer();
                              }}
                            >
                              <img src={msg.music?.cover} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-ink-900 truncate">{msg.music?.title}</p>
                              <p className="text-[11px] text-ink-500">{msg.music?.duration}</p>
                            </div>
                            <button
                              onClick={() => {
                                if (!msg.music) return;
                                const isCurrent = nowPlaying?.id === msg.music.id;
                                if (isCurrent) {
                                  togglePlay();
                                } else {
                                  setNowPlaying({
                                    id: msg.music.id,
                                    title: msg.music.title,
                                    cover: msg.music.cover,
                                    artist: friend?.name,
                                    url: msg.music.url,
                                    mood: msg.music.mood,
                                  });
                                }
                              }}
                              className="w-10 h-10 rounded-full bg-echo-green flex items-center justify-center btn-press flex-shrink-0"
                              aria-label="播放"
                            >
                              {nowPlaying?.id === msg.music?.id && isPlaying
                                ? <Pause className="w-3.5 h-3.5 text-ink-900" fill="currentColor" strokeWidth={0} />
                                : <Play className="w-3.5 h-3.5 ml-0.5 text-ink-900" fill="currentColor" strokeWidth={0} />}
                            </button>
                          </div>
                        </div>
                      ) : null}
                      <p className={`text-[10px] text-ink-300 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Input */}
          <div
            className="fixed left-0 right-0 z-40 bg-white border-t border-ink-100 transition-[bottom] duration-300"
            style={{ bottom: nowPlaying ? 'calc(64px + 72px)' : '64px' }}
          >
            <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-500 hover:text-ink-900 btn-press">
                <Smile className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="发送消息..."
                className="flex-1 px-4 py-2.5 bg-ink-50 rounded-pill text-[14px] text-ink-900 placeholder:text-ink-300 focus:bg-white focus:ring-1 focus:ring-ink-900 outline-none transition-all"
              />
              <button
                disabled={!message.trim()}
                aria-label="发送"
                className={`w-10 h-10 rounded-full flex items-center justify-center btn-press ${
                  message.trim() ? 'bg-tinder-flame text-white shadow-flame' : 'bg-ink-100 text-ink-300'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
