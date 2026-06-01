// server/api/music.js - MiniMax Music API 代理服务
// 这个文件应该部署到服务器端，避免在前端暴露 API Key

const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// MiniMax API 配置
const MINIMAX_API_URL = 'https://api.minimax.io'
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'YOUR_API_KEY'

// 情绪类型到音乐风格的映射
const emotionToMusicStyle = {
  melancholy: {
    title: '深夜独白',
    prompt: 'melancholic cinematic ambient music, minor key, slow piano, string orchestra, atmospheric, film score, 60 seconds loop'
  },
  solitude: {
    title: '蓝色时刻',
    prompt: 'ethereal ambient music, spacey synth pads, soft textures, minimalist, dreamy, contemplative, 60 seconds'
  },
  anxiety: {
    title: '不安的浪潮',
    prompt: 'tense cinematic music, minor key, building tension, subtle drums, strings, anxiety atmosphere, 60 seconds'
  },
  confusion: {
    title: '迷雾',
    prompt: 'mysterious ambient music, dissonant harmonies, floating synths, uncertain atmosphere, 60 seconds'
  },
  calm: {
    title: '湖面微风',
    prompt: 'peaceful ambient music, gentle piano, nature sounds, serene, relaxing, zen, 60 seconds loop'
  },
  joy: {
    title: '晨光',
    prompt: 'uplifting cheerful music, major key, bright melody, light percussion, happy atmosphere, 60 seconds'
  },
  hope: {
    title: '曙光',
    prompt: 'inspiring cinematic music, epic orchestral, hopeful melody, uplifting, motivational, 60 seconds'
  },
  exhaustion: {
    title: '低沉',
    prompt: 'low energy ambient music, slow tempo, soft textures, resting atmosphere, peaceful, 60 seconds'
  }
}

/**
 * 生成情绪配乐
 * POST /api/music/generate
 * Body: { emotion: string, userText: string }
 */
app.post('/api/music/generate', async (req, res) => {
  try {
    const { emotion, userText } = req.body

    if (!emotion) {
      return res.status(400).json({ error: 'Missing emotion parameter' })
    }

    const style = emotionToMusicStyle[emotion] || emotionToMusicStyle.calm
    const fullPrompt = userText
      ? `Based on user's emotion: "${userText}". ${style.prompt}`
      : style.prompt

    console.log('🎵 Generating music:', { emotion, prompt: fullPrompt })

    // 调用 MiniMax Music API
    const response = await axios.post(
      `${MINIMAX_API_URL}/v1/music_generation`,
      {
        model: 'music-01',
        prompt: fullPrompt,
        duration: 60,
        instrumental: true
      },
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    res.json({
      success: true,
      data: {
        music_url: response.data.data?.music_url || response.data.url,
        title: style.title,
        prompt: fullPrompt,
        gradient: style.gradient,
        duration: 60
      }
    })
  } catch (error) {
    console.error('Music generation error:', error.response?.data || error.message)

    // 返回模拟数据作为降级方案
    const { emotion } = req.body
    const style = emotionToMusicStyle[emotion] || emotionToMusicStyle.calm

    res.json({
      success: true,
      fallback: true,
      data: {
        title: style.title,
        prompt: style.prompt,
        gradient: style.gradient,
        duration: 60,
        message: 'API暂时不可用，使用模拟数据'
      }
    })
  }
})

/**
 * 获取支持的情感类型
 * GET /api/music/emotions
 */
app.get('/api/music/emotions', (req, res) => {
  const emotions = Object.entries(emotionToMusicStyle).map(([key, value]) => ({
    type: key,
    title: value.title,
    gradient: value.gradient
  }))

  res.json({ success: true, data: emotions })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🎵 Music API server running on port ${PORT}`)
})

module.exports = app