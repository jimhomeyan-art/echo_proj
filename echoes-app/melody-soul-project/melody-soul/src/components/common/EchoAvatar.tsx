import React from 'react'
import { Sparkles } from 'lucide-react'

interface EchoAvatarProps {
  size?: number
  withGlow?: boolean
  className?: string
}

/**
 * Echo 品牌头像：紫色渐变圆 + Sparkles 星星
 * 不依赖外网图片，确保品牌一致性
 */
export const EchoAvatar: React.FC<EchoAvatarProps> = ({
  size = 40,
  withGlow = false,
  className = ''
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl flex-shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        boxShadow: withGlow ? '0 0 20px rgba(99, 102, 241, 0.4)' : undefined
      }}
    >
      {/* 内层光晕 */}
      <div
        className="absolute"
        style={{
          inset: 2,
          borderRadius: 'inherit',
          background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.4) 0%, transparent 60%)'
        }}
      />
      {/* 装饰小星 */}
      <span
        className="absolute"
        style={{
          top: size * 0.18,
          right: size * 0.18,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: '#FBBF24',
          boxShadow: '0 0 6px rgba(251, 191, 36, 0.8)'
        }}
      />
      <span
        className="absolute"
        style={{
          bottom: size * 0.22,
          left: size * 0.18,
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)'
        }}
      />
      {/* 主图标 */}
      <Sparkles
        className="text-white relative z-10"
        style={{ width: size * 0.5, height: size * 0.5 }}
        strokeWidth={2}
        fill="white"
        fillOpacity={0.15}
      />
    </div>
  )
}
