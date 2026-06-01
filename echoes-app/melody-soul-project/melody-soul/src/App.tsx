import React, { useState } from 'react';
import { BottomNav } from './components/layout/BottomNav';
import { MiniPlayer } from './components/layout/MiniPlayer';
import { CreatePage } from './pages/Create';
import { ChannelPage } from './pages/Channel';
import { CapsulesPage } from './pages/Capsules';
import { ProfilePage } from './pages/Profile';
import { FriendsPage } from './pages/Friends';

function App() {
  const [activeTab, setActiveTab] = useState('channel');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  // Current playing music mock
  const currentMusic = {
    title: '雨夜思绪',
    cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
    artist: '音乐小王子',
  };

  // Render different page based on active tab
  const renderPage = () => {
    switch (activeTab) {
      case 'channel':
        return <ChannelPage />;
      case 'friends':
        return <FriendsPage />;
      case 'create':
        return <CreatePage />;
      case 'capsules':
        return <CapsulesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <ChannelPage />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary max-w-md mx-auto relative">
      {/* Background Gradient Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-start/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-end/10 rounded-full blur-3xl" />
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        {renderPage()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Mini Player (only show when not on Create page) */}
      {activeTab !== 'create' && (
        <MiniPlayer
          music={currentMusic}
          isPlaying={isPlaying}
          progress={progress}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onExpand={() => console.log('Expand player')}
        />
      )}
    </div>
  );
}

export default App;