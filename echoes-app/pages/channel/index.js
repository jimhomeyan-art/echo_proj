// pages/channel/index.js
const { emotionFrequencies } = require('../../utils/emotions.js');

Page({
  data: {
    // User's current frequency
    userFrequency: 432,
    dominantEmotion: 'calm',

    // Nearby users
    nearbyUsers: [],

    // Radar data
    radarData: [],

    // Channel status
    currentChannel: null,
    isInChannel: false,

    // Resonance
    resonanceCount: 0,
    resonanceEffect: false,

    // Radar animation
    radarAngle: 0,

    // Demo nearby users
    demoUsers: [
      { id: 1, nickname: '深夜独行者', frequency: 430, emotion: 'melancholy', online: true },
      { id: 2, nickname: '星空旅人', frequency: 428, emotion: 'solitude', online: true },
      { id: 3, nickname: '静默聆听', frequency: 434, emotion: 'calm', online: true },
      { id: 4, nickname: '月光诗人', frequency: 525, emotion: 'hope', online: true },
      { id: 5, nickname: '晨雾漫步', frequency: 417, emotion: 'confusion', online: false },
      { id: 6, nickname: '海浪低语', frequency: 285, emotion: 'calm', online: true }
    ]
  },

  onLoad() {
    this.initRadar();
    this.updateNearbyUsers();
    this.startRadarAnimation();
  },

  onShow() {
    if (this.selectComponent('#tab-bar')) {
      this.selectComponent('#tab-bar').updateSelected();
    }
  },

  onUnload() {
    if (this.radarTimer) {
      clearInterval(this.radarTimer);
    }
  },

  initRadar() {
    const userFrequency = emotionFrequencies[this.data.dominantEmotion] || 432;
    this.setData({ userFrequency });
  },

  updateNearbyUsers() {
    // Filter users within similar frequency range
    const tolerance = 30;
    const nearbyUsers = this.data.demoUsers.filter(user => {
      return Math.abs(user.frequency - this.data.userFrequency) <= tolerance && user.online;
    });

    // Generate radar positions
    const radarData = nearbyUsers.map((user, index) => ({
      ...user,
      angle: (index / nearbyUsers.length) * 360,
      distance: 30 + Math.random() * 40, // 30-70% from center
      pulse: false
    }));

    this.setData({
      nearbyUsers,
      radarData,
      resonanceCount: nearbyUsers.length
    });
  },

  startRadarAnimation() {
    this.radarTimer = setInterval(() => {
      this.setData({
        radarAngle: (this.data.radarAngle + 2) % 360
      });
    }, 50);
  },

  onEmotionChange(e) {
    const emotion = e.currentTarget.dataset.emotion;
    this.setData({ dominantEmotion: emotion });
    this.initRadar();
    this.updateNearbyUsers();
  },

  onSendResonance(e) {
    const userId = e.currentTarget.dataset.userid;

    // Find user
    const user = this.data.nearbyUsers.find(u => u.id === userId);
    if (!user) return;

    // Trigger resonance effect
    this.setData({ resonanceEffect: true });

    // Update user's pulse state
    const radarData = this.data.radarData.map(u => {
      if (u.id === userId) {
        return { ...u, pulse: true };
      }
      return u;
    });
    this.setData({ radarData });

    // Show feedback
    wx.vibrateShort({ type: 'light' });
    wx.showToast({
      title: '共振信号已发送',
      icon: 'none',
      duration: 1500
    });

    // Reset effect
    setTimeout(() => {
      this.setData({ resonanceEffect: false });
      const updatedData = this.data.radarData.map(u => ({
        ...u,
        pulse: false
      }));
      this.setData({ radarData: updatedData });
    }, 1500);
  },

  onBroadcastResonance() {
    if (this.data.nearbyUsers.length === 0) {
      wx.showToast({
        title: '当前频道暂无同频者',
        icon: 'none'
      });
      return;
    }

    this.setData({ resonanceEffect: true });
    wx.vibrateShort({ type: 'medium' });

    // Pulse all users
    const radarData = this.data.radarData.map(u => ({
      ...u,
      pulse: true
    }));
    this.setData({ radarData });

    setTimeout(() => {
      this.setData({ resonanceEffect: false });
      const updatedData = this.data.radarData.map(u => ({
        ...u,
        pulse: false
      }));
      this.setData({ radarData: updatedData });
    }, 2000);
  },

  onMeteorCall() {
    wx.showModal({
      title: '流星通话',
      content: '确认发起60秒流星通话？需要达到Lv.3解锁。',
      confirmText: '发起',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.startMeteorCall();
        }
      }
    });
  },

  startMeteorCall() {
    wx.showToast({
      title: '正在寻找同频者...',
      icon: 'loading',
      duration: 2000
    });

    setTimeout(() => {
      wx.showModal({
        title: '流星划过',
        content: '已为你匹配一位同频者，正在连接...',
        showCancel: false,
        success: () => {
          // Would navigate to call page
          wx.showToast({
            title: '通话功能开发中',
            icon: 'none'
          });
        }
      });
    }, 2000);
  },

  onChannelSelect(e) {
    const channelId = e.currentTarget.dataset.channel;
    this.setData({
      currentChannel: channelId,
      isInChannel: true
    });
    wx.showToast({
      title: '已加入频道',
      icon: 'success'
    });
  }
})
