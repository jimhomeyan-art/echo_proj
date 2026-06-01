// musicService.js - 可插拔 AI 音乐生成服务
const axios = require('axios')

// ─── 情绪风格配置 ────────────────────────────────────────────────
const emotionMusicStyles = {
  melancholy: {
    title: '深夜独白',
    prompt: 'melancholic cinematic ambient music, minor key, slow piano, string orchestra, atmospheric, film score, intimate, 60 seconds',
    gradient: ['#415A77', '#1B263B']
  },
  solitude: {
    title: '蓝色时刻',
    prompt: 'ethereal ambient music, spacey synth pads, soft textures, minimalist, dreamy, contemplative, 60 seconds',
    gradient: ['#415A77', '#778DA9']
  },
  anxiety: {
    title: '不安的浪潮',
    prompt: 'tense cinematic music, minor key, building tension, subtle drums, strings, anxiety atmosphere, 60 seconds',
    gradient: ['#E07A5F', '#F4845F']
  },
  anger: {
    title: '暗涌',
    prompt: 'intense cinematic music, aggressive percussion, dark orchestration, powerful, dramatic, 60 seconds',
    gradient: ['#F4845F', '#E07A5F']
  },
  confusion: {
    title: '迷雾',
    prompt: 'mysterious ambient music, dissonant harmonies, floating synths, uncertain atmosphere, 60 seconds',
    gradient: ['#9D8DF1', '#778DA9']
  },
  calm: {
    title: '湖面微风',
    prompt: 'peaceful ambient music, gentle piano, nature sounds, serene, relaxing, zen, 60 seconds loop',
    gradient: ['#81B29A', '#4EA8DE']
  },
  joy: {
    title: '晨光',
    prompt: 'uplifting cheerful music, major key, bright melody, light percussion, happy atmosphere, 60 seconds',
    gradient: ['#FFD166', '#F4845F']
  },
  hope: {
    title: '曙光',
    prompt: 'inspiring cinematic music, epic orchestral, hopeful melody, uplifting, motivational, 60 seconds',
    gradient: ['#4EA8DE', '#81B29A']
  },
  exhaustion: {
    title: '低沉',
    prompt: 'low energy ambient music, slow tempo, soft textures, resting atmosphere, peaceful, 60 seconds',
    gradient: ['#415A77', '#6C757D']
  }
}

