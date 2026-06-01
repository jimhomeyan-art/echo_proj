import React, { useState } from 'react';
import { BottomNav } from './components/layout/BottomNav';
import { MiniPlayer } from './components/layout/MiniPlayer';
import { FullPlayer } from './components/layout/FullPlayer';
import { CreatePage } from './pages/Create';
import { ChannelPage } from './pages/Channel';
import { CapsulesPage } from './pages/Capsules';
import { ProfilePage } from './pages/Profile';
import { FriendsPage } from './pages/Friends';
import { ChatProvider, useChat } from './context/ChatContext';

const TAB_PAGES: Record<string, React.ReactNode> = {
  channel: <ChannelPage />,
  friends: <FriendsPage />,
  create: <CreatePage />,
  capsules: <CapsulesPage />,
  profile: <ProfilePage />,
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('create');
  const { nowPlaying } = useChat();

  // 普通页面（非 Create / Friends 聊天）的滚动区域底部留白
  // BottomNav 64 + MiniPlayer 72(可选) + 安全距 16
  const pageBottomPadding = nowPlaying ? 152 : 80;

  return (
    <div className="min-h-screen bg-bg-primary max-w-md mx-auto relative">
      {/* Background Gradient Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* All pages stay mounted; only the active one is visible. */}
      <div className="relative z-10">
        {Object.entries(TAB_PAGES).map(([tab, node]) => {
          // Create / Friends 自己内部已经控制 fixed 输入框位置，不在这里加 padding
          const skipPadding = tab === 'create' || tab === 'friends';
          return (
            <div
              key={tab}
              style={{
                display: activeTab === tab ? 'block' : 'none',
                paddingBottom: skipPadding ? 0 : pageBottomPadding,
                transition: 'padding-bottom 0.3s ease'
              }}
            >
              {node}
            </div>
          );
        })}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* MiniPlayer 全局存在；没有 nowPlaying 时内部自己 return null */}
      <MiniPlayer />

      {/* 全屏播放器：点击 MiniPlayer 或音乐卡片时弹出 */}
      <FullPlayer />
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
