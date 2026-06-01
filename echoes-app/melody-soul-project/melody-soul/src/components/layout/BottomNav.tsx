import React from 'react';
import { Radio, MessageCircle, Sparkles, Mic2, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const leftItems = [
  { id: 'channel', icon: Radio, label: '频道' },
  { id: 'friends', icon: MessageCircle, label: '好友' },
];

const rightItems = [
  { id: 'capsules', icon: Mic2, label: '胶囊' },
  { id: 'profile', icon: User, label: '我的' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const isCreateActive = activeTab === 'create';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100">
      <div className="flex items-center justify-between h-20 max-w-md mx-auto px-2">
        {/* Left items */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {leftItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                  transition-all duration-300 btn-press
                  ${isActive ? 'text-primary' : 'text-gray-400'}
                `}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center create button */}
        <div className="relative flex-shrink-0 mx-1" style={{ marginBottom: '16px' }}>
          <button
            key="create"
            onClick={() => onTabChange('create')}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              shadow-lg transition-all duration-300 btn-press
              ${isCreateActive
                ? 'bg-primary text-white scale-110 shadow-primary/40'
                : 'bg-gradient-to-br from-primary to-purple-500 text-white hover:scale-105 hover:shadow-xl hover:shadow-primary/30'
              }
            `}
          >
            <Sparkles className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Right items */}
        <div className="flex items-center gap-2 flex-1">
          {rightItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                  transition-all duration-300 btn-press
                  ${isActive ? 'text-primary' : 'text-gray-400'}
                `}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
