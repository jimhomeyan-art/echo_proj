import { useState, useEffect, useRef } from 'react'
import { useEmotion } from '../context/EmotionContext'
import { detectStyleReference, detectWantsSong } from '../context/EmotionContext'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import './Home.css'

// Emotion analysis keywords
const emotionKeywords: Record<string, { keywords: string[], color: string, label: string }> = {
  melancholy: {
    keywords: ['孤独', '寂寞', '难过', '伤心', '失落', '空虚', '忧郁', '沉默', '夜深', '凌晨', '想念', '回忆'],
    color: '#778DA9',
    label: '忧郁'
  },
  solitude: {
    keywords: ['一个人', '孤单', '无人', '独自', '没人', '静'],
    color: '#415A77',
    label: '孤独'
  },
  anxiety: {
    keywords: ['焦虑', '不安', '紧张', '担心', '害怕', '压力', '失眠', '忐忑'],
    color: '#E07A5F',
    label: '焦虑'
  },
  confusion: {
    keywords: ['迷茫', '困惑', '不懂', '怎么办', '选择', '纠结', '方向'],
    color: '#9D8DF1',
    label: '迷茫'
  },
  calm: {
    keywords: ['平静', '宁静', '安静', '放松', '舒适', '平和'],
    color: '#81B29A',
    label: '平静'
  },
  joy: {
    keywords: ['开心', '快乐', '高兴', '幸福', '美好', '棒'],
    color: '#FFD166',
    label: '喜悦'
  },
  hope: {
    keywords: ['希望', '期待', '憧憬', '梦想', '未来', '曙光'],
    color: '#4EA8DE',
    label: '希望'
  }
}

const emotionMusicMap: Record<string, { title: string, mood: string, prompt: string, gradient: string[] }> = {
  melancholy: { title: '深夜独白', mood: 'melancholic', prompt: 'melancholic cinematic ambient music, minor key, slow piano, string orchestra, atmospheric, film score', gradient: ['#415A77', '#1B263B'] },
  solitude: { title: '蓝色时刻', mood: 'ethereal', prompt: 'ethereal ambient music, spacey synth pads, soft textures, minimalist, dreamy, contemplative', gradient: ['#415A77', '#778DA9'] },
  anxiety: { title: '不安的浪潮', mood: 'tense', prompt: 'tense cinematic music, minor key, building tension, subtle drums, strings, anxiety atmosphere', gradient: ['#E07A5F', '#F4845F'] },
  confusion: { title: '迷雾', mood: 'mysterious', prompt: 'mysterious ambient music, dissonant harmonies, floating synths, uncertain atmosphere', gradient: ['#9D8DF1', '#778DA9'] },
  calm: { title: '湖面微风', mood: 'peaceful', prompt: 'peaceful ambient music, gentle piano, nature sounds, serene, relaxing, zen', gradient: ['#81B29A', '#4EA8DE'] },
  joy: { title: '晨光', mood: 'uplifting', prompt: 'uplifting cheerful music, major key, bright melody, light percussion, happy atmosphere', gradient: ['#FFD166', '#F4845F'] },
  hope: { title: '曙光', mood: 'hopeful', prompt: 'inspiring cinematic music, epic orchestral, hopeful melody, uplifting, motivational', gradient: ['#4EA8DE', '#81B29A'] }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return { text: '凌晨好，', mood: '安静的' }
  if (hour < 9) return { text: '早安，', mood: '清新的' }
  if (hour < 12) return { text: '上午好，', mood: '充满活力的' }
  if (hour < 14) return { text: '中午好，', mood: '温暖的' }
  if (hour < 18) return { text: '下午好，', mood: '惬意的' }
  if (hour < 22) return { text: '晚上好，', mood: '放松的' }
  return { text: '夜深了，', mood: '安静的' }
}

