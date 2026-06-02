// server.js - Echoes Backend API Server
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const {
  generateMusic,
  getMusicStatus,
  listSupportedEmotions
} = require('./musicService')
const { chatWithQwen } = require('./chatService')

const app = express()
const PORT = process.env.PORT || 3001
const MUSIC_PROVIDER = process.env.MUSIC_PROVIDER || 'mureka'

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, cb) => {
    // 无 origin（同源/curl/Postman）或未配置白名单 → 全放行
    if (!origin || allowedOrigins.length === 0) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    // 允许任意 vercel.app 子域，便于预览部署
    if (/\.vercel\.app$/.test(new URL(origin).hostname)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  }
}))
app.use(express.json())

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    musicProvider: MUSIC_PROVIDER
  })
})

// AI 治愈聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'messages is required'
      })
    }

    const result = await chatWithQwen({ messages })
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('❌ Chat failed:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Chat failed'
    })
  }
})

// 情绪配乐生成接口
app.post('/api/music/generate', async (req, res) => {
  try {
    const { emotion, userText, prompt, musicType, styleHint, musicTitle } = req.body

    if (!emotion && !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Emotion or prompt is required'
      })
    }

    console.log('🎵 Generating music:', {
      provider: MUSIC_PROVIDER,
      emotion,
      musicType: musicType || 'instrumental',
      hasPrompt: Boolean(prompt),
      styleHint
    })

    const result = await generateMusic({ emotion, userText, prompt, musicType, styleHint, musicTitle })
    res.json(result)
  } catch (error) {
    console.error('❌ Music generation failed:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      provider: MUSIC_PROVIDER,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Music generation failed'
    })
  }
})

// 获取生成状态
app.get('/api/music/status/:taskId/:musicType?', async (req, res) => {
  try {
    const { taskId, musicType } = req.params
    const result = await getMusicStatus(taskId, musicType || 'instrumental')

    // 把 Mureka 外链替换成服务端代理 URL，避免用户直连跨网缓冲
    if (result.audioUrl && /^https?:\/\//.test(result.audioUrl)) {
      const proxied = `/api/audio-proxy?url=${encodeURIComponent(result.audioUrl)}`
      result.audioUrl = proxied
      if (result.data) {
        if (result.data.music_url) result.data.music_url = proxied
        if (result.data.audio_url) result.data.audio_url = proxied
        if (result.data.stream_url) result.data.stream_url = proxied
        if (result.data.stable_url) result.data.stable_url = proxied
      }
    }

    res.json(result)
  } catch (error) {
    console.error('❌ Music status failed:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      provider: MUSIC_PROVIDER,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Music status failed'
    })
  }
})

// 获取支持的情绪类型
app.get('/api/music/emotions', (req, res) => {
  res.json({
    success: true,
    data: listSupportedEmotions()
  })
})

// 情绪分析接口
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const emotionKeywords = {
      melancholy: ['孤独', '寂寞', '难过', '伤心', '失落', '空虚', '忧郁', '沉默', '夜深', '凌晨', '想念', '回忆'],
      solitude: ['一个人', '孤单', '无人', '独自', '没人', '静'],
      anxiety: ['焦虑', '不安', '紧张', '担心', '害怕', '压力', '失眠', '忐忑'],
      anger: ['愤怒', '生气', '恼火', '崩溃', '烦躁', '火大'],
      confusion: ['迷茫', '困惑', '不懂', '怎么办', '选择', '纠结', '方向'],
      calm: ['平静', '宁静', '安静', '放松', '舒适', '平和'],
      joy: ['开心', '快乐', '高兴', '幸福', '美好', '棒'],
      hope: ['希望', '期待', '憧憬', '梦想', '未来', '曙光'],
      exhaustion: ['疲惫', '累', '困', '倦', '没力气', '耗尽']
    }

    const emotionScores = {}
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        if (text.includes(keyword)) score += 10
      }
      emotionScores[emotion] = score
    }

    const totalScore = Object.values(emotionScores).reduce((sum, s) => sum + s, 0)
    const emotions = totalScore > 0
      ? Object.fromEntries(Object.entries(emotionScores).map(([k, v]) => [k, Math.round((v / totalScore) * 100)]))
      : { calm: 60, hope: 25, melancholy: 15 }

    const dominant = Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    const intensity = totalScore > 0 ? Math.min(100, 30 + Math.min(70, totalScore / 2)) : 50

    res.json({
      success: true,
      data: { emotions, dominant, intensity }
    })
  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
    res.status(500).json({
      success: false,
      error: 'Analysis failed'
    })
  }
})

// 音频代理：把 Mureka 外链通过服务器中转，避免用户直连跨网缓冲
app.get('/api/audio-proxy', async (req, res) => {
  const rawUrl = req.query.url
  if (!rawUrl) return res.status(400).send('Missing url')

  let targetUrl
  try { targetUrl = decodeURIComponent(rawUrl) } catch { targetUrl = rawUrl }

  try {
    const headers = {}
    if (req.headers.range) headers.Range = req.headers.range

    const upstream = await axios({
      method: 'get',
      url: targetUrl,
      responseType: 'stream',
      headers,
      timeout: 120000
    })

    res.status(req.headers.range ? (upstream.status === 206 ? 206 : 200) : 200)
    res.setHeader('Content-Type', upstream.headers['content-type'] || 'audio/mpeg')
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length'])
    if (upstream.headers['content-range']) res.setHeader('Content-Range', upstream.headers['content-range'])

    upstream.data.pipe(res)
    upstream.data.on('error', () => { if (!res.headersSent) res.status(502).end() })
    req.on('close', () => upstream.data.destroy())
  } catch (err) {
    console.error('❌ Audio proxy error:', err.message)
    if (!res.headersSent) res.status(502).send('Audio proxy failed')
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     Echoes Backend Server                  ║
║     ─────────────────────────────          ║
║     Server running on port ${PORT}            ║
║     Music provider: ${MUSIC_PROVIDER}              ║
║     Health check: /health                   ║
║     Music API: /api/music/generate          ║
╚════════════════════════════════════════════╝
  `)
})
