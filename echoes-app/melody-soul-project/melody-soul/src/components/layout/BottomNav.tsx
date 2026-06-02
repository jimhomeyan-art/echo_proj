import React from 'react';
import { Radio, MessageCircle, Pill, User, Music2 } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'channel', icon: Radio, label: '频道' },
  { id: 'friends', icon: MessageCircle, label: '好友' },
  { id: 'create', icon: Music2, label: '创作', isCenter: true },
  { id: 'capsules', icon: Pill, label: '胶囊' },
  { id: 'profile', icon: User, label: '我的' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ink-100">
      <div
        className="flex items-center justify-around max-w-md mx-auto h-[64px] px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          // 中间创作按钮：纯黑大圆 + 白色音符
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-label={item.label}
                className="flex items-center justify-center btn-press"
                style={{ marginTop: '-22px' }}
              >
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    bg-ink-900 text-white shadow-pop
                    transition-transform duration-300
                    ${isActive ? 'scale-105 ring-2 ring-ink-900/10 ring-offset-2 ring-offset-white' : 'hover:scale-105'}
                  `}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.2} />
                </div>
              </button>
            );
          }

          // 普通 tab：active 时整块变黑 pill（icon + label 同色）
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-pill btn-press
                transition-colors duration-200
                ${isActive
                  ? 'bg-ink-900 text-white'
                  : 'text-ink-500 hover:text-ink-900'}
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
              {isActive && (
                <span className="text-[12px] font-semibold whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
