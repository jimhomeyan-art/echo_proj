import React from 'react'

interface EchoAvatarProps {
  size?: number
  withGlow?: boolean
  /** 'dark' = 黑底白纹（默认），'light' = 白底黑纹 */
  variant?: 'dark' | 'light'
  className?: string
}

/**
 * Echo 品牌头像：抽象"回响"glyph
 * 一个声源点 + 3 道扩散弧线，象征 Echoes (回响)
 * 极简单色，不依赖外网图片
 */
export const EchoAvatar: React.FC<EchoAvatarProps> = ({
  size = 40,
  withGlow = false,
  variant = 'dark',
  className = ''
}) => {
  const isDark = variant === 'dark'
  const bg = isDark ? '#0B0B0F' : '#FFFFFF'
  const fg = isDark ? '#FFFFFF' : '#0B0B0F'
  const border = isDark ? 'transparent' : '#E6E7EB'

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full flex-shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: withGlow ? '0 0 24px rgba(254, 60, 114, 0.35)' : undefined
      }}
    >
      <svg
        viewBox="0 0 40 40"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke={fg}
        strokeWidth={2}
        strokeLinecap="round"
      >
        {/* 中心声源点 */}
        <circle cx="14" cy="20" r="2" fill={fg} stroke="none" />
        {/* 三道扩散弧线 */}
        <path d="M19 14 Q24 20 19 26" opacity={0.95} />
        <path d="M24 11 Q31 20 24 29" opacity={0.65} />
        <path d="M29 8 Q38 20 29 32" opacity={0.35} />
      </svg>
    </div>
  )
}
