import React from 'react';
import { Radio, MessageCircle, Sparkles, Pill, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'channel', icon: Radio, label: '频道' },
  { id: 'friends', icon: MessageCircle, label: '好友' },
  { id: 'create', icon: Sparkles, label: '创作', isCenter: true },
  { id: 'capsules', icon: Pill, label: '胶囊' },
  { id: 'profile', icon: User, label: '我的' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100">
      <div
        className="grid grid-cols-5 items-center max-w-md mx-auto h-16"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isCenter) {
            const centerActive = activeTab === 'create';
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center justify-center gap-0.5 h-full btn-press"
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    shadow-lg transition-all duration-300
                    ${centerActive
                      ? 'bg-primary text-white scale-110 shadow-primary/40'
                      : 'bg-gradient-to-br from-primary to-purple-500 text-white hover:scale-105'}
                  `}
                  style={{ marginTop: '-18px' }}
                >
                  <Sparkles className="w-6 h-6" strokeWidth={2.2} />
                </div>
                <span
                  className={`text-[11px] font-medium ${centerActive ? 'text-primary' : 'text-gray-500'}`}
                  style={{ marginTop: '-2px' }}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 h-full btn-press
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-gray-400'}
              `}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[11px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
