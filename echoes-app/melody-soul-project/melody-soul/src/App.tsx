import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNav } from './components/layout/BottomNav';
import { MiniPlayer } from './components/layout/MiniPlayer';
import { FullPlayer } from './components/layout/FullPlayer';
import { CreatePage } from './pages/Create';
import { ChannelPage } from './pages/Channel';
import { CapsulesPage } from './pages/Capsules';
import { ProfilePage } from './pages/Profile';
import { FriendsPage } from './pages/Friends';
import { LoginPage } from './pages/Login';
import { ChatProvider, useChat } from './context/ChatContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IMProvider, useIM } from './context/IMContext';
import { SharePage } from './pages/SharePage';

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
  const { totalUnread } = useIM();

  // 普通页面（非 Create / Friends 聊天）的滚动区域底部留白
  // BottomNav 64 + MiniPlayer 72(可选) + 安全距 16
  const pageBottomPadding = nowPlaying ? 152 : 80;

  return (
    <div className="min-h-screen bg-[#F2F3F5] max-w-md mx-auto relative">
      {/* Background Gradient Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-echo-green/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-echo-green/5 rounded-full blur-3xl" />
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

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} unreadCount={totalUnread} />

      {/* MiniPlayer 全局存在；没有 nowPlaying 时内部自己 return null */}
      <MiniPlayer />

      {/* 全屏播放器：点击 MiniPlayer 或音乐卡片时弹出 */}
      <FullPlayer />
    </div>
  );
}

function App() {
  // 公开落地页：分享链接，无需登录
  if (window.location.pathname === '/s') {
    return <SharePage />;
  }
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

// 登录门禁：未登录 → 登录页；加载中 → loading；已登录 → 主应用
function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F3F5] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-echo-green animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <ChatProvider>
      <IMProvider>
        <AppContent />
      </IMProvider>
    </ChatProvider>
  );
}

export default App;