// ─── 音乐风格调色板（每次随机选一个 sonic palette） ─────────────
const sonicPalettes = {
  melancholy: [
    'lo-fi cassette + nylon guitar + brushed drums + room tone, 70 BPM',
    'neo-classical cello + felt piano + vinyl noise, sparse arrangement, 64 BPM',
    'shoegaze guitar wash + slow bass + hazy synth pads, 72 BPM',
    'indie folk + acoustic guitar + harmonium + soft male vocal, 76 BPM',
    'dream pop + reverbed electric guitar + slow drum machine + airy female vocal, 80 BPM',
    'jazz trio + upright bass + brushed kit + smoky saxophone, 84 BPM'
  ],
  solitude: [
    'ambient + granular synth texture + heartbeat pulse + distant chime, 65 BPM',
    'minimal piano + tape hiss + soft pad + city night ambience, 60 BPM',
    'analog warm bass + slow arpeggio + sparse percussion + female whisper vocal, 70 BPM',
    'guzheng + low drones + rain ambience + breath texture, 68 BPM',
    'cinematic horn + sub bass drone + slow strings, 60 BPM'
  ],
  anxiety: [
    'dark synth pulse + tight drum machine + glitch percussion + airy pad, 110 BPM',
    'post-rock + tremolo guitar + dense drums + building tension, 96 BPM',
    'industrial percussion + distorted bass + breath samples, 100 BPM',
    'string ostinato + tight piano + subby kick + tension-release dynamics, 92 BPM'
  ],
  anger: [
    'trap drums + dark 808 + distorted synth lead + aggressive female rap vocal, 140 BPM',
    'punk rock + distorted guitar + powerful drums + raw shouting vocal, 160 BPM',
    'industrial + heavy bass + glitch fx + commanding vocal, 130 BPM',
    'metalcore breakdown + double kick + screaming vocal, 150 BPM'
  ],
  confusion: [
    'glitch electronica + irregular percussion + bitcrush vocal sample, 100 BPM',
    'modular synth + dissonant pads + tape warble, 80 BPM',
    'experimental jazz + free piano + brushed drums + saxophone, 90 BPM',
    'dream pop + washed guitar + uncertain harmony + breathy vocal, 88 BPM'
  ],
  calm: [
    'felt piano + nylon guitar + soft bass + brushed kit, 72 BPM',
    'ambient folk + acoustic guitar + harmonium + nature sounds, 68 BPM',
    'classical guitar + cello + warm room tone, 74 BPM',
    'lofi hiphop + jazzy piano + boom-bap drums + saxophone, 80 BPM',
    'bossa nova + nylon guitar + soft brushes + breezy female vocal, 92 BPM',
    'indie acoustic + ukulele + light percussion + warm male vocal, 84 BPM'
  ],
  joy: [
    'indie pop + bright acoustic guitar + claps + airy female vocal, 110 BPM',
    'funk + slap bass + tight drums + horn section + soulful vocal, 108 BPM',
    'city pop + electric piano + groovy bass + sax solo + female vocal, 104 BPM',
    'ukulele + glockenspiel + whistled hook + male vocal, 116 BPM',
    'electro pop + bright synth + light beats + processed female vocal, 118 BPM',
    'jazz pop + walking bass + ride cymbal + warm female vocal, 112 BPM'
  ],
  hope: [
    'cinematic post-rock + building guitars + soft drums + male vocal, 92 BPM',
    'orchestral pop + strings + piano + soaring female vocal, 96 BPM',
    'folk pop + acoustic guitar + harmonies + warm vocal, 100 BPM',
    'indie rock + jangly guitar + driving drums + hopeful female vocal, 110 BPM',
    'electronic ambient + bright synth pad + slow build + ethereal vocal, 88 BPM'
  ],
  exhaustion: [
    'ambient + slow felt piano + breath samples + low drone, 60 BPM',
    'lofi hiphop + dusty piano + soft kick + jazzy guitar, 72 BPM',
    'neo soul + electric piano + slow bass + tired warm vocal, 76 BPM',
    'acoustic ballad + nylon guitar + cello + close-mic male vocal, 64 BPM'
  ]
}

const negativePrompt = 'avoid generic cinematic strings, avoid epic trailer orchestral, avoid overused ambient pads, avoid EDM drop, avoid loud over-processed mixing'

function pickPalette(emotion) {
  const list = sonicPalettes[emotion] || sonicPalettes.calm
  return list[Math.floor(Math.random() * list.length)]
}

function getStyle(emotion) {
  return emotionMusicStyles[emotion] || emotionMusicStyles.calm
}

function getMurekaConfig() {
  return {
    apiKey: process.env.MUREKA_API_KEY || process.env.MUSIC_API_KEY,
    baseUrl: process.env.MUREKA_API_BASE_URL || 'https://api.mureka.ai',
    model: process.env.MUREKA_MODEL || 'auto',
    n: Number(process.env.MUREKA_N || 1),
    stream: process.env.MUREKA_STREAM !== 'false',
    requestTimeout: Number(process.env.MUSIC_REQUEST_TIMEOUT || 30000),
    statusTimeout: Number(process.env.MUSIC_STATUS_TIMEOUT || 10000)
  }
}

const GENRE_KEYWORDS = /pop|folk|rock|jazz|lofi|lo-fi|ambient|electronic|edm|hiphop|hip-hop|rap|trap|r&b|rnb|soul|funk|country|metal|punk|orchestral|classical|cinematic|bossa|reggae|blues|gospel|disco|techno|house|trance|ballad|indie|shoegaze|dream pop|city pop|j-pop|k-pop|mandopop|cantopop|chinese|zhongguofeng|chinese folk|guzheng|opera|chamber/i

const INSTRUMENT_KEYWORDS = /guitar|piano|bass|drum|synth|violin|cello|sax|trumpet|flute|guzheng|pipa|erhu|ukulele|harp|harmonium|rhodes|organ|808|chime|strings|brass|woodwind|harpsichord|mandolin|banjo|accordion|clarinet|oboe|kalimba|marimba|vibraphone|tabla/i

