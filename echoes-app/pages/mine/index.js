// pages/mine/index.js
const app = getApp();
const { getUser, getEmotionHistory, clearStorage } = require('../../utils/storage.js');

Page({
  data: {
    user: null,
    stats: {
      emotionCount: 0,
      capsuleCount: 0,
      listeningMinutes: 0,
      resonanceCount: 0
    },
    menuItems: [
      { id: 'profile', icon: 'user', title: '情绪档案', subtitle: '查看你的情绪历程' },
      { id: 'collection', icon: 'star', title: '收藏的配乐', subtitle: '你喜欢的音乐' },
      { id: 'history', icon: 'clock', title: '聆听历史', subtitle: '播放记录' },
      { id: 'settings', icon: 'settings', title: '设置', subtitle: '偏好与隐私' }
    ]
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    if (this.selectComponent('#tab-bar')) {
      this.selectComponent('#tab-bar').updateSelected();
    }
    this.loadUserData();
  },

  loadUserData() {
    const user = getUser() || app.globalData.user;
    const history = getEmotionHistory();

    if (user) {
      this.setData({
        user: {
          ...user,
          level: Math.floor(user.emotionCount / 5) + 1 || 1
        },
        stats: {
          emotionCount: history.length || user.emotionCount || 0,
          capsuleCount: user.capsuleCount || 0,
          listeningMinutes: Math.floor(history.length * 2.5) || 0,
          resonanceCount: Math.floor(history.length * 0.3) || 0
        }
      });
    }
  },

  onMenuTap(e) {
    const menuId = e.currentTarget.dataset.id;

    switch (menuId) {
      case 'profile':
        this.showEmotionProfile();
        break;
      case 'collection':
        this.showCollection();
        break;
      case 'history':
        this.showHistory();
        break;
      case 'settings':
        this.showSettings();
        break;
    }
  },

  showEmotionProfile() {
    const history = getEmotionHistory();

    if (history.length === 0) {
      wx.showToast({
        title: '暂无情绪记录',
        icon: 'none'
      });
      return;
    }

    // Calculate emotion distribution
    const emotionStats = {};
    let totalIntensity = 0;

    history.forEach(record => {
      for (const [emotion, value] of Object.entries(record.emotions || {})) {
        if (!emotionStats[emotion]) {
          emotionStats[emotion] = 0;
        }
        emotionStats[emotion] += value;
      }
      totalIntensity += record.intensity || 0;
    });

    const topEmotions = Object.entries(emotionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, value]) => ({
        type,
        label: type === 'melancholy' ? '忧郁' : type === 'solitude' ? '孤独' : type === 'calm' ? '平静' : type === 'hope' ? '希望' : type === 'confusion' ? '迷茫' : type,
        value: Math.round(value / history.length)
      }));

    wx.showModal({
      title: '情绪档案',
      content: `你已经倾诉了 ${history.length} 次\n平均情绪强度：${Math.round(totalIntensity / history.length)}%\n\n主导情绪分布：\n${topEmotions.map(e => `${e.label} ${e.value}%`).join('\n')}`,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  showCollection() {
    wx.showToast({
      title: '收藏功能开发中',
      icon: 'none'
    });
  },

  showHistory() {
    const history = getEmotionHistory();

    if (history.length === 0) {
      wx.showToast({
        title: '暂无播放记录',
        icon: 'none'
      });
      return;
    }

    wx.showToast({
      title: `共 ${history.length} 条记录`,
      icon: 'none'
    });
  },

  showSettings() {
    wx.showActionSheet({
      itemList: ['通知设置', '隐私设置', '清除缓存', '关于我们'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.showToast({ title: '通知设置', icon: 'none' });
            break;
          case 1:
            wx.showToast({ title: '隐私设置', icon: 'none' });
            break;
          case 2:
            this.clearCache();
            break;
          case 3:
            this.showAbout();
            break;
        }
      }
    });
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地缓存吗？',
      confirmColor: '#E07A5F',
      success: (res) => {
        if (res.confirm) {
          clearStorage();
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
          this.loadUserData();
        }
      }
    });
  },

  showAbout() {
    wx.showModal({
      title: '关于 Echoes / 回响',
      content: '版本 1.0.0\n\n给你的情绪配一段电影 BGM。\n\n一款基于 AI 实时音频生成技术，连接即时情绪与音乐品味的轻量化疗愈社交数字产品。',
      showCancel: false,
      confirmText: '了解了'
    });
  },

  onEditProfile() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  onShareApp() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
})
