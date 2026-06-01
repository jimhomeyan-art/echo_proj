// Mock data for friends/chat

export const friends = [
  {
    id: 'f1',
    name: '星空旋律',
    username: '@starmelody',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    status: 'online',
    lastMessage: '你的新歌太好听了！',
    lastMessageTime: '刚刚',
    unreadCount: 2,
  },
  {
    id: 'f2',
    name: '电子精灵',
    username: '@electronic_elf',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
    status: 'online',
    lastMessage: '下次一起合作创作吧',
    lastMessageTime: '10分钟前',
    unreadCount: 0,
  },
  {
    id: 'f3',
    name: '节拍大师',
    username: '@beatmaster',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
    status: 'offline',
    lastMessage: '晚安~',
    lastMessageTime: '昨天',
    unreadCount: 0,
  },
  {
    id: 'f4',
    name: '梦境编织者',
    username: '@dreamweaver',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    status: 'online',
    lastMessage: '这首歌的混音版本什么时候出？',
    lastMessageTime: '2小时前',
    unreadCount: 1,
  },
  {
    id: 'f5',
    name: '霓虹之城',
    username: '@neoncity',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    status: 'offline',
    lastMessage: '收到你的合作邀请了',
    lastMessageTime: '昨天',
    unreadCount: 0,
  },
  {
    id: 'f6',
    name: '节奏狂人',
    username: '@rhythm_king',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    status: 'online',
    lastMessage: '这个beat太棒了',
    lastMessageTime: '3小时前',
    unreadCount: 0,
  },
];

export const chatMessages: Record<string, Array<{
  id: string;
  senderId: string;
  type: 'text' | 'music' | 'image';
  content: string;
  music?: {
    id: string;
    title: string;
    cover: string;
    duration: string;
  };
  timestamp: string;
  isRead: boolean;
}>> = {
  'f1': [
    {
      id: 'm1',
      senderId: 'f1',
      type: 'text',
      content: '嗨，最近在创作什么新歌吗？',
      timestamp: '今天 10:30',
      isRead: true,
    },
    {
      id: 'm2',
      senderId: 'me',
      type: 'text',
      content: '在写一首关于夜晚的电子音乐',
      timestamp: '今天 10:32',
      isRead: true,
    },
    {
      id: 'm3',
      senderId: 'f1',
      type: 'music',
      content: '这首是我刚完成的',
      music: {
        id: 's1',
        title: '星河漫游',
        cover: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
        duration: '3:45',
      },
      timestamp: '今天 10:35',
      isRead: true,
    },
    {
      id: 'm4',
      senderId: 'f1',
      type: 'text',
      content: '你的新歌太好听了！',
      timestamp: '刚刚',
      isRead: false,
    },
  ],
  'f2': [
    {
      id: 'm1',
      senderId: 'f2',
      type: 'text',
      content: '下次一起合作创作吧',
      timestamp: '10分钟前',
      isRead: true,
    },
  ],
};