function isRichStyleHint(styleHint) {
  if (!styleHint) return false
  const text = String(styleHint).trim()
  if (text.length < 35) return false
  const hasBpm = /\d{2,3}\s*BPM/i.test(text)
  const hasGenre = GENRE_KEYWORDS.test(text)
  const hasInstruments = INSTRUMENT_KEYWORDS.test(text)
  // 必须同时有：足够长 + (BPM 或 genre) + 乐器
  return (hasBpm || hasGenre) && hasInstruments
}

function buildMusicPrompt({ emotion, userText, prompt, styleHint }) {
  if (prompt) return prompt
  const rich = isRichStyleHint(styleHint)
  const journal = userText ? `Inspired by this feeling: "${String(userText).slice(0, 180)}". ` : ''

  if (rich) {
    // styleHint 已经丰富，让它主导，不再叠加 palette
    return `Instrumental music, no vocals. ${journal}Style: ${styleHint}. ${negativePrompt}.`
  }

  // styleHint 太泛或为空，用 palette 兜底
  const palette = pickPalette(emotion)
  const hint = styleHint ? `Style direction: ${styleHint}. ` : ''
  return `Instrumental music, no vocals. ${journal}${hint}Sonic palette: ${palette}. ${negativePrompt}.`
}

function buildSongPrompt({ emotion, userText, styleHint }) {
  const rich = isRichStyleHint(styleHint)
  const journal = userText ? `Inspired by this feeling: "${String(userText).slice(0, 180)}". ` : ''

  if (rich) {
    return `Original song with vocals. ${journal}Style: ${styleHint}. ${negativePrompt}.`
  }

  const palette = pickPalette(emotion)
  const hint = styleHint ? `Style direction: ${styleHint}. ` : ''
  return `Original song with vocals. ${journal}${hint}Sonic palette: ${palette}. ${negativePrompt}.`
}

function buildLyricsPrompt({ emotion, userText, styleHint }) {
  const hint = styleHint ? `音乐方向：${styleHint}。` : ''
  const journal = userText ? `用户的心情/聊天内容：${String(userText).slice(0, 240)}。` : ''
  const moodMap = {
    melancholy: '低沉、含蓄、带一点叹息感',
    solitude: '安静、独白式',
    anxiety: '紧绷、想被安抚',
    anger: '直接、有冲击力',
    confusion: '游离、提问感',
    calm: '舒缓、像呼吸',
    joy: '轻快、明亮',
    hope: '克制的暖意、像晨光',
    exhaustion: '疲惫但温柔'
  }
  const mood = moodMap[emotion] || moodMap.calm
  return `请基于以下聊天内容写一段中文歌词，要紧扣用户实际表达的事件、人物和情绪，不要写无关的通用情歌。包含 [Verse] [Chorus] [Verse] [Chorus] 四段，总字数 150-250。${journal}${hint}情绪基调：${mood}。要求：1) 把用户聊天里出现的具体意象（如下雨/咖啡/朋友/中奖等）自然写进去；2) 避免"被接住、深夜、心口"等套话；3) 用日常语言，画面感强；4) 副歌要有记忆点。`
}

// ─── 通用工具 ─────────────────────────────────────────────────────
function normalizeInstrumentalResult({ provider, emotion, prompt, raw }) {
  const style = getStyle(emotion)
  const data = raw?.data || raw || {}

  const taskId =
    data.id || data.task_id || data.taskId || data.trace_id || data.generation_id ||
    raw?.id || raw?.task_id || raw?.taskId || raw?.trace_id

  const audioUrl =
    data.audio_url || data.audioUrl || data.music_url ||
    data.stream_url ||
    data?.choices?.[0]?.url || data?.choices?.[0]?.stream_url ||
    data?.choices?.[0]?.wav_url || data?.choices?.[0]?.flac_url ||
    raw?.audio_url || raw?.music_url || raw?.url

  const rawStatus = String(data.status || raw?.status || '').toLowerCase()
  const status = audioUrl
    ? 'completed'
    : ['preparing', 'queued', 'pending', 'processing', 'running', 'streaming', 'created'].includes(rawStatus)
      ? 'processing'
      : rawStatus === 'succeeded' ? 'completed'
      : rawStatus || 'processing'

  return {
    success: true,
    provider,
    taskId,
    status,
    audioUrl,
    musicType: 'instrumental',
    data: {
      music_url: audioUrl,
      audio_url: audioUrl,
      task_id: taskId,
      status,
      provider,
      musicType: 'instrumental',
      title: style.title,
      prompt,
      gradient: style.gradient,
      duration: Number(process.env.MUSIC_DURATION || 60),
      raw
    }
  }
}

