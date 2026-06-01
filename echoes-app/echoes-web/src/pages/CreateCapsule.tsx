import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEmotion } from '../context/EmotionContext'
import './CreateCapsule.css'

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

export default function CreateCapsule() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addCapsule } = useEmotion()

  const emotionData = location.state?.emotion
  const [additionalNote, setAdditionalNote] = useState('')
  const [unlockTime, setUnlockTime] = useState(1)
  const [isPublic, setIsPublic] = useState(false)

  const getUnlockDate = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + unlockTime)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  const handleCreate = () => {
    const capsule = {
      id: `capsule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      unlockAt: new Date(Date.now() + unlockTime * 365 * 24 * 60 * 60 * 1000).toISOString(),
      text: additionalNote || emotionData?.text || '',
      emotion: emotionData,
      musicTitle: emotionData?.music?.title || '无标题',
      isPublic,
      echoes: 0
    }

    addCapsule(capsule)
    alert('胶囊已封存')
    navigate('/capsule')
  }

  return (
    <div className="page create-page">
      {/* Header */}
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <div className="back-icon"></div>
        </button>
        <h1 className="page-title">封存胶囊</h1>
        <div className="placeholder"></div>
      </header>

      {/* Content */}
      <div className="content">
        {/* Emotion Summary */}
        {emotionData && (
          <div className="emotion-summary glass">
            <span className="summary-label">当前情绪</span>
            <div className="emotion-display">
              <div className="emotion-dot" style={{ background: emotionColors[emotionData.dominant] }}></div>
              <span className="emotion-name">{emotionLabels[emotionData.dominant] || '平静'}</span>
              <span className="emotion-intensity">{emotionData.intensity}% 强度</span>
            </div>
          </div>
        )}

        {/* Music Info */}
        {emotionData?.music && (
          <div className="music-card glass">
            <div
              className="music-cover"
              style={{ background: `linear-gradient(135deg, ${emotionData.music.gradient[0]}, ${emotionData.music.gradient[1]})` }}
            >
              <div className="cover-glow"></div>
            </div>
            <div className="music-info">
              <span className="music-title">{emotionData.music.title}</span>
              <span className="music-artist">Echoes AI</span>
            </div>
          </div>
        )}

        {/* Additional Note */}
        <div className="note-section">
          <span className="section-label">想对未来说的话（选填）</span>
          <textarea
            className="note-input"
            placeholder="记录此刻的想法，一年后回看..."
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
            maxLength={200}
          />
          <span className="char-count">{additionalNote.length}/200</span>
        </div>

        {/* Unlock Time */}
        <div className="unlock-section">
          <span className="section-label">解封时间</span>
          <select
            className="unlock-picker glass"
            value={unlockTime}
            onChange={(e) => setUnlockTime(Number(e.target.value))}
          >
            <option value={1}>1年后</option>
            <option value={2}>2年后</option>
            <option value={3}>3年后</option>
            <option value={5}>5年后</option>
          </select>
          <span className="unlock-hint">将于 {getUnlockDate()} 解封</span>
        </div>

        {/* Public Toggle */}
        <div className="public-section">
          <div className="public-toggle">
            <div className="toggle-info">
              <span className="toggle-title">公开胶囊</span>
              <span className="toggle-desc">允许他人共情并回响</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Create Button */}
        <button className="create-btn btn-primary" onClick={handleCreate}>
          <div className="capsule-icon-small"></div>
          <span>封存此刻</span>
        </button>
      </div>
    </div>
  )
}
