// pages/home/index.js
const app = getApp();
const { analyzeEmotion, getEmotionMusic, getGreeting } = require('../../utils/emotions.js');
const { addEmotionRecord, getEmotionHistory } = require('../../utils/storage.js');

Page({
  data: {
    // Greeting
    greeting: null,
    timeGreeting: '',

    // Input
    inputText: '',
    inputFocus: false,
    isAnalyzing: false,

    // Emotion Result
    emotionResult: null,
    showResult: false,

    // Music
    currentMusic: null,
    isPlaying: false,

    // Background
    gradientColors: ['#0D1B2A', '#1B263B', '#415A77'],
    particles: [],

    // UI State
    currentStep: 'input', // input, analyzing, result

    // History
    recentEmotions: []
  },

  onLoad() {
    this.initGreeting();
    this.initParticles();
    this.loadRecentEmotions();
  },

  onShow() {
    // Update tab bar
    if (this.selectComponent('#tab-bar')) {
      this.selectComponent('#tab-bar').updateSelected();
    }
  },

  initGreeting() {
    const greeting = getGreeting();
    this.setData({
      greeting: greeting,
      timeGreeting: `${greeting.text}此刻你在想什么？`
    });
  },

  initParticles() {
    // Generate floating particles
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10
      });
    }
    this.setData({ particles });
  },

  loadRecentEmotions() {
    const history = getEmotionHistory();
    this.setData({
      recentEmotions: history.slice(0, 3)
    });
  },

  onInputFocus() {
    this.setData({ inputFocus: true });
  },

  onInputBlur() {
    this.setData({ inputFocus: false });
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  onSubmit() {
    const text = this.data.inputText.trim();
    if (!text) {
      wx.showToast({
        title: '请输入你的想法',
        icon: 'none'
      });
      return;
    }

    this.analyzeText(text);
  },

  analyzeText(text) {
    this.setData({ isAnalyzing: true, currentStep: 'analyzing' });

    // Simulate AI analysis delay
    setTimeout(() => {
      const result = analyzeEmotion(text);
      const music = getEmotionMusic(result.dominant);

      // Save to history
      const record = {
        text,
        emotions: result.emotions,
        dominant: result.dominant,
        intensity: result.intensity,
        music: music
      };
      addEmotionRecord(record);

      // Update gradient based on dominant emotion
      const gradientColors = this.getGradientForEmotion(result.dominant);

      this.setData({
        emotionResult: {
          ...result,
          music: music
        },
        currentMusic: {
          ...music,
          artist: 'Echoes AI',
          duration: 60,
          gradient: gradientColors
        },
        gradientColors,
        isAnalyzing: false,
        showResult: true,
        currentStep: 'result'
      });

      // Add to recent emotions
      this.loadRecentEmotions();
    }, 2000);
  },

  getGradientForEmotion(emotion) {
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
    };
    return gradients[emotion] || ['#415A77', '#1B263B'];
  },

  onPlayMusic() {
    this.setData({ isPlaying: !this.data.isPlaying });
  },

  onSaveCapsule() {
    if (!this.data.emotionResult) return;

    wx.navigateTo({
      url: '/pages/capsule/create?data=' + encodeURIComponent(JSON.stringify({
        text: this.data.inputText,
        emotion: this.data.emotionResult,
        music: this.data.currentMusic
      }))
    });
  },

  onNewAnalysis() {
    this.setData({
      inputText: '',
      showResult: false,
      currentStep: 'input',
      emotionResult: null,
      currentMusic: null,
      isPlaying: false,
      gradientColors: ['#0D1B2A', '#1B263B', '#415A77']
    });
  },

  onVoiceInput() {
    // Check permission
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => this.startVoiceRecord(),
            fail: () => {
              wx.showToast({
                title: '请授权录音权限',
                icon: 'none'
              });
            }
          });
        } else {
          this.startVoiceRecord();
        }
      }
    });
  },

  startVoiceRecord() {
    const recorderManager = wx.getRecorderManager();

    recorderManager.onStart(() => {
      this.setData({ isRecording: true });
    });

    recorderManager.onEnd((res) => {
      this.setData({ isRecording: false });
      if (res.duration > 1000) {
        // For demo, use a simulated transcription
        this.analyzeText('今天的项目终于完成了，感觉如释重负，希望接下来一切顺利。');
      }
    });

    recorderManager.onError((err) => {
      this.setData({ isRecording: false });
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    });

    recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'aac'
    });
  },

  onEmotionHistoryTap(e) {
    const emotion = e.currentTarget.dataset.emotion;
    if (emotion) {
      this.setData({
        inputText: emotion.text,
        emotionResult: {
          emotions: emotion.emotions,
          dominant: emotion.dominant,
          intensity: emotion.intensity
        },
        currentMusic: emotion.music,
        showResult: true,
        currentStep: 'result'
      });
    }
  }
})
