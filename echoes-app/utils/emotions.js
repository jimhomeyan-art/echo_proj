// utils/emotions.js - 情绪分析工具

// 情绪关键词库
const emotionKeywords = {
  melancholy: {
    keywords: ['孤独', '寂寞', '难过', '伤心', '失落', '空虚', '忧郁', '沉默', '安静', '夜深', '凌晨', '独自', '一个人', '想念', '回忆', '过去', '遗憾', '后悔', '错', '可惜'],
    color: '#778DA9',
    label: '忧郁'
  },
  solitude: {
    keywords: ['一个人', '孤单', '孤独', '无人', '身边没人', '独自', '没人', '寂寞', '想一个人', '静静', '独处'],
    color: '#415A77',
    label: '孤独'
  },
  anxiety: {
    keywords: ['焦虑', '不安', '紧张', '担心', '害怕', '恐惧', '慌乱', '压力', '焦虑', '睡不着', '失眠', '难眠', '忐忑', '心慌'],
    color: '#E07A5F',
    label: '焦虑'
  },
  anger: {
    keywords: ['生气', '愤怒', '气', '恼火', '烦躁', '不爽', '讨厌', '厌恶', '怨恨', '不满', '火大', '怒'],
    color: '#F4845F',
    label: '愤怒'
  },
  confusion: {
    keywords: ['迷茫', '困惑', '不懂', '不知道', '怎么办', '如何', '选择', '纠结', '犹豫', '矛盾', '混乱', '迷失', '方向'],
    color: '#9D8DF1',
    label: '迷茫'
  },
  calm: {
    keywords: ['平静', '宁静', '安静', '放松', '舒适', '自在', '平和', '淡定', '从容', '舒缓'],
    color: '#81B29A',
    label: '平静'
  },
  joy: {
    keywords: ['开心', '快乐', '高兴', '愉快', '兴奋', '欢喜', '喜', '乐', '幸福', '满足', '美好', '棒', '赞'],
    color: '#FFD166',
    label: '喜悦'
  },
  hope: {
    keywords: ['希望', '期待', '憧憬', '向往', '梦想', '未来', '明天', '新', '开始', '希望', '光明', '曙光', '期待'],
    color: '#4EA8DE',
    label: '希望'
  },
  exhaustion: {
    keywords: ['累', '疲惫', '疲倦', '困', '困了', '无力', '虚脱', '疲惫', '疲倦', '乏', '倦', '累', '倦意'],
    color: '#6C757D',
    label: '疲惫'
  }
};

// 情绪到音乐的映射
const emotionMusicMap = {
  melancholy: { title: '深夜独白', mood: 'melancholic', gradient: ['#415A77', '#1B263B'] },
  solitude: { title: '蓝色时刻', mood: 'ethereal', gradient: ['#415A77', '#778DA9'] },
  anxiety: { title: '不安的浪潮', mood: 'tense', gradient: ['#E07A5F', '#F4845F'] },
  anger: { title: '暗涌', mood: 'intense', gradient: ['#F4845F', '#E07A5F'] },
  confusion: { title: '迷雾', mood: 'mysterious', gradient: ['#9D8DF1', '#778DA9'] },
  calm: { title: '湖面微风', mood: 'peaceful', gradient: ['#81B29A', '#4EA8DE'] },
  joy: { title: '晨光', mood: 'uplifting', gradient: ['#FFD166', '#F4845F'] },
  hope: { title: '曙光', mood: 'hopeful', gradient: ['#4EA8DE', '#81B29A'] },
  exhaustion: { title: '低沉', mood: 'restful', gradient: ['#415A77', '#6C757D'] }
};

// 频率计算 (Hz)
const emotionFrequencies = {
  melancholy: 432,
  solitude: 396,
  anxiety: 528,
  anger: 639,
  confusion: 417,
  calm: 285,
  joy: 639,
  hope: 528,
  exhaustion: 174
};

/**
 * 分析文本情绪
 * @param {string} text - 用户输入的文本
 * @returns {Object} 情绪分析结果
 */
