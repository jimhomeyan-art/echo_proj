import { useState, useEffect } from 'react'
import { useEmotion } from '../context/EmotionContext'
import { useNavigate } from 'react-router-dom'
import './Capsule.css'

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

export default function Capsule() {
  const navigate = useNavigate()
  const { capsules, deleteCapsule } = useEmotion()
  const [currentTab, setCurrentTab] = useState('capsules')
  const [echoes, setEchoes] = useState([
    {
      id: 'echo_1',
      type: 'self',
      message: '一年前的今天，你曾这样写道：',
      preview: '今天完成了项目，感觉如释重负...',
      createdAt: '2023-05-05',
      musicTitle: '曙光'
    },
    {
      id: 'echo_2',
      type: 'match',
      message: '有人与你共情，写下了类似的情绪',
      preview: '那天的孤独感，我也曾体会...',
      createdAt: '2024-04-20',
      emotion: 'solitude'
    }
  ])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个时空胶囊吗？删除后无法恢复。')) {
      deleteCapsule(id)
    }
  }

  const handleCreateCapsule = () => {
    navigate('/capsule/create')
  }

  const handleEchoTap = (echo: typeof echoes[0]) => {
    alert(`${echo.message}\n\n"${echo.preview}"`)
  }

  return (
    <div className="page capsule-page">
      {/* Header */}
      <header className="header">
        <h1 className="page-title">时空胶囊</h1>
        <p className="page-subtitle">封存此刻，寄向未来</p>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${currentTab === 'capsules' ? 'active' : ''}`}
          onClick={() => setCurrentTab('capsules')}
        >
          <span>我的胶囊</span>
          {capsules.length > 0 && <div className="tab-count">{capsules.length}</div>}
        </button>
        <button
          className={`tab ${currentTab === 'echoes' ? 'active' : ''}`}
          onClick={() => setCurrentTab('echoes')}
        >
          <span>收到的回响</span>
          {echoes.length > 0 && <div className="tab-count">{echoes.length}</div>}
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {currentTab === 'capsules' && (
          <>
            {capsules.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <div className="capsule-icon">
                    <div className="capsule-body"></div>
                    <div className="capsule-cap"></div>
                  </div>
                </div>
                <h3 className="empty-title">还没有胶囊</h3>
                <p className="empty-desc">在首页倾诉后，可以将情绪与配乐存入时空胶囊</p>
              </div>
            ) : (
              <div className="capsule-list">
                {capsules.map(capsule => (
                  <div key={capsule.id} className="capsule-card glass">
                    <div className="card-header">
                      <div className="date-badge">
                        <span className="date-text">{formatDate(capsule.createdAt)}</span>
                      </div>
                      <div
                        className="emotion-tag"
                        style={{
                          background: `${emotionColors[capsule.emotion?.dominant] || '#778DA9'}20`,
                          color: emotionColors[capsule.emotion?.dominant] || '#778DA9'
                        }}
                      >
                        {emotionLabels[capsule.emotion?.dominant] || '平静'}
                      </div>
                    </div>

                    <p className="card-content">{capsule.text || '记忆已模糊，但情绪还在...'}</p>

                    <div className="music-info">
                      <div className="music-icon">
                        <div className="music-note"></div>
                      </div>
                      <span className="music-title">{capsule.musicTitle || '无标题配乐'}</span>
                    </div>

                    <div className="card-footer">
                      {capsule.echoes > 0 && (
                        <div className="echoes-count">
                          <div className="echo-icon"></div>
                          <span>{capsule.echoes} 次回响</span>
                        </div>
                      )}
                      {capsule.isPublic && (
                        <div className="public-status">
                          <div className="public-icon"></div>
                          <span>已公开</span>
                        </div>
                      )}
                      <button className="delete-btn" onClick={() => handleDelete(capsule.id)}>
                        <div className="delete-icon"></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {currentTab === 'echoes' && (
          <>
            {echoes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <div className="echo-icon-large"></div>
                </div>
                <h3 className="empty-title">暂无回响</h3>
                <p className="empty-desc">当你公开的胶囊被他人共情时，会收到回响</p>
              </div>
            ) : (
              <div className="echo-list">
                {echoes.map(echo => (
                  <div key={echo.id} className="echo-card glass" onClick={() => handleEchoTap(echo)}>
                    <div className="echo-header">
                      <div className={`echo-type ${echo.type}`}>
                        <div className="echo-type-icon"></div>
                        <span>{echo.type === 'self' ? '一年前的自己' : '与你共情的人'}</span>
                      </div>
                      <span className="echo-date">{echo.createdAt}</span>
                    </div>

                    <p className="echo-message">{echo.message}</p>

                    <div className="echo-preview">
                      <span>"{echo.preview}"</span>
                    </div>

                    {echo.musicTitle && (
                      <div className="echo-footer">
                        <div className="music-tag">
                          <div className="mini-music-icon"></div>
                          <span>{echo.musicTitle}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB Button */}
      {currentTab === 'capsules' && (
        <button className="fab" onClick={handleCreateCapsule}>
          <div className="fab-icon"></div>
        </button>
      )}
    </div>
  )
}
