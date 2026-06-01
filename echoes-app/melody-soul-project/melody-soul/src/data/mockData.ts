// Mock data for the app
import { getSeed, seedAudioUrl } from './seedMusic';

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

// ---------- 通用构造器 ----------
function fromSeed(seedId: string, overrides: { id?: string } = {}) {
  const s = getSeed(seedId);
  if (!s) throw new Error(`seed missing: ${seedId}`);
  return {
    id: overrides.id || seedId,
    seedId,
    title: s.title,
    cover: s.cover,
    duration: s.duration,
    url: seedAudioUrl(seedId),
    mood: s.mood,
    styleTag: s.styleTag,
  };
}

// ---------- Feed 动态 ----------
export const feedPosts = [
  {
    id: '1',
    user: {
      id: '2',
      name: '星空旋律',
      username: '@starmelody',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    },
    music: fromSeed('seed-midnight-rhapsody', { id: 'm1' }),
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
    music: fromSeed('seed-cyberpunk-dream', { id: 'm2' }),
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
    music: fromSeed('seed-cosmic-pulse', { id: 'm3' }),
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
    music: fromSeed('seed-moonlit-cafe', { id: 'm4' }),
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

// ---------- 我的音乐库 ----------
export const myLibrary = {
  created: [
    { ...fromSeed('seed-rainy-thoughts', { id: 'ml1' }), createdAt: '2024-01-15', plays: 2345 },
    { ...fromSeed('seed-urban-drift', { id: 'ml2' }), createdAt: '2024-01-12', plays: 1892 },
  ],
  liked: [
    { ...fromSeed('seed-starry-walk', { id: 'll1' }), artist: '星空旋律' },
    { ...fromSeed('seed-electric-dream', { id: 'll2' }), artist: '电子精灵' },
  ],
  playlists: [
    { id: 'pl1', name: '深夜独处', count: 12 },
    { id: 'pl2', name: '工作专注', count: 8 },
    { id: 'pl3', name: '运动节奏', count: 15 },
  ],
};

// ---------- 初始胶囊（"我的"）和收到的胶囊 ----------
export const initialSavedCapsules = [
  { ...fromSeed('seed-rainy-thoughts', { id: 'cap-1' }), createdAt: '2024-01-15', plays: 2345 },
  { ...fromSeed('seed-urban-drift', { id: 'cap-2' }), createdAt: '2024-01-12', plays: 1892 },
  { ...fromSeed('seed-starry-walk', { id: 'cap-3' }), createdAt: '2024-01-10', plays: 3421 },
];

export const receivedCapsules = [
  {
    id: 'r1',
    sender: '星空旋律',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    message: '送给你，愿你找到内心的平静',
    music: fromSeed('seed-deep-whisper', { id: 'rcap-1' }),
  },
  {
    id: 'r2',
    sender: '电子精灵',
    senderAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    message: '和你分享这个节奏',
    music: fromSeed('seed-cyberpunk-dream', { id: 'rcap-2' }),
  },
  {
    id: 'r3',
    sender: '月光咖啡馆',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    message: '这杯咖啡送给你 🍵',
    music: fromSeed('seed-afternoon-light', { id: 'rcap-3' }),
  },
];

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
}> = [];

export const emotionTags = [
  { id: 'e1', label: '开心', emoji: '😊', color: '#FFD93D' },
  { id: 'e2', label: '悲伤', emoji: '😢', color: '#6C93F0' },
  { id: 'e3', label: '兴奋', emoji: '🎉', color: '#FF6B6B' },
  { id: 'e4', label: '平静', emoji: '😌', color: '#00D9FF' },
  { id: 'e5', label: '浪漫', emoji: '💕', color: '#F5576C' },
  { id: 'e6', label: '愤怒', emoji: '😤', color: '#FF4757' },
];
