import { useEmotion } from '../context/EmotionContext'
import './Mine.css'

export default function Mine() {
  const { emotionHistory, capsules } = useEmotion()

  const stats = {
    emotionCount: emotionHistory.length,
    capsuleCount: capsules.length,
    listeningMinutes: Math.floor(emotionHistory.length * 2.5),
    resonanceCount: Math.floor(emotionHistory.length * 0.3),
    level: Math.floor(emotionHistory.length / 5) + 1 || 1
  }

  const menuItems = [
    { id: 'profile', icon: 'user', title: '情绪档案', subtitle: '查看你的情绪历程' },
    { id: 'collection', icon: 'star', title: '收藏的配乐', subtitle: '你喜欢的音乐' },
    { id: 'history', icon: 'clock', title: '聆听历史', subtitle: '播放记录' },
    { id: 'settings', icon: 'settings', title: '设置', subtitle: '偏好与隐私' }
  ]

  const showEmotionProfile = () => {
    if (emotionHistory.length === 0) {
      alert('暂无情绪记录')
      return
    }

    const emotionStats: Record<string, number> = {}
    emotionHistory.forEach(record => {
      for (const [emotion, value] of Object.entries(record.emotions || {})) {
        if (!emotionStats[emotion]) emotionStats[emotion] = 0
        emotionStats[emotion] += value
      }
    })

    const topEmotions = Object.entries(emotionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, value]) => `${type} ${Math.round(value / emotionHistory.length)}%`)

    alert(`你已经倾诉了 ${emotionHistory.length} 次\n\n主导情绪分布：\n${topEmotions.join('\n')}`)
  }

  return (
    <div className="page mine-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="page-title">我的</h1>
          <button className="share-btn">
            <div className="share-icon"></div>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="content">
        {/* Profile Card */}
        <div className="profile-card glass">
          <div className="profile-main">
            <div className="avatar-wrapper">
              <div className="avatar-ring"></div>
              <div className="avatar">
                <span className="avatar-text">游</span>
              </div>
            </div>

            <div className="profile-info">
              <span className="nickname">夜行者</span>
              <div className="level-badge">
                <span>Lv.{stats.level}</span>
              </div>
            </div>

            <button className="edit-btn">
              <div className="edit-icon"></div>
            </button>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{stats.emotionCount}</span>
              <span className="stat-label">倾诉</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{stats.capsuleCount}</span>
              <span className="stat-label">胶囊</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{stats.listeningMinutes}</span>
              <span className="stat-label">分钟</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{stats.resonanceCount}</span>
              <span className="stat-label">共振</span>
            </div>
          </div>
        </div>

        {/* Journey Section */}
        <div className="journey-section">
          <span className="section-title">情绪历程</span>
          <div className="journey-card glass" onClick={showEmotionProfile}>
            <div className="journey-visual">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`journey-dot ${i < stats.emotionCount % 6 ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
            <div className="journey-info">
              <span className="journey-title">{stats.emotionCount} 次情绪记录</span>
              <span className="journey-subtitle">点击查看详细档案</span>
            </div>
            <div className="journey-arrow"></div>
          </div>
        </div>

        {/* Menu List */}
        <div className="menu-section">
          <span className="section-title">功能</span>

          <div className="menu-list">
            {menuItems.map(item => (
              <div key={item.id} className="menu-item glass">
                <div className="menu-icon">
                  <div className={`icon-${item.icon}`}></div>
                </div>
                <div className="menu-content">
                  <span className="menu-title">{item.title}</span>
                  <span className="menu-subtitle">{item.subtitle}</span>
                </div>
                <div className="menu-arrow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="app-info">
          <div className="app-logo">
            <div className="logo-icon-small"></div>
          </div>
          <span className="app-name">Echoes / 回响</span>
          <span className="app-version">Version 1.0.0</span>
        </div>
      </div>
    </div>
  )
}
