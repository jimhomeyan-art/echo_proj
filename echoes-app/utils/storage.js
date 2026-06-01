// utils/storage.js - 本地存储工具

const STORAGE_KEYS = {
  USER: 'echoes_user',
  EMOTIONS_HISTORY: 'echoes_emotions_history',
  CAPSULES: 'echoes_capsules',
  NOW_PLAYING: 'echoes_now_playing',
  SETTINGS: 'echoes_settings',
  FIRST_LAUNCH: 'echoes_first_launch'
};

/**
 * 设置存储
 */
function setStorage(key, data) {
  try {
    wx.setStorageSync(key, data);
    return true;
  } catch (e) {
    console.error('Storage set error:', e);
    return false;
  }
}

/**
 * 获取存储
 */
function getStorage(key, defaultValue = null) {
  try {
    const data = wx.getStorageSync(key);
    return data !== '' ? data : defaultValue;
  } catch (e) {
    console.error('Storage get error:', e);
    return defaultValue;
  }
}

/**
 * 移除存储
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('Storage remove error:', e);
    return false;
  }
}

/**
 * 清除所有存储
 */
function clearStorage() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('Storage clear error:', e);
    return false;
  }
}

/**
 * 保存用户数据
 */
function saveUser(user) {
  return setStorage(STORAGE_KEYS.USER, user);
}

/**
 * 获取用户数据
 */
function getUser() {
  return getStorage(STORAGE_KEYS.USER);
}

/**
 * 保存情绪历史
 */
function saveEmotionHistory(history) {
  return setStorage(STORAGE_KEYS.EMOTIONS_HISTORY, history);
}

/**
 * 获取情绪历史
 */
function getEmotionHistory() {
  return getStorage(STORAGE_KEYS.EMOTIONS_HISTORY, []);
}

/**
 * 添加情绪记录
 */
function addEmotionRecord(record) {
  const history = getEmotionHistory();
  history.unshift({
    ...record,
    id: 'emotion_' + Date.now(),
    createdAt: new Date().toISOString()
  });
  // 保留最近100条
  if (history.length > 100) {
    history.pop();
  }
  saveEmotionHistory(history);
  return record;
}

/**
 * 保存胶囊
 */
function saveCapsules(capsules) {
  return setStorage(STORAGE_KEYS.CAPSULES, capsules);
}

/**
 * 获取胶囊列表
 */
function getCapsules() {
  return getStorage(STORAGE_KEYS.CAPSULES, []);
}

/**
 * 添加胶囊
 */
function addCapsule(capsule) {
  const capsules = getCapsules();
  const newCapsule = {
    ...capsule,
    id: 'capsule_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  capsules.unshift(newCapsule);
  saveCapsules(capsules);
  return newCapsule;
}

/**
 * 删除胶囊
 */
function deleteCapsule(capsuleId) {
  const capsules = getCapsules();
  const index = capsules.findIndex(c => c.id === capsuleId);
  if (index > -1) {
    capsules.splice(index, 1);
    saveCapsules(capsules);
    return true;
  }
  return false;
}

/**
 * 保存当前播放
 */
function saveNowPlaying(music) {
  return setStorage(STORAGE_KEYS.NOW_PLAYING, music);
}

/**
 * 获取当前播放
 */
function getNowPlaying() {
  return getStorage(STORAGE_KEYS.NOW_PLAYING);
}

/**
 * 保存设置
 */
function saveSettings(settings) {
  return setStorage(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * 获取设置
 */
function getSettings() {
  return getStorage(STORAGE_KEYS.SETTINGS, {
    musicVolume: 80,
    hapticFeedback: true,
    autoPlayMusic: true
  });
}

/**
 * 检查是否首次启动
 */
function isFirstLaunch() {
  const launched = getStorage(STORAGE_KEYS.FIRST_LAUNCH);
  if (!launched) {
    setStorage(STORAGE_KEYS.FIRST_LAUNCH, true);
    return true;
  }
  return false;
}

module.exports = {
  STORAGE_KEYS,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  saveUser,
  getUser,
  saveEmotionHistory,
  getEmotionHistory,
  addEmotionRecord,
  saveCapsules,
  getCapsules,
  addCapsule,
  deleteCapsule,
  saveNowPlaying,
  getNowPlaying,
  saveSettings,
  getSettings,
  isFirstLaunch
};
