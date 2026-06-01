// pages/capsule/index.js
const { getCapsules, deleteCapsule, addCapsule } = require('../../utils/storage.js');
const { formatDate, getEmotionLabel, getEmotionColor } = require('../../utils/emotions.js');

Page({
  data: {
    capsules: [],
    echoes: [],
    currentTab: 'capsules',
    isLoading: true
  },

  onLoad() {
    this.loadCapsules();
    this.loadEchoes();
  },

  onShow() {
    if (this.selectComponent('#tab-bar')) {
      this.selectComponent('#tab-bar').updateSelected();
    }
    this.loadCapsules();
  },

  loadCapsules() {
    this.setData({ isLoading: true });

    setTimeout(() => {
      const capsules = getCapsules();

      // Transform capsules for display
      const displayCapsules = capsules.map(capsule => ({
        ...capsule,
        formattedDate: formatDate(capsule.createdAt),
        emotionLabel: getEmotionLabel(capsule.emotion?.dominant || 'calm'),
        emotionColor: getEmotionColor(capsule.emotion?.dominant || 'calm'),
        isLocked: new Date(capsule.unlockAt) > new Date()
      }));

      this.setData({
        capsules: displayCapsules,
        isLoading: false
      });
    }, 500);
  },

  loadEchoes() {
    // Mock echoes (回响) - notifications from past capsules
    const echoes = [
      {
        id: 'echo_1',
        type: 'self',
        capsuleId: 'capsule_old_1',
        message: '一年前的今天，你曾这样写道：',
        preview: '今天完成了项目，感觉如释重负...',
        createdAt: '2023-05-05',
        musicTitle: '曙光'
      },
      {
        id: 'echo_2',
        type: 'match',
        capsuleId: 'capsule_match_1',
        message: '有人与你共情，写下了类似的情绪',
        preview: '那天的孤独感，我也曾体会...',
        createdAt: '2024-04-20',
        emotion: 'solitude'
      }
    ];

    this.setData({ echoes });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  onCapsuleTap(e) {
    const capsule = e.currentTarget.dataset.capsule;

    if (capsule.isLocked) {
      wx.showToast({
        title: '胶囊尚未解锁',
        icon: 'none'
      });
      return;
    }

    // Navigate to capsule detail or play
    wx.showModal({
      title: capsule.musicTitle || '时空胶囊',
      content: capsule.content || '记忆已模糊，但情绪还在...',
      confirmText: '播放配乐',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          this.playCapsuleMusic(capsule);
        }
      }
    });
  },

  playCapsuleMusic(capsule) {
    // Would trigger music player
    wx.showToast({
      title: '正在播放...',
      icon: 'none'
    });
  },

  onDeleteCapsule(e) {
    const capsuleId = e.currentTarget.dataset.capsuleid;

    wx.showModal({
      title: '删除胶囊',
      content: '确定要删除这个时空胶囊吗？删除后无法恢复。',
      confirmColor: '#E07A5F',
      success: (res) => {
        if (res.confirm) {
          deleteCapsule(capsuleId);
          this.loadCapsules();
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  onCreateCapsule() {
    wx.navigateTo({
      url: '/pages/capsule/create'
    });
  },

  onEchoTap(e) {
    const echo = e.currentTarget.dataset.echo;

    wx.showModal({
      title: '回响',
      content: `${echo.message}\n\n"${echo.preview}"`,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // Generate demo capsules for empty state
  generateDemoCapsules() {
    const demoCapsules = [
      {
        id: 'demo_1',
        createdAt: '2024-04-15T20:30:00',
        unlockAt: '2025-04-15T20:30:00',
        content: '今天完成了困扰两周的项目，如释重负。希望接下来的路能更顺利。',
        emotion: { dominant: 'hope', emotions: { hope: 45, relief: 35, calm: 20 } },
        musicTitle: '曙光',
        isPublic: false,
        echoes: 2
      },
      {
        id: 'demo_2',
        createdAt: '2024-03-28T02:15:00',
        unlockAt: '2025-03-28T02:15:00',
        content: '凌晨三点，窗外只有路灯的光。失眠成了老朋友。',
        emotion: { dominant: 'solitude', emotions: { solitude: 50, exhaustion: 30, melancholy: 20 } },
        musicTitle: '蓝色时刻',
        isPublic: true,
        echoes: 5
      }
    ];

    demoCapsules.forEach(capsule => addCapsule(capsule));
    this.loadCapsules();
  }
})
