// components/music-player/index.js
const app = getApp();

Component({
  properties: {
    music: {
      type: Object,
      value: null
    },
    autoPlay: {
      type: Boolean,
      value: false
    },
    compact: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isPlaying: false,
    currentTime: 0,
    duration: 60,
    progress: 0,
    waveform: [],
    isDragging: false
  },

  lifetimes: {
    attached() {
      this.initWaveform();
      this.audioContext = wx.createInnerAudioContext();
      this.audioContext.onTimeUpdate(() => {
        if (!this.data.isDragging) {
          this.updateProgress();
        }
      });
      this.audioContext.onEnded(() => {
        this.setData({ isPlaying: false, currentTime: 0, progress: 0 });
      });
    },
    detached() {
      if (this.audioContext) {
        this.audioContext.destroy();
      }
    }
  },

  observers: {
    'music': function(music) {
      if (music) {
        this.setData({ duration: music.duration || 60 });
      }
    },
    'autoPlay': function(autoPlay) {
      if (autoPlay && this.data.music) {
        this.play();
      }
    }
  },

  methods: {
    initWaveform() {
      // 生成波形数据
      const waveform = [];
      for (let i = 0; i < 30; i++) {
        waveform.push({
          height: Math.random() * 30 + 10,
          delay: i * 50
        });
      }
      this.setData({ waveform });
    },

    updateProgress() {
      const currentTime = this.audioContext.currentTime;
      const duration = this.audioContext.duration || this.data.duration;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      this.setData({ currentTime, progress });
    },

    togglePlay() {
      if (this.data.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },

    play() {
      this.audioContext.play();
      this.setData({ isPlaying: true });
      this.animateWaveform();
    },

    pause() {
      this.audioContext.pause();
      this.setData({ isPlaying: false });
    },

    stop() {
      this.audioContext.stop();
      this.setData({ isPlaying: false, currentTime: 0, progress: 0 });
    },

    animateWaveform() {
      if (!this.data.isPlaying) return;

      const waveform = this.data.waveform.map((bar, i) => ({
        ...bar,
        height: Math.random() * 30 + 10 + (this.data.isPlaying ? 15 : 0)
      }));
      this.setData({ waveform });

      setTimeout(() => this.animateWaveform(), 150);
    },

    seek(e) {
      const touch = e.touches ? e.touches[0] : { clientX: 0 };
      const rect = this.createSelectorQuery().select('.progress-track').boundingClientRect();
      rect.then((res) => {
        if (res) {
          const x = touch.clientX - res.left;
          const percent = Math.max(0, Math.min(1, x / res.width));
          const seekTime = percent * this.data.duration;
          this.audioContext.seek(seekTime);
          this.setData({ currentTime: seekTime, progress: percent * 100 });
        }
      });
    },

    onProgressStart() {
      this.setData({ isDragging: true });
    },

    onProgressEnd() {
      this.setData({ isDragging: false });
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }
})
