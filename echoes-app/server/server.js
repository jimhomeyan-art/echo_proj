// server.js - Echoes Backend API Server
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const {
  generateMusic,
  getMusicStatus,
  listSupportedEmotions
} = require('./musicService')
const { chatWithQwen } = require('./chatService')

const app = express()
const PORT = process.env.PORT || 3001
const MUSIC_PROVIDER = process.env.MUSIC_PROVIDER || 'mureka'

// ── 音频本地缓存（下载 stable mp3 到磁盘，手机播完整文件无缓冲）──
const AUDIO_CACHE_DIR = path.join(__dirname, 'public', 'music')
fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true })

// 启动时清除没有 .done 标记的 mp3（stream 下载的不完整文件）
try {
  const allFiles = fs.readdirSync(AUDIO_CACHE_DIR)
  allFiles.forEach(f => {
    if (!f.endsWith('.mp3')) return
    const taskId = f.replace('.mp3', '')
    const fp = path.join(AUDIO_CACHE_DIR, f)
    const marker = path.join(AUDIO_CACHE_DIR, `${taskId}.done`)
    // 没有 .done 标记 = 未完整下载（stream 截断或重启中断），删除
    if (!fs.existsSync(marker)) {
      fs.unlinkSync(fp)
      console.log(`🗑️  Removed incomplete cache: ${f}`)
    }
  })
} catch (e) { /* ignore */ }

// taskId → Promise<localUrl | null>
const _audioCachePromises = new Map()

// 只从 stable URL 下载；写完后创建 .done 标记，防止截断文件被播放
async function ensureAudioCached(taskId, remoteUrl) {
  const filePath = path.join(AUDIO_CACHE_DIR, `${taskId}.mp3`)
  const markerPath = path.join(AUDIO_CACHE_DIR, `${taskId}.done`)
  const localUrl = `/api/music-cache/${taskId}.mp3`

  // 已有完整文件（有 .done 标记且不在下载中）
  if (fs.existsSync(filePath) && fs.existsSync(markerPath) && !_audioCachePromises.has(taskId)) {
    return localUrl
  }
  if (_audioCachePromises.has(taskId)) return _audioCachePromises.get(taskId)

  const promise = (async () => {
    try {
      // 删除可能存在的旧的不完整文件
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      if (fs.existsSync(markerPath)) fs.unlinkSync(markerPath)

      console.log(`⬇️  Caching audio from stable URL: ${taskId}`)
      const resp = await axios.get(remoteUrl, { responseType: 'stream', timeout: 180000 })
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath)
        resp.data.pipe(writer)
        writer.on('finish', resolve)
        writer.on('error', err => { fs.unlink(filePath, () => {}); reject(err) })
      })
      // 写入完成标记
      fs.writeFileSync(markerPath, 'done')
      console.log(`✅ Audio cached: ${taskId}.mp3`)
      _audioCachePromises.delete(taskId)
      return localUrl
    } catch (err) {
      console.error(`❌ Audio cache failed (${taskId}):`, err.message)
      _audioCachePromises.delete(taskId)
      return null
    }
  })()

  _audioCachePromises.set(taskId, promise)
  return promise
}

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

// 本地缓存 mp3 静态文件服务（必须用 /api/ 前缀，nginx 才会代理过来）
app.use('/api/music-cache', express.static(AUDIO_CACHE_DIR, { maxAge: '7d' }))

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

    const filePath = path.join(AUDIO_CACHE_DIR, `${taskId}.mp3`)
    const markerPath = path.join(AUDIO_CACHE_DIR, `${taskId}.done`)

    // ① 本地已有完整缓存（.done 标记存在）→ 直接返回静态文件 URL
    if (fs.existsSync(filePath) && fs.existsSync(markerPath) && !_audioCachePromises.has(taskId)) {
      const localUrl = `/api/music-cache/${taskId}.mp3`
      result.audioUrl = localUrl
      result.isStable = true
      result.status = 'completed'
      if (result.data) {
        result.data.music_url = localUrl
        result.data.audio_url = localUrl
        result.data.stable_url = localUrl
        result.data.stream_url = null
        result.data.status = 'completed'
      }
      return res.json(result)
    }

    if (result.audioUrl && /^https?:\/\//.test(result.audioUrl)) {
      if (result.isStable) {
        // ② stable URL：阻塞下载完整文件，完成后返回本地路径
        const localUrl = await ensureAudioCached(taskId, result.audioUrl)
        if (localUrl) {
          result.audioUrl = localUrl
          result.isStable = true
          result.status = 'completed'
          if (result.data) {
            result.data.music_url = localUrl
            result.data.audio_url = localUrl
            result.data.stable_url = localUrl
            result.data.stream_url = null
            result.data.status = 'completed'
          }
        }
      } else {
        // ③ stream URL（Mureka 还在生成中）：不下载，等 stable URL 出来
        // stream 是实时生成流，随时可能被截断，不做缓存
        result.audioUrl = null
        result.status = 'processing'
        if (result.data) {
          result.data.music_url = null
          result.data.audio_url = null
          result.data.stream_url = null
          result.data.status = 'processing'
        }
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