function analyzeEmotion(text: string) {
  if (!text.trim()) return { emotions: { calm: 100 }, dominant: 'calm', intensity: 50 }

  const emotionScores: Record<string, number> = {}
  for (const [emotion, data] of Object.entries(emotionKeywords)) {
    let score = 0
    for (const keyword of data.keywords) {
      if (text.includes(keyword)) score += 10
    }
    emotionScores[emotion] = score
  }

  const totalScore = Object.values(emotionScores).reduce((sum, s) => sum + s, 0)
  const emotions: Record<string, number> = {}

  if (totalScore > 0) {
    for (const [emotion, score] of Object.entries(emotionScores)) {
      emotions[emotion] = Math.round((score / totalScore) * 100)
    }
  } else {
    emotions.calm = 60
    emotions.hope = 25
    emotions.melancholy = 15
  }

  let dominant = 'calm'
  let maxScore = 0
  for (const [emotion, score] of Object.entries(emotions)) {
    if (score > maxScore) {
      maxScore = score
      dominant = emotion
    }
  }

  return {
    emotions,
    dominant,
    intensity: totalScore > 0 ? Math.min(100, 30 + Math.min(70, totalScore / 2)) : 50
  }
}

export default function Home() {
  const navigate = useNavigate()
  const chat = useChat()
  const { addEmotionRecord, emotionHistory, currentEmotion, setCurrentEmotion, generateMusic, isGeneratingMusic, musicResult } = useEmotion()
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingMusicUI, setIsGeneratingMusicUI] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [greeting, setGreeting] = useState(getGreeting())
  const [isPlaying, setIsPlaying] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('准备为你的情绪谱写配乐...')
  const [waveformBars, setWaveformBars] = useState<number[]>([])

  // Audio player ref
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setWaveformBars([...Array(30)].map(() => Math.random() * 30 + 10))
      }
    }, 150)
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleSubmit = async () => {
    if (!inputText.trim()) return
    chat.openChat(inputText)
  }

  const handleNewAnalysis = () => {
    setInputText('')
    setShowResult(false)
    setShowMusicPlayer(false)
    setIsPlaying(false)
    setCurrentEmotion(null)
  }

  const handleSaveCapsule = () => {
    navigate('/capsule/create', { state: { emotion: currentEmotion } })
  }

  return (
    <div className="page home-page">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">
            <div className="logo-inner"></div>
          </div>
          <span className="logo-text">Echoes</span>
        </div>
        <p className="greeting">{greeting.text}此刻你在想什么？</p>
      </header>

      {/* Main Content */}
      <div className="content">
        {!showResult && !isAnalyzing && (
          <div className="input-section">
            <div className="input-container glass">
              <textarea
                className="emotion-input"
                placeholder="此刻，你的思绪在飘向何方..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={500}
              />
              <div className="input-footer">
                <span className="char-count">{inputText.length}/500</span>
                <div className="input-actions">
                  <button className="submit-btn btn-primary" onClick={handleSubmit}>
                    倾诉
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="analyzing-section">
            <div className="analyzing-container">
              <div className="analyzing-orbs">
                <div className="orb"></div>
                <div className="orb"></div>
                <div className="orb"></div>
              </div>
              <p className="analyzing-text">AI 正在创作配乐中...</p>
              <p key={generationStatus} className="analyzing-subtext">{generationStatus}</p>
            </div>
          </div>
        )}

        {showResult && currentEmotion && (
          <div className="result-section">
            {/* Emotion Display */}
            <div className="emotion-result glass animate-slide-up">
              <h3 className="section-title">情绪画像</h3>
              <div className="intensity-section">
                <span className="intensity-label">情绪强度</span>
                <div className="intensity-bar">
                  <div className="intensity-fill" style={{ width: `${currentEmotion.intensity}%` }}></div>
                </div>
                <span className="intensity-value">{currentEmotion.intensity}%</span>
              </div>
              <div className="emotions-container">
                {Object.entries(currentEmotion.emotions)
                  .filter(([_, value]) => value > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([type, value], index) => (
                    <div
                      key={type}
                      className="emotion-item animate-slide-up"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div
                        className="emotion-card"
                        style={{ '--emotion-color': emotionKeywords[type]?.color || '#778DA9' } as React.CSSProperties}
                      >
                        <div className="emotion-glow"></div>
                        <span className="emotion-label">{emotionKeywords[type]?.label || type}</span>
                        <div className="emotion-bar">
                          <div className="emotion-bar-fill" style={{ width: `${value}%` }}></div>
                        </div>
                        <span className="emotion-percent">{value}%</span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="dominant-section">
                <span className="dominant-label">主导情绪</span>
                <div className="dominant-display">
                  <div className="dominant-dot" style={{ background: emotionKeywords[currentEmotion.dominant]?.color }}></div>
                  <span className="dominant-text">{emotionKeywords[currentEmotion.dominant]?.label || '平静'}</span>
                </div>
              </div>
            </div>

            {/* Music Generating Status */}
            {isGeneratingMusicUI && (
              <div className="music-generating-section animate-slide-up">
                <div className="generating-container">
                  <div className="generating-icon">
                    <div className="generating-spinner"></div>
                  </div>
                  <div className="generating-text">
                    <span className="generating-title">AI 正在创作配乐</span>
                    <span key={generationStatus} className="generating-subtitle generating-status">{generationStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Music Player */}
            {showMusicPlayer && currentEmotion && currentEmotion.music.musicUrl && (
              <div className="music-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="music-header">
                  <h3 className="section-title">为你谱写的配乐</h3>
                  {musicResult?.error?.includes('模拟') ? (
                    <span className="music-source-tag mock">模拟音乐</span>
                  ) : (
                    <span className="music-source-tag ai">AI 创作</span>
                  )}
                </div>
                <div className="music-player glass">
                  <div className="player-header">
                    <div
                      className={`cover ${isPlaying ? 'playing' : ''}`}
                      style={{ background: `linear-gradient(135deg, ${currentEmotion.music.gradient[0]}, ${currentEmotion.music.gradient[1]})` }}
                    >
                      <div className="cover-inner">
                        <div className="cover-glow"></div>
                      </div>
                    </div>
                    <div className="info">
                      <span className="title">{currentEmotion.music.title}</span>
                      <span className="artist">Echoes AI</span>
                    </div>
                  </div>

                  <div className="waveform-container">
                    <div className="waveform">
                      {waveformBars.map((height, i) => (
                        <div
                          key={i}
                          className={`wave-bar ${isPlaying ? 'active' : ''}`}
                          style={{ height: isPlaying ? `${height}px` : '8px', animationDelay: `${i * 50}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="progress-section">
                    <span className="time">0:00</span>
                    <div className="progress-wrapper">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                        <div className="progress-thumb" style={{ left: '0%' }}></div>
                      </div>
                    </div>
                    <span className="time">1:00</span>
                  </div>

                  <div className="controls">
                    <button className="control-btn secondary" onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.pause()
                        audioRef.current.currentTime = 0
                      }
                      setIsPlaying(false)
                    }}>
                      <div className="icon-stop"></div>
                    </button>
                    <button className={`control-btn primary ${isPlaying ? 'playing' : ''}`} onClick={() => {
                      if (!audioRef.current) {
                        audioRef.current = new Audio(currentEmotion.music.musicUrl)
                        audioRef.current.onended = () => setIsPlaying(false)
                      }
                      if (isPlaying) {
                        audioRef.current.pause()
                      } else {
                        audioRef.current.play()
                      }
                      setIsPlaying(!isPlaying)
                    }}>
                      {isPlaying ? <div className="icon-pause"></div> : <div className="icon-play"></div>}
                    </button>
                    <button className="control-btn secondary">
                      <div className="icon-share"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="result-actions animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button className="action-btn btn-secondary" onClick={handleSaveCapsule}>
                <div className="action-icon capsule-icon"></div>
                <span>存入胶囊</span>
              </button>
              <button className="action-btn btn-secondary" onClick={handleNewAnalysis}>
                <div className="action-icon refresh-icon"></div>
                <span>新的倾诉</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent Emotions */}
        {emotionHistory.length > 0 && !showResult && (
          <div className="recent-section">
            <span className="section-label">最近的回响</span>
            <div className="recent-list">
              {emotionHistory.slice(0, 3).map((record) => (
                <div key={record.id} className="recent-card glass">
                  <p className="recent-text">{record.text}</p>
                  <span className="recent-time">{new Date(record.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