function normalizeSongResult({ provider, emotion, prompt, raw }) {
  const style = getStyle(emotion)
  const data = raw?.data || raw || {}

  const taskId =
    data.id || data.task_id || data.taskId ||
    raw?.id || raw?.task_id

  const audioUrl =
    data?.choices?.[0]?.url ||
    data?.choices?.[0]?.stream_url ||
    data?.choices?.[0]?.wav_url ||
    data.audio_url || data.url ||
    raw?.url

  const lyrics =
    data?.choices?.[0]?.lyrics ||
    data?.lyrics ||
    raw?.lyrics || ''

  const rawStatus = String(data.status || raw?.status || '').toLowerCase()
  const status = audioUrl
    ? 'completed'
    : ['preparing', 'queued', 'pending', 'processing', 'running', 'streaming'].includes(rawStatus)
      ? 'processing'
      : rawStatus === 'succeeded' ? 'completed'
      : rawStatus || 'processing'

  return {
    success: true,
    provider,
    taskId,
    status,
    audioUrl,
    musicType: 'song',
    data: {
      music_url: audioUrl,
      audio_url: audioUrl,
      task_id: taskId,
      status,
      provider,
      musicType: 'song',
      title: style.title,
      prompt,
      lyrics,
      gradient: style.gradient,
      duration: Number(process.env.MUSIC_DURATION || 60),
      raw
    }
  }
}

function createMockResult({ emotion, prompt, musicType = 'instrumental' }) {
  const style = getStyle(emotion)
  return {
    success: true,
    provider: 'mock',
    taskId: `mock_${Date.now()}`,
    status: 'completed',
    audioUrl: null,
    musicType,
    data: {
      music_url: null,
      audio_url: null,
      task_id: null,
      status: 'completed',
      provider: 'mock',
      musicType,
      title: style.title,
      prompt,
      gradient: style.gradient,
      duration: Number(process.env.MUSIC_DURATION || 60),
      is_fallback: true
    }
  }
}

// ─── Mureka: 纯音乐生成 ───────────────────────────────────────────
async function generateWithMureka({ emotion, userText, prompt, styleHint }) {
  const cfg = getMurekaConfig()
  if (!cfg.apiKey || cfg.apiKey === 'YOUR_MUREKA_API_KEY') {
    throw new Error('Mureka API key is not configured')
  }

  const finalPrompt = buildMusicPrompt({ emotion, userText, prompt, styleHint })

  console.log('🎹 [Instrumental Prompt] →', finalPrompt)

  const response = await axios.post(
    `${cfg.baseUrl}/v1/instrumental/generate`,
    { model: cfg.model, prompt: finalPrompt, n: cfg.n, stream: cfg.stream },
    {
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      timeout: cfg.requestTimeout
    }
  )

  return normalizeInstrumentalResult({
    provider: 'mureka',
    emotion,
    prompt: finalPrompt,
    raw: response.data
  })
}

async function getMurekaInstrumentalStatus(taskId) {
  const cfg = getMurekaConfig()
  if (!cfg.apiKey || cfg.apiKey === 'YOUR_MUREKA_API_KEY') {
    throw new Error('Mureka API key is not configured')
  }

  const response = await axios.get(
    `${cfg.baseUrl}/v1/instrumental/query/${encodeURIComponent(taskId)}`,
    {
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
      timeout: cfg.statusTimeout
    }
  )

  return normalizeInstrumentalResult({
    provider: 'mureka',
    emotion: 'calm',
    prompt: '',
    raw: response.data
  })
}

