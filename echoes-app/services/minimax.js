// services/minimax.js - MiniMax Music Generation Service
const axios = require('axios')

const API_KEY = process.env.MINIMAX_API_KEY || 'YOUR_API_KEY'
const BASE_URL = 'https://api.minimax.io'

// 情绪类型到音乐风格的映射
const emotionToMusicStyle = {
  melancholy: {
    prompt: ' melancholic cinematic ambient music, minor key, slow piano, string orchestra, atmospheric, film score, 60 seconds',
    temperature: 0.8,
    top_k: 50
  },
  solitude: {
    prompt: ' ethereal ambient music, spacey synth pads, soft textures, minimalist, dreamy, contemplative, 60 seconds',
    temperature: 0.7,
    top_k: 40
  },
  anxiety: {
    prompt: ' tense cinematic music, minor key, building tension, subtle drums, strings, anxiety atmosphere, 60 seconds',
    temperature: 0.8,
    top_k: 50
  },
  anger: {
    prompt: ' intense cinematic music, aggressive percussion, dark orchestration, powerful, dramatic, 60 seconds',
    temperature: 0.9,
    top_k: 60
  },
  confusion: {
    prompt: ' mysterious ambient music, dissonant harmonies, floating synths, uncertain atmosphere, 60 seconds',
    temperature: 0.75,
    top_k: 45
  },
  calm: {
    prompt: ' peaceful ambient music, gentle piano, nature sounds, serene, relaxing, zen, 60 seconds',
    temperature: 0.6,
    top_k: 30
  },
  joy: {
    prompt: ' uplifting cheerful music, major key, bright melody, light percussion, happy atmosphere, 60 seconds',
    temperature: 0.7,
    top_k: 40
  },
  hope: {
    prompt: ' inspiring cinematic music, epic orchestral, hopeful melody, uplifting, motivational, 60 seconds',
    temperature: 0.75,
    top_k: 45
  },
  exhaustion: {
    prompt: ' low energy ambient music, slow tempo, soft textures, resting atmosphere, peaceful, 60 seconds',
    temperature: 0.6,
    top_k: 30
  }
}

/**
 * 生成情绪配乐
 * @param {string} emotion - 主导情绪类型
 * @param {string} userText - 用户输入的文本（用于更精准的生成）
 * @returns {Promise<Object>} 生成结果
 */
async function generateEmotionMusic(emotion, userText = '') {
  try {
    const style = emotionToMusicStyle[emotion] || emotionToMusicStyle.calm

    // 构建完整的提示词
    const fullPrompt = `${userText ? `Based on: "${userText}". ` : ''}${style.prompt}`

    // MiniMax Music API 调用
    const response = await axios.post(
      `${BASE_URL}/v1/music_generation`,
      {
        model: 'music-01',
        prompt: fullPrompt,
        duration: 60,
        instrumental: true,
        temperature: style.temperature,
        top_k: style.top_k,
        output_format: 'mp3'
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    )

    return {
      success: true,
      data: {
        music_url: response.data.data?.music_url || response.data.url,
        duration: 60,
        emotion: emotion,
        prompt: fullPrompt
      }
    }
  } catch (error) {
    console.error('Music generation error:', error.response?.data || error.message)

    // 如果API调用失败，返回模拟数据用于开发
    return {
      success: false,
      error: error.response?.data?.message || '音乐生成服务暂时不可用',
      fallback: generateFallbackMusic(emotion)
    }
  }
}

/**
 * 生成备用音乐数据（当API不可用时）
 */
function generateFallbackMusic(emotion) {
  const musicTitles = {
    melancholy: '深夜独白',
    solitude: '蓝色时刻',
    anxiety: '不安的浪潮',
    anger: '暗涌',
    confusion: '迷雾',
    calm: '湖面微风',
    joy: '晨光',
    hope: '曙光',
    exhaustion: '低沉'
  }

  const gradients = {
    melancholy: ['#415A77', '#1B263B'],
    solitude: ['#415A77', '#778DA9'],
    anxiety: ['#E07A5F', '#F4845F'],
    anger: ['#F4845F', '#E07A5F'],
    confusion: ['#9D8DF1', '#778DA9'],
    calm: ['#81B29A', '#4EA8DE'],
    joy: ['#FFD166', '#F4845F'],
    hope: ['#4EA8DE', '#81B29A'],
    exhaustion: ['#415A77', '#6C757D']
  }

  return {
    music_url: null, // 使用内置音频或模拟
    duration: 60,
    emotion: emotion,
    title: musicTitles[emotion] || '情绪配乐',
    gradient: gradients[emotion] || ['#415A77', '#1B263B'],
    is_fallback: true
  }
}

/**
 * 获取情绪分析结果对应的音乐元数据
 */
function getEmotionMusicMeta(emotion) {
  return emotionToMusicStyle[emotion] || emotionToMusicStyle.calm
}

module.exports = {
  generateEmotionMusic,
  getEmotionMusicMeta,
  emotionToMusicStyle,
  generateFallbackMusic
}