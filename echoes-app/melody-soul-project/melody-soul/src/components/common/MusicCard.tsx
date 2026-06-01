import React from 'react';
import { Play, Pause, MoreHorizontal } from 'lucide-react';

interface MusicCardProps {
  id: string;
  title: string;
  cover: string;
  duration: string;
  artist?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onMore?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MusicCard: React.FC<MusicCardProps> = ({
  id,
  title,
  cover,
  duration,
  artist,
  isPlaying = false,
  onPlay,
  onMore,
  size = 'md',
}) => {
  const sizeConfig = {
    sm: { cover: 'w-20 h-20', button: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { cover: 'w-28 h-28', button: 'w-10 h-10', icon: 'w-5 h-5' },
    lg: { cover: 'w-full aspect-square', button: 'w-14 h-14', icon: 'w-6 h-6' },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`
        ${size === 'lg' ? 'relative' : 'flex gap-3'}
        group card-hover
      `}
    >
      {/* Cover */}
      <div
        className={`
          ${config.cover} ${size === 'lg' ? 'rounded-2xl' : 'rounded-xl'}
          relative overflow-hidden bg-white flex-shrink-0 shadow-soft
        `}
      >
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Play Button */}
        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className={`
              absolute ${size === 'lg' ? 'bottom-3 right-3' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}
              ${config.button} rounded-full gradient-primary
              flex items-center justify-center shadow-primary
              transition-all duration-300 btn-press
              ${isPlaying ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 group-hover:scale-100'}
            `}
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full music-wave"
                    style={{ height: '12px' }}
                  />
                ))}
              </div>
            ) : (
              <Play className={`${config.icon} ml-0.5`} fill="white" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      {size !== 'lg' && (
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h3 className="font-semibold text-sm truncate text-text-primary">{title}</h3>
          {artist && (
            <p className="text-xs text-text-secondary truncate mt-0.5">{artist}</p>
          )}
          <p className="text-xs text-text-muted mt-1">{duration}</p>
        </div>
      )}

      {/* Size lg title */}
      {size === 'lg' && (
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-sm text-white truncate">{title}</h3>
        </div>
      )}

      {/* More Button */}
      {onMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMore();
          }}
          className={`
            absolute ${size === 'lg' ? 'top-3 right-3' : 'right-0 top-1/2 -translate-y-1/2'}
            p-2 rounded-full bg-black/30 text-white
            opacity-0 group-hover:opacity-100 transition-opacity
          `}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};