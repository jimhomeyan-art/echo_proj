// app.js
App({
  globalData: {
    user: null,
    currentEmotion: null,
    nowPlaying: null,
    isPlaying: false,
    hasInitialized: false
  },

  onLaunch() {
    // 初始化用户数据
    this.initUserData();
    // 检查是否有存储的用户
    const storedUser = wx.getStorageSync('user');
    if (storedUser) {
      this.globalData.user = storedUser;
    }
  },

  initUserData() {
    // 默认用户数据
    this.globalData.user = {
      id: 'user_' + Date.now(),
      nickname: '夜行者',
      avatar: '',
      level: 1,
      emotionCount: 0,
      capsuleCount: 0,
      createdAt: new Date().toISOString(),
      emotionHistory: [],
      capsules: []
    };
    this.globalData.hasInitialized = true;
  },

  updateUser(data) {
    this.globalData.user = { ...this.globalData.user, ...data };
    wx.setStorageSync('user', this.globalData.user);
  },

  addEmotionRecord(record) {
    if (!this.globalData.user) return;
    this.globalData.user.emotionHistory.unshift(record);
    this.globalData.user.emotionCount++;
    this.updateUser(this.globalData.user);
  },

  addCapsule(capsule) {
    if (!this.globalData.user) return;
    this.globalData.user.capsules.unshift(capsule);
    this.globalData.user.capsuleCount++;
    this.updateUser(this.globalData.user);
  },

  setNowPlaying(music, isPlaying) {
    this.globalData.nowPlaying = music;
    this.globalData.isPlaying = isPlaying;
  }
})
