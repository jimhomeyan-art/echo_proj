import './App.css'
import Home from './pages/Home'
import Channel from './pages/Channel'
import Capsule from './pages/Capsule'
import Mine from './pages/Mine'
import CreateCapsule from './pages/CreateCapsule'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { EmotionProvider } from './context/EmotionContext'
import { ChatProvider, useChat } from './context/ChatContext'
import ChatDialog from './components/ChatDialog'

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const chat = useChat()

  const activeTab = location.pathname.startsWith('/channel') ? 'channel'
    : location.pathname.startsWith('/capsule') ? 'capsule'
      : location.pathname.startsWith('/mine') ? 'mine'
        : 'home'

  const go = (path: string) => {
    navigate(path)
  }

  return (
    <div className="app">
      {/* Background */}
      <div className="fluid-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/channel" element={<Channel />} />
          <Route path="/capsule" element={<Capsule />} />
          <Route path="/mine" element={<Mine />} />
          <Route path="/capsule/create" element={<CreateCapsule />} />
        </Routes>
      </main>

      {/* Global Chat Dialog: persists across route changes */}
      {chat.isOpen && (
        <ChatDialog
          key={chat.sessionId}
          initialText={chat.initialText}
          onClose={chat.closeChat}
        />
      )}

      {/* Tab Bar */}
      <nav className="tab-bar">
        <button className={`tab-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => go('/')}>
          <div className="tab-icon"><div className="icon-home"></div></div>
          <span>首页</span>
        </button>
        <button className={`tab-item ${activeTab === 'channel' ? 'active' : ''}`} onClick={() => go('/channel')}>
          <div className="tab-icon"><div className="icon-channel"></div></div>
          <span>频道</span>
        </button>
        <button className={`tab-item ${activeTab === 'capsule' ? 'active' : ''}`} onClick={() => go('/capsule')}>
          <div className="tab-icon"><div className="icon-capsule"></div></div>
          <span>胶囊</span>
        </button>
        <button className={`tab-item ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => go('/mine')}>
          <div className="tab-icon"><div className="icon-user"></div></div>
          <span>我的</span>
        </button>
      </nav>
    </div>
  )
}

function App() {
  return (
    <EmotionProvider>
      <ChatProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </ChatProvider>
    </EmotionProvider>
  )
}

export default App
