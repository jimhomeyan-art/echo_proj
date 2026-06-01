// Mock data for the app

export const currentUser = {
  id: '1',
  name: '音乐小王子',
  username: '@musicprince',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  followers: 1289,
  following: 256,
  bio: '用音乐讲述故事，用AI创造未来 🎵',
  songs: 42,
  likes: 3892,
};

export const feedPosts = [
  {
    id: '1',
    user: {
      id: '2',
      name: '星空旋律',
      username: '@starmelody',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    },
    music: {
      id: 'm1',
      title: '午夜狂想曲',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      duration: '3:45',
      url: 'https://example.com/music1.mp3',
    },
    caption: '深夜创作，用AI生成的氛围音乐 🎧',
    likes: 234,
    comments: 45,
    shares: 12,
    createdAt: '2小时前',
    isLiked: false,
  },
  {
    id: '2',
    user: {
      id: '3',
      name: '电子精灵',
      username: '@electronic_elf',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
    },
    music: {
      id: 'm2',
      title: '赛博朋克梦境',
      cover: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop',
      duration: '4:12',
      url: 'https://example.com/music2.mp3',
    },
    caption: '未来的声音，AI正在觉醒 ✨',
    likes: 567,
    comments: 89,
    shares: 34,
    createdAt: '5小时前',
    isLiked: true,
  },
  {
    id: '3',
    user: {
      id: '4',
      name: '节拍大师',
      username: '@beatmaster',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
    },
    music: {
      id: 'm3',
      title: '宇宙脉冲',
      cover: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop',
      duration: '3:28',
      url: 'https://example.com/music3.mp3',
    },
    caption: '来自深空的信号 📡',
    likes: 892,
    comments: 156,
    shares: 67,
    createdAt: '8小时前',
    isLiked: false,
  },
  {
    id: '4',
    user: {
      id: '5',
      name: '梦境编织者',
      username: '@dreamweaver',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    },
    music: {
      id: 'm4',
      title: '月光下的咖啡馆',
      cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
      duration: '5:01',
      url: 'https://example.com/music4.mp3',
    },
    caption: '慵懒的午后，一杯咖啡，一段旋律 ☕',
    likes: 1234,
    comments: 234,
    shares: 89,
    createdAt: '12小时前',
    isLiked: true,
  },
];

export const recommendedUsers = [
  {
    id: 'u1',
    name: '霓虹之城',
    username: '@neoncity',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    followers: 5621,
    isFollowing: false,
  },
  {
    id: 'u2',
    name: '节奏狂人',
    username: '@rhythm_king',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    followers: 3428,
    isFollowing: true,
  },
  {
    id: 'u3',
    name: '低音炮',
    username: '@bassqueen',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    followers: 8934,
    isFollowing: false,
  },
];

export const categories = [
  { id: 'c1', name: '电子', icon: 'zap', color: '#667EEA' },
  { id: 'c2', name: '流行', icon: 'music', color: '#F5576C' },
  { id: 'c3', name: '古典', icon: 'star', color: '#FFB800' },
  { id: 'c4', name: '爵士', icon: 'headphones', color: '#00D9FF' },
  { id: 'c5', name: '民谣', icon: 'heart', color: '#00E676' },
  { id: 'c6', name: '说唱', icon: 'mic', color: '#F093FB' },
];

export const myLibrary = {
  created: [
    {
      id: 'ml1',
      title: '雨夜思绪',
      cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      duration: '4:15',
      createdAt: '2024-01-15',
      plays: 2345,
    },
    {
      id: 'ml2',
      title: '都市漫游',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      duration: '3:56',
      createdAt: '2024-01-12',
      plays: 1892,
    },
  ],
  liked: [
    {
      id: 'll1',
      title: '星海漫步',
      cover: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
      duration: '5:22',
      artist: '星空旋律',
    },
    {
      id: 'll2',
      title: '电子梦境',
      cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
      duration: '4:01',
      artist: '电子精灵',
    },
  ],
  playlists: [
    { id: 'pl1', name: '深夜独处', count: 12 },
    { id: 'pl2', name: '工作专注', count: 8 },
    { id: 'pl3', name: '运动节奏', count: 15 },
  ],
};

export const chatHistory: Array<{
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  type?: 'text' | 'music';
  music?: {
    id: string;
    title: string;
    cover: string;
    duration: string;
    style: string;
    mood: string;
  };
  timestamp: string;
}> = [
  {
    id: 'ch1',
    role: 'user',
    content: '创作一首关于下雨天忧郁情绪的钢琴曲',
    timestamp: '今天 14:30',
  },
  {
    id: 'ch2',
    role: 'assistant',
    content: '好的，让我为您创作一首忧郁的钢琴曲。雨天总是能唤起内心深处的情感...',
    timestamp: '今天 14:30',
  },
  {
    id: 'ch3',
    role: 'assistant',
    type: 'music',
    music: {
      id: 'gen1',
      title: '雨夜钢琴',
      cover: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
      duration: '4:30',
      style: '抒情钢琴',
      mood: '忧郁',
    },
    timestamp: '今天 14:32',
  },
];

export const emotionTags = [
  { id: 'e1', label: '开心', emoji: '😊', color: '#FFD93D' },
  { id: 'e2', label: '悲伤', emoji: '😢', color: '#6C93F0' },
  { id: 'e3', label: '兴奋', emoji: '🎉', color: '#FF6B6B' },
  { id: 'e4', label: '平静', emoji: '😌', color: '#00D9FF' },
  { id: 'e5', label: '浪漫', emoji: '💕', color: '#F5576C' },
  { id: 'e6', label: '愤怒', emoji: '😤', color: '#FF4757' },
];