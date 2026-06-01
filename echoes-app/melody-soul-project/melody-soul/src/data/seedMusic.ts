// 占位音乐 catalog
// 所有 mock 数据的音乐都从这里查 audioUrl，避免 url 散落各处不一致。
// 生成方法：cd echoes-app/server && npm run seed:music
// 生成完成后，audio 文件会下载到 public/seed/<id>.mp3

export interface SeedTrack {
  id: string
  title: string
  /** AI 创作时的情绪标签，会在胶囊页面显示 */
  mood: string
  /** 风格简标签（如 "钢琴"、"电子"），用于 UI 展示 */
  styleTag: string
  /** 用于 Mureka 生成时的 styleHint */
  styleHint: string
  /** 用于 Mureka 生成时的 prompt 灵感文本 */
  prompt: string
  /** 默认封面图 */
  cover: string
  /** 显示时长（占位，真实时长由 audio 元数据决定） */
  duration: string
  /** 是否需要带歌词（true=song, false=instrumental） */
  withLyrics: boolean
}

const COVER = {
  studioMic: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop',
  neonGirl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=600&h=600&fit=crop',
  cosmos: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600&h=600&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
  rainLake: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=600&fit=crop',
  cityNight: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
  starWalk: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=600&fit=crop',
  dreamScape: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop',
  galaxy: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=600&fit=crop'
}

export const seedTracks: SeedTrack[] = [
  {
    id: 'seed-midnight-rhapsody',
    title: '午夜狂想曲',
    mood: '深夜氛围',
    styleTag: '氛围',
    styleHint: 'late-night ambient electronica, soft analog synth pads, muted drum machine, 78 BPM, dreamy texture',
    prompt: '一个人在深夜的天台，城市灯火渐次熄灭，思绪像潮水一样起伏。',
    cover: COVER.studioMic,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-cyberpunk-dream',
    title: '赛博朋克梦境',
    mood: '兴奋',
    styleTag: '电子',
    styleHint: 'cyberpunk synthwave, retro arpeggio synth, punchy 808 drums, 110 BPM, neon energy',
    prompt: '霓虹雨夜，悬浮列车划过摩天楼之间，未来的孤独。',
    cover: COVER.neonGirl,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-cosmic-pulse',
    title: '宇宙脉冲',
    mood: '专注',
    styleTag: '节拍',
    styleHint: 'spacey downtempo, sub bass pulse, granular synth, 92 BPM, cosmic, hypnotic groove',
    prompt: '深空里跳动的脉冲信号，慢慢把意识带去更远的地方。',
    cover: COVER.cosmos,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-moonlit-cafe',
    title: '月光下的咖啡馆',
    mood: '浪漫',
    styleTag: '爵士',
    styleHint: 'cozy lounge jazz, brushed snare, walking bass, mellow rhodes piano, 84 BPM, intimate',
    prompt: '深夜的小咖啡馆，钢琴在角落里独白，杯沿冒着热气。',
    cover: COVER.coffee,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-rainy-thoughts',
    title: '雨夜思绪',
    mood: '忧郁',
    styleTag: '钢琴',
    styleHint: 'minimalist piano ballad, grand piano solo, subtle rain foley, 60 BPM, melancholic',
    prompt: '窗外细雨，谁也没敲门，只有钢琴在替你说话。',
    cover: COVER.rainLake,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-urban-drift',
    title: '都市漫游',
    mood: '平静',
    styleTag: '电子',
    styleHint: 'chillwave city pop, lofi guitar, smooth synth, light percussion, 96 BPM, after-work mood',
    prompt: '下班回家的地铁里，看城市倒退，脚步终于慢下来。',
    cover: COVER.cityNight,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-starry-walk',
    title: '星空漫步',
    mood: '沉思',
    styleTag: '氛围',
    styleHint: 'celestial ambient, shimmering pads, ethereal choir, 64 BPM, weightless',
    prompt: '夜里走在空旷的天桥上，抬头是从未见过的银河。',
    cover: COVER.starWalk,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-electric-dream',
    title: '电子梦境',
    mood: '梦幻',
    styleTag: '电子',
    styleHint: 'dream pop electronica, lush reverb pads, soft 808 beat, female vocal chops, 100 BPM',
    prompt: '梦里下着粉色的雨，没有人惊讶。',
    cover: COVER.dreamScape,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-deep-whisper',
    title: '深海低语',
    mood: '平静',
    styleTag: '氛围',
    styleHint: 'deep underwater ambient, hydrophone drone, slow swell pad, 56 BPM, meditative',
    prompt: '潜入深海，所有声音都被水温柔包裹。',
    cover: COVER.dreamScape,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-afternoon-light',
    title: '午后时光',
    mood: '浪漫',
    styleTag: '民谣',
    styleHint: 'warm acoustic folk, nylon guitar, mellow strings, 88 BPM, soft afternoon vibe',
    prompt: '阳光斜照桌面，咖啡正好喝完，时间像被按了暂停。',
    cover: COVER.coffee,
    duration: '0:30',
    withLyrics: false
  },
  {
    id: 'seed-galaxy-drift',
    title: '星河漫游',
    mood: '梦幻',
    styleTag: '电子',
    styleHint: 'spacey synthwave, cosmic arpeggio, slow analog bass, 88 BPM, drifting feel',
    prompt: '飘在一艘小飞船上，星河像缎带从舷窗滑过。',
    cover: COVER.galaxy,
    duration: '0:30',
    withLyrics: false
  }
]

const seedById = new Map(seedTracks.map(t => [t.id, t]))

/** 拿一条 seed 轨道的元数据 */
export function getSeed(id: string): SeedTrack | undefined {
  return seedById.get(id)
}

/** 拿 seed 轨道的播放 URL（指向 public/seed 下载好的 mp3） */
export function seedAudioUrl(id: string): string {
  return `/seed/${id}.mp3`
}
