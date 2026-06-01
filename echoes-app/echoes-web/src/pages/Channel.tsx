import { useState, useEffect } from 'react'
import './Channel.css'

const emotionColors: Record<string, string> = {
  melancholy: '#778DA9',
  solitude: '#415A77',
  calm: '#81B29A',
  hope: '#4EA8DE',
  confusion: '#9D8DF1'
}

const emotionLabels: Record<string, string> = {
  melancholy: '忧郁',
  solitude: '孤独',
  calm: '平静',
  hope: '希望',
  confusion: '迷茫'
}

const emotionFrequencies: Record<string, number> = {
  melancholy: 432,
  solitude: 396,
  calm: 285,
  hope: 528,
  confusion: 417
}

const demoUsers = [
  { id: 1, nickname: '深夜独行者', frequency: 430, emotion: 'melancholy', online: true },
  { id: 2, nickname: '星空旅人', frequency: 428, emotion: 'solitude', online: true },
  { id: 3, nickname: '静默聆听', frequency: 434, emotion: 'calm', online: true },
  { id: 4, nickname: '月光诗人', frequency: 525, emotion: 'hope', online: true },
  { id: 5, nickname: '海浪低语', frequency: 285, emotion: 'calm', online: true }
]

export default function Channel() {
  const [dominantEmotion, setDominantEmotion] = useState('calm')
  const [userFrequency, setUserFrequency] = useState(285)
  const [radarAngle, setRadarAngle] = useState(0)
  const [nearbyUsers, setNearbyUsers] = useState<typeof demoUsers>([])
  const [resonanceEffect, setResonanceEffect] = useState(false)
  const [pulsingUser, setPulsingUser] = useState<number | null>(null)

  useEffect(() => {
    setUserFrequency(emotionFrequencies[dominantEmotion] || 432)
  }, [dominantEmotion])

  useEffect(() => {
    const tolerance = 30
    const nearby = demoUsers.filter(user =>
      Math.abs(user.frequency - userFrequency) <= tolerance && user.online
    )
    setNearbyUsers(nearby)

    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 2) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [userFrequency])

  const handleSendResonance = (userId: number) => {
    setResonanceEffect(true)
    setPulsingUser(userId)
    setTimeout(() => {
      setResonanceEffect(false)
      setPulsingUser(null)
    }, 1500)
  }

  const handleBroadcast = () => {
    if (nearbyUsers.length === 0) return
    setResonanceEffect(true)
    setPulsingUser(-1)
    setTimeout(() => {
      setResonanceEffect(false)
      setPulsingUser(null)
    }, 2000)
  }

  return (
    <div className="page channel-page">
      {/* Header */}
      <header className="header">
        <h1 className="page-title">即时频道</h1>
        <p className="page-subtitle">与同频者共振</p>
      </header>

      {/* Content */}
      <div className="content">
        {/* Frequency Card */}
        <div className="frequency-card glass">
          <div className="frequency-header">
            <div className="frequency-icon">
              <div className="frequency-wave"></div>
            </div>
            <span className="frequency-label">你的情绪频率</span>
          </div>

          <div className="frequency-value">
            <span className="freq-number">{userFrequency}</span>
            <span className="freq-unit">Hz</span>
          </div>

          <div className="emotion-selector">
            {Object.entries(emotionLabels).map(([key, label]) => (
              <button
                key={key}
                className={`emotion-pill ${dominantEmotion === key ? 'active' : ''}`}
                onClick={() => setDominantEmotion(key)}
              >
                <div className="pill-dot" style={{ background: emotionColors[key] }}></div>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Radar Section */}
        <div className="radar-section">
          <span className="section-label">共振雷达</span>

          <div className={`radar-container ${resonanceEffect ? 'active' : ''}`}>
            <div className="radar-circles">
              <div className="circle c1"></div>
              <div className="circle c2"></div>
              <div className="circle c3"></div>
            </div>

            <div className="radar-sweep" style={{ transform: `rotate(${radarAngle}deg)` }}>
              <div className="sweep-line"></div>
            </div>

            <div className="radar-center">
              <div className="center-dot"></div>
              <div className="center-pulse"></div>
            </div>

            {nearbyUsers.map((user, index) => {
              const angle = (index / nearbyUsers.length) * 360
              const distance = 30 + Math.random() * 40
              return (
                <div
                  key={user.id}
                  className={`user-point ${pulsingUser === user.id ? 'pulse' : ''}`}
                  style={{
                    transform: `rotate(${angle}deg) translateY(-${distance}%)`,
                    '--point-color': emotionColors[user.emotion]
                  } as React.CSSProperties}
                  onClick={() => handleSendResonance(user.id)}
                >
                  <div className="point-dot"></div>
                </div>
              )
            })}

            <div className="radar-labels">
              <span className="freq-label top">{userFrequency + 50}</span>
              <span className="freq-label right">{userFrequency + 100}</span>
              <span className="freq-label bottom">{userFrequency - 50}</span>
              <span className="freq-label left">{userFrequency - 100}</span>
            </div>
          </div>

          <div className="resonance-info">
            <span className="info-text">附近有 {nearbyUsers.length} 位同频者</span>
            <button className="broadcast-btn" onClick={handleBroadcast}>
              <div className="broadcast-icon"></div>
              <span>广播共振</span>
            </button>
          </div>
        </div>

        {/* Nearby Users */}
        <div className="users-section">
          <span className="section-label">同频者</span>

          <div className="users-list">
            {nearbyUsers.map(user => (
              <div
                key={user.id}
                className="user-card glass"
                onClick={() => handleSendResonance(user.id)}
              >
                <div className="user-avatar">
                  <div
                    className="avatar-bg"
                    style={{ background: `linear-gradient(135deg, ${emotionColors[user.emotion]}, #1B263B)` }}
                  >
                    <span className="avatar-text">{user.nickname[0]}</span>
                  </div>
                  <div className="online-indicator"></div>
                </div>

                <div className="user-info">
                  <span className="user-name">{user.nickname}</span>
                  <span className="user-freq">{user.frequency} Hz</span>
                </div>

                <div className="resonance-btn">
                  <div className="resonance-icon"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meteor Call */}
        <div className="meteor-section">
          <button className="meteor-btn">
            <div className="meteor-icon">
              <div className="meteor-trail"></div>
              <div className="meteor-head"></div>
            </div>
            <span>发起流星通话</span>
            <div className="level-badge">Lv.3</div>
          </button>
        </div>
      </div>
    </div>
  )
}
