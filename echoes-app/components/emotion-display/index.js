// components/emotion-display/index.js
const { getEmotionColor, getEmotionLabel } = require('../../utils/emotions.js');

Component({
  properties: {
    emotions: {
      type: Object,
      value: {}
    },
    dominant: {
      type: String,
      value: 'calm'
    },
    intensity: {
      type: Number,
      value: 50
    }
  },

  data: {
    sortedEmotions: [],
    displayEmotions: []
  },

  observers: {
    'emotions': function(emotions) {
      if (emotions) {
        this.processEmotions(emotions);
      }
    }
  },

  methods: {
    processEmotions(emotions) {
      // 排序并过滤非零情绪
      const sorted = Object.entries(emotions)
        .filter(([_, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, value]) => ({
          type,
          value,
          label: getEmotionLabel(type),
          color: getEmotionColor(type)
        }));

      this.setData({ sortedEmotions: sorted });

      // 动画展示
      this.animateDisplay(sorted);
    },

    animateDisplay(emotions) {
      const displayEmotions = [];
      let index = 0;

      const addNext = () => {
        if (index < emotions.length) {
          displayEmotions.push(emotions[index]);
          this.setData({ displayEmotions: [...displayEmotions] });
          index++;
          setTimeout(addNext, 150);
        }
      };

      addNext();
    },

    onEmotionTap(e) {
      const emotion = e.currentTarget.dataset.emotion;
      this.triggerEvent('emotiontap', emotion);
    }
  }
})