function analyzeEmotion(text) {
  if (!text || typeof text !== 'string') {
    return {
      emotions: { calm: 100 },
      dominant: 'calm',
      intensity: 50,
      frequency: 285
    };
  }

  const normalizedText = text.toLowerCase();
  const emotionScores = {};

  // 计算每种情绪的得分
  for (const [emotion, data] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }
    emotionScores[emotion] = score;
  }

  // 计算总分
  const totalScore = Object.values(emotionScores).reduce((sum, s) => sum + s, 0);

  // 转换为百分比
  const emotions = {};
  if (totalScore > 0) {
    for (const [emotion, score] of Object.entries(emotionScores)) {
      emotions[emotion] = Math.round((score / totalScore) * 100);
    }
  } else {
    // 默认情绪分布
    emotions.calm = 60;
    emotions.melancholy = 25;
    emotions.hope = 15;
  }

  // 确保总和为100
  const values = Object.values(emotions);
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum !== 100 && sum > 0) {
    const diff = 100 - sum;
    // 找到最大值的key添加差值
    const maxKey = Object.entries(emotions).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    emotions[maxKey] += diff;
  }

  // 确定主导情绪
  let dominant = 'calm';
  let maxScore = 0;
  for (const [emotion, score] of Object.entries(emotions)) {
    if (score > maxScore) {
      maxScore = score;
      dominant = emotion;
    }
  }

  // 计算情绪强度 (0-100)
  const intensity = totalScore > 0
    ? Math.min(100, 30 + Math.min(70, totalScore / 2))
    : 50;

  // 计算频率
  const frequency = emotionFrequencies[dominant] || 432;

  return {
    emotions,
    dominant,
    intensity,
    frequency,
    label: emotionKeywords[dominant]?.label || '平静',
    color: emotionKeywords[dominant]?.color || '#81B29A'
  };
}

/**
 * 获取情绪对应的音乐信息
 * @param {string} dominantEmotion - 主导情绪
 * @returns {Object} 音乐信息
 */
function getEmotionMusic(dominantEmotion) {
  return emotionMusicMap[dominantEmotion] || emotionMusicMap.calm;
}

/**
 * 获取情绪颜色
 * @param {string} emotion - 情绪类型
 * @returns {string} 颜色值
 */
function getEmotionColor(emotion) {
  return emotionKeywords[emotion]?.color || '#778DA9';
}

/**
 * 获取情绪标签
 * @param {string} emotion - 情绪类型
 * @returns {string} 标签文字
 */
function getEmotionLabel(emotion) {
  return emotionKeywords[emotion]?.label || '未知';
}

/**
 * 获取所有情绪类型
 * @returns {Array} 情绪类型列表
 */
function getAllEmotions() {
  return Object.entries(emotionKeywords).map(([key, data]) => ({
    type: key,
    label: data.label,
    color: data.color
  }));
}

/**
 * 生成时间问候语
 * @returns {string} 根据时间的问候语
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) {
    return { text: '凌晨好，', emoji: '🌙', mood: '安静的' };
  } else if (hour < 9) {
    return { text: '早安，', emoji: '🌅', mood: '清新的' };
  } else if (hour < 12) {
    return { text: '上午好，', emoji: '☀️', mood: '充满活力的' };
  } else if (hour < 14) {
    return { text: '中午好，', emoji: '🌤️', mood: '温暖的' };
  } else if (hour < 18) {
    return { text: '下午好，', emoji: '🌇', mood: '惬意的' };
  } else if (hour < 22) {
    return { text: '晚上好，', emoji: '🌆', mood: '放松的' };
  } else {
    return { text: '夜深了，', emoji: '🌙', mood: '安静的' };
  }
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * 获取相对时间描述
 * @param {Date|string} date - 日期
 * @returns {string} 相对时间描述
 */
function getRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDate(date);
}

module.exports = {
  analyzeEmotion,
  getEmotionMusic,
  getEmotionColor,
  getEmotionLabel,
  getAllEmotions,
  getGreeting,
  formatDate,
  getRelativeTime,
  emotionKeywords,
  emotionMusicMap,
  emotionFrequencies
};
