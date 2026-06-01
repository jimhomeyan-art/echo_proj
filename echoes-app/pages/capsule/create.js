// pages/capsule/create.js
const { addCapsule } = require('../../utils/storage.js');
const { getEmotionLabel, getEmotionColor } = require('../../utils/emotions.js');

Page({
  data: {
    // Data from previous page
    emotionData: null,
    text: '',
    music: null,

    // Form state
    additionalNote: '',
    unlockTime: 1, // years
    isPublic: false,

    // UI
    showPreview: false
  },

  onLoad(options) {
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data));
        this.setData({
          emotionData: data.emotion,
          text: data.text || '',
          music: data.music
        });
      } catch (e) {
        console.error('Failed to parse capsule data:', e);
      }
    }
  },

  onAdditionalNoteInput(e) {
    this.setData({ additionalNote: e.detail.value });
  },

  onUnlockTimeChange(e) {
    const index = parseInt(e.detail.value);
    const options = [1, 2, 3, 5];
    this.setData({ unlockTime: options[index] || 1 });
  },

  onPublicChange(e) {
    this.setData({ isPublic: e.detail.value.length > 0 });
  },

  togglePreview() {
    this.setData({ showPreview: !this.showData.showPreview });
  },

  createCapsule() {
    // Calculate unlock date
    const unlockDate = new Date();
    unlockDate.setFullYear(unlockDate.getFullYear() + this.data.unlockTime);

    const capsule = {
      createdAt: new Date().toISOString(),
      unlockAt: unlockDate.toISOString(),
      text: this.data.additionalNote || this.data.text,
      emotion: this.data.emotionData,
      musicTitle: this.data.music?.title || '无标题',
      musicMood: this.data.music?.mood || 'unknown',
      gradient: this.data.music?.gradient || ['#415A77', '#1B263B'],
      isPublic: this.data.isPublic,
      echoes: 0
    };

    addCapsule(capsule);

    wx.showToast({
      title: '胶囊已封存',
      icon: 'success',
      duration: 2000
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  getUnlockDateDisplay() {
    const unlockDate = new Date();
    unlockDate.setFullYear(unlockDate.getFullYear() + this.data.unlockTime);
    return `${unlockDate.getFullYear()}.${String(unlockDate.getMonth() + 1).padStart(2, '0')}.${String(unlockDate.getDate()).padStart(2, '0')}`;
  },

  navigateBack() {
    wx.navigateBack();
  }
})