// ─── Mureka: 歌曲生成（先生成歌词，再生成歌曲） ──────────────────
async function generateLyricsWithMureka({ emotion, userText, styleHint }) {
  const cfg = getMurekaConfig()
  const lyricsPrompt = buildLyricsPrompt({ emotion, userText, styleHint })

  console.log('🎼 [Lyrics Prompt] →', lyricsPrompt)

  const response = await axios.post(
    `${cfg.baseUrl}/v1/lyrics/generate`,
    { prompt: lyricsPrompt },
    {
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      timeout: cfg.requestTimeout
    }
  )

  const data = response.data
  const lyrics = data?.lyrics || data?.data?.lyrics || ''
  const title = data?.title || data?.data?.title || getStyle(emotion).title

  if (!lyrics) throw new Error('Mureka lyrics generation returned empty lyrics')

  return { lyrics, title, prompt: lyricsPrompt }
}

async function generateSongWithMureka({ emotion, userText, prompt, styleHint, lyrics: providedLyrics }) {
  const cfg = getMurekaConfig()
  if (!cfg.apiKey || cfg.apiKey === 'YOUR_MUREKA_API_KEY') {
    throw new Error('Mureka API key is not configured')
  }

  let lyrics = providedLyrics
  let songPrompt = prompt

  if (!lyrics) {
    const lyricsResult = await generateLyricsWithMureka({ emotion, userText, styleHint })
    lyrics = lyricsResult.lyrics
    songPrompt = songPrompt || lyricsResult.prompt
  }

  songPrompt = buildSongPrompt({ emotion, userText, styleHint })

  console.log('🎤 [Song Prompt] →', songPrompt)
  console.log('📝 [Lyrics] →\n' + String(lyrics).slice(0, 400))

  const response = await axios.post(
    `${cfg.baseUrl}/v1/song/generate`,
    { model: cfg.model, lyrics, prompt: songPrompt, n: cfg.n, stream: cfg.stream },
    {
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      timeout: cfg.requestTimeout
    }
  )

  return normalizeSongResult({
    provider: 'mureka',
    emotion,
    prompt: songPrompt,
    raw: response.data
  })
}

async function getMurekaSongStatus(taskId) {
  const cfg = getMurekaConfig()
  const response = await axios.get(
    `${cfg.baseUrl}/v1/song/query/${encodeURIComponent(taskId)}`,
    {
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
      timeout: cfg.statusTimeout
    }
  )

  return normalizeSongResult({
    provider: 'mureka',
    emotion: 'calm',
    prompt: '',
    raw: response.data
  })
}

// ─── 对外统一接口 ─────────────────────────────────────────────────
async function generateMusic(params) {
  const provider = (process.env.MUSIC_PROVIDER || 'mureka').toLowerCase()
  const musicType = (params.musicType || 'instrumental').toLowerCase()

  if (provider === 'mock') {
    const prompt = musicType === 'song'
      ? buildSongPrompt(params)
      : buildMusicPrompt(params)
    return createMockResult({ ...params, prompt, musicType })
  }

  if (provider === 'mureka') {
    if (musicType === 'song') {
      return generateSongWithMureka(params)
    }
    return generateWithMureka(params)
  }

  throw new Error(`Unsupported music provider: ${provider}`)
}

async function getMusicStatus(taskId, musicType = 'instrumental') {
  const provider = (process.env.MUSIC_PROVIDER || 'mureka').toLowerCase()

  if (provider === 'mock') {
    return {
      success: true, provider: 'mock', taskId,
      status: 'completed', audioUrl: null, musicType,
      data: { task_id: taskId, status: 'completed', provider: 'mock', musicType, music_url: null }
    }
  }

  if (provider === 'mureka') {
    if (musicType === 'song') return getMurekaSongStatus(taskId)
    return getMurekaInstrumentalStatus(taskId)
  }

  throw new Error(`Unsupported music provider: ${provider}`)
}

function listSupportedEmotions() {
  return Object.entries(emotionMusicStyles).map(([type, value]) => ({
    type,
    title: value.title,
    gradient: value.gradient,
    prompt: value.prompt
  }))
}

module.exports = {
  buildMusicPrompt,
  generateMusic,
  getMusicStatus,
  listSupportedEmotions,
  emotionMusicStyles,
  isRichStyleHint
}
