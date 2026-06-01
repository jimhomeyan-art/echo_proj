import React, { useState } from 'react';
import { Search, Bell, Plus, Phone, Video, MoreVertical, Send, Smile } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { friends, chatMessages } from '../data/friendsData';
import { currentUser } from '../data/mockData';
import { useChat } from '../context/ChatContext';

export const FriendsPage: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const { nowPlaying } = useChat();

  const onlineFriends = friends.filter(f => f.status === 'online');
  const offlineFriends = friends.filter(f => f.status === 'offline');
  const totalUnread = friends.reduce((sum, f) => sum + f.unreadCount, 0);

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <div className="min-h-screen pb-20 bg-bg-primary">
      {!selectedFriend ? (
        <>
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
            <div className="max-w-md mx-auto px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" gradientBorder />
                  <div>
                    <h1 className="text-xl font-display font-bold text-text-primary">好友</h1>
                    <p className="text-xs text-text-secondary">{friends.length} 位好友</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl bg-gray-100 text-text-secondary hover:text-text-primary transition-colors btn-press relative">
                    <Bell className="w-5 h-5" />
                    {totalUnread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-white text-xs flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                  </button>
                  <button className="p-2 rounded-xl bg-primary text-white transition-colors btn-press">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="搜索好友..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-md mx-auto px-5 py-4">
            {/* Online Friends */}
            {onlineFriends.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-text-secondary">在线 · {onlineFriends.length}</h2>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
                  {onlineFriends.map((friend, index) => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend.id)}
                      className={`
                        flex items-center gap-3 p-4 cursor-pointer
                        hover:bg-gray-50 transition-colors
                        ${index !== 0 ? 'border-t border-gray-50' : ''}
                      `}
                    >
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${getStatusColor(friend.status)} border-2 border-white`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary">{friend.name}</h3>
                        <p className="text-sm text-text-secondary truncate">{friend.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-text-muted">{friend.lastMessageTime}</span>
                        {friend.unreadCount > 0 && (
                          <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-secondary text-white text-xs flex items-center justify-center">
                            {friend.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Offline Friends */}
            {offlineFriends.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-text-secondary">离线 · {offlineFriends.length}</h2>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
                  {offlineFriends.map((friend, index) => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend.id)}
                      className={`
                        flex items-center gap-3 p-4 cursor-pointer
                        hover:bg-gray-50 transition-colors
                        ${index !== 0 ? 'border-t border-gray-50' : ''}
                      `}
                    >
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full object-cover opacity-70"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${getStatusColor(friend.status)} border-2 border-white`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary">{friend.name}</h3>
                        <p className="text-sm text-text-secondary truncate">{friend.lastMessage}</p>
                      </div>
                      <span className="text-xs text-text-muted">{friend.lastMessageTime}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
            <div className="max-w-md mx-auto px-5 py-3 flex items-center gap-3">
              <button
                onClick={() => setSelectedFriend(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <img
                    src={friends.find(f => f.id === selectedFriend)?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(friends.find(f => f.id === selectedFriend)?.status || 'offline')} border-2 border-white`} />
                </div>
                <div>
                  <h1 className="font-medium text-text-primary">{friends.find(f => f.id === selectedFriend)?.name}</h1>
                  <p className="text-xs text-text-secondary">
                    {friends.find(f => f.id === selectedFriend)?.status === 'online' ? '在线' : '离线'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-primary">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-primary">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>
          </header>

          {/* Chat Messages */}
          <main
            className="max-w-md mx-auto px-5 py-4 transition-[padding] duration-300"
            style={{ paddingBottom: nowPlaying ? '220px' : '150px' }}
          >
            <div className="space-y-4">
              {(chatMessages[selectedFriend] || []).map((msg) => {
                const isMe = msg.senderId === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                      {msg.type === 'text' ? (
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-white text-text-primary rounded-bl-md shadow-soft'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ) : msg.type === 'music' ? (
                        <div className={`bg-white rounded-2xl overflow-hidden shadow-soft ${
                          isMe ? 'rounded-br-md' : 'rounded-bl-md'
                        }`}>
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                              <img
                                src={msg.music?.cover}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{msg.music?.title}</p>
                              <p className="text-xs text-text-secondary">{msg.music?.duration}</p>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : null}
                      <p className={`text-xs text-text-muted mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Message Input - 在 BottomNav(64px) 上方，MiniPlayer 显示时再上推 72px */}
          <div
            className="fixed left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-soft transition-[bottom] duration-300"
            style={{ bottom: nowPlaying ? 'calc(64px + 72px)' : '64px' }}
          >
            <div className="max-w-md mx-auto px-5 py-3">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <Smile className="w-6 h-6 text-text-secondary" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="发送消息..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <button className="p-2 rounded-full gradient-primary btn-press shadow-primary">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
