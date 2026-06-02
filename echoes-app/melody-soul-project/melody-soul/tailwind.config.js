/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Indigo（保留作为品牌色，但克制使用）
          light: '#818CF8',
          dark: '#4F46E5',
        },
        secondary: {
          DEFAULT: '#EC4899',
          light: '#F472B6',
          dark: '#DB2777',
        },
        // Tinder-style 强对比配色
        tinder: {
          flame: '#FE3C72',   // 主操作色（爱心 / CTA）
          lime:  '#A6FF59',   // 强调（喜欢）
          super: '#42CCC7',   // 二级强调（超喜欢）
          boost: '#9747FF',   // boost / 紫
          spark: '#FBA94C',   // 提醒
        },
        ink: {
          900: '#0B0B0F',     // 近黑
          800: '#17171C',
          700: '#22232A',
          500: '#5A5A66',
          300: '#A1A1AA',
          100: '#E6E7EB',
          50:  '#F4F4F7',
        },
        accent: '#FE3C72',
        success: '#10B981',
        warning: '#FBA94C',
        bg: {
          primary: '#FFFFFF',
          secondary: '#F4F4F7',
          tertiary: '#EEF2FF',
        },
        surface: '#FFFFFF',
        'card-bg': '#FFFFFF',
        'text-primary': '#0B0B0F',
        'text-secondary': '#5A5A66',
        'text-muted': '#A1A1AA',
        border: {
          DEFAULT: '#E6E7EB',
          light: '#F4F4F7',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.06), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'card': '0 12px 32px -12px rgba(11, 11, 15, 0.18)',
        'pop': '0 8px 24px -4px rgba(11, 11, 15, 0.22)',
        'flame': '0 8px 22px -4px rgba(254, 60, 114, 0.45)',
        'primary': '0 4px 14px 0 rgba(99, 102, 241, 0.35)',
        'pink': '0 4px 14px 0 rgba(236, 72, 153, 0.35)',
      },
      borderRadius: {
        'card': '20px',
        'pill': '999px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'wave': 'wave 1.2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}