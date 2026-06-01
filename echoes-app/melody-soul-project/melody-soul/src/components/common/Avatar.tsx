import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  hasRing?: boolean;
  gradientBorder?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  hasRing = false,
  gradientBorder = false,
}) => {
  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0
        ${gradientBorder ? 'p-0.5 bg-gradient-to-br from-primary-start to-secondary-end' : ''}
        ${hasRing ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-primary' : ''}
      `}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${gradientBorder ? 'rounded-full' : ''}`}
      />
    </div>
  );
};