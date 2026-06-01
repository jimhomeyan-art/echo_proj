import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronUp } from 'lucide-react';

interface MiniPlayerProps {
  music: {
    title: string;
    cover: string;
    artist?: string;
  };
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  music,
  isPlaying,
  progress,
  onPlayPause,
  onExpand,
}) => {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 glass-effect border-t border-white/5">
      <div
        className="max-w-md mx-auto p-3 flex items-center gap-3 cursor-pointer btn-press"
        onClick={onExpand}
      >
        {/* Album Cover */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={music.cover}
            alt={music.title}
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-accent rounded-full music-wave"
                    style={{ height: `${Math.random() * 16 + 8}px` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Song Info & Progress */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{music.title}</p>
          <p className="text-xs text-text-secondary truncate">
            {music.artist || 'MelodySoul AI'}
          </p>
          {/* Progress Bar */}
          <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Previous track
            }}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="p-3 rounded-full gradient-primary btn-press"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" fill="white" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" fill="white" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Next track
            }}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Expand Button */}
        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};