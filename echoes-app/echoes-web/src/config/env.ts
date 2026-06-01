// env.ts - 环境配置
// AI 音乐生成 API Key 只应配置在后端 .env，前端通过后端代理调用

export const config = {
  // 前端不保存 AI 音乐 API Key，仅保留兼容字段
  minimaxApiKey: import.meta.env.VITE_MINIMAX_API_KEY || 'YOUR_API_KEY',

  // API 基础 URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  // 是否使用模拟数据（当 API 不可用时）
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false
}

// 旧 MiniMax 直连端点已废弃，保留空对象避免历史引用报错
export const MUSIC_API = {}

// 日志函数
export const log = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args)
}