import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, Clock, Share2, Heart, Download, X } from 'lucide-react';
import { emotionTags, chatHistory } from '../data/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  type?: 'text' | 'music';
  music?: {
    id: string;
    title: string;
    cover: string;
    duration: string;
    style?: string;
    mood?: string;
  };
  timestamp: string;
  isGenerating?: boolean;
}

const aiAvatar = 'https://images.unsplash.com/photo-1614680096595-9f902a4d19e3?w=100&h=100&fit=crop';

export const CreatePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(chatHistory);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: '刚刚',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Simulate AI generating music
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '我已经根据您的描述创作了一首音乐！🎵 这是一首充满情感的作品，希望您会喜欢~',
        type: 'music',
        music: {
          id: `gen-${Date.now()}`,
          title: inputValue.length > 15 ? inputValue.slice(0, 15) + '...' : inputValue,
          cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
          duration: '3:45',
          style: 'AI生成',
          mood: '创意',
        },
        timestamp: '刚刚',
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 3000);
  };

  const handleEmotionClick = (emotion: typeof emotionTags[0]) => {
    setInputValue(`创作一首${emotion.label}情绪的音乐`);
    handleSend();
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-text-primary">AI音乐创作</h1>
              <p className="text-xs text-text-secondary">描述您的情绪，我来创作</p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-xl bg-gray-100 text-text-secondary hover:text-text-primary transition-colors btn-press relative"
          >
            <Clock className="w-5 h-5" />
            {showHistory && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </header>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white border-b border-gray-100 animate-slide-down">
          <div className="max-w-md mx-auto px-5 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">创作历史</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={`https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emotion Tags */}
      <div className="max-w-md mx-auto px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {emotionTags.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => handleEmotionClick(emotion)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-sm font-medium whitespace-nowrap btn-press hover:shadow-soft transition-all"
              style={{ borderColor: `${emotion.color}40`, borderWidth: 1 }}
            >
              <span>{emotion.emoji}</span>
              <span style={{ color: emotion.color }}>{emotion.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-5 py-4 pb-32">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Avatar */}
              {message.role === 'assistant' ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-secondary p-0.5">
                  <div className="w-full h-full rounded-xl bg-white p-0.5">
                    <img
                      src={aiAvatar}
                      alt="AI"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
              )}

              {/* Message Content */}
              <div className={`flex-1 max-w-[75%] ${message.role === 'user' ? 'items-end' : ''}`}>
                {message.type === 'music' && message.music ? (
                  // Music Card Message
                  <div className="space-y-3">
                    <div className="bg-white rounded-2xl p-4 shadow-soft">
                      <p className="text-sm leading-relaxed text-text-primary">{message.content}</p>
                    </div>
                    {/* Music Generated Card */}
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary font-medium">AI已为您创作</span>
                      </div>
                      <div className="bg-white rounded-xl overflow-hidden shadow-soft">
                        <div className="relative aspect-video">
                          <img
                            src={message.music.cover}
                            alt={message.music.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-primary">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-text-primary">{message.music.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-text-secondary px-2 py-1 rounded-full bg-gray-100">
                              {message.music.style}
                            </span>
                            <span className="text-xs text-text-secondary px-2 py-1 rounded-full bg-gray-100">
                              {message.music.mood}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-text-secondary">{message.music.duration}</span>
                            <div className="flex items-center gap-2">
                              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <Heart className="w-4 h-4 text-text-secondary" />
                              </button>
                              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <Share2 className="w-4 h-4 text-text-secondary" />
                              </button>
                              <button className="p-2 rounded-full gradient-primary shadow-primary">
                                <Download className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Text Message
                  <div
                    className={`
                      rounded-2xl px-4 py-3
                      ${message.role === 'user'
                        ? 'gradient-primary text-white rounded-tr-sm'
                        : 'bg-white rounded-tl-sm shadow-soft'
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-text-primary'}">{message.content}</p>
                  </div>
                )}
                <p className="text-xs text-text-muted mt-1 px-1">{message.timestamp}</p>
              </div>
            </div>
          ))}

          {/* Generating Animation */}
          {isGenerating && (
            <div className="flex gap-3 animate-slide-up">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-secondary p-0.5">
                <div className="w-full h-full rounded-xl bg-white p-0.5">
                  <img
                    src={aiAvatar}
                    alt="AI"
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 max-w-[75%]">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex items-end gap-1 h-6">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-2 bg-primary rounded-full music-wave"
                          style={{ height: `${8 + i * 4}px` }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">AI正在创作中...</p>
                      <p className="text-xs text-text-secondary mt-1">根据您的描述生成独特音乐</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-text-muted">情感分析</span>
                      <span className="text-xs text-text-muted">生成中...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-full bg-gray-100 text-text-secondary hover:text-primary transition-colors btn-press">
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="描述您想要的音乐..."
                className="w-full bg-gray-100 rounded-full px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-muted"
              />
              {inputValue && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/50 rounded-full breathe"
                      style={{ height: `${4 + i * 2}px` }}
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`
                p-4 rounded-full gradient-primary shadow-primary
                transition-all duration-300 btn-press
                ${inputValue.trim() ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}
              `}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Quick Suggestions */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {['欢快的电子音乐', '悲伤的钢琴曲', '神秘的古典乐', '浪漫的爵士'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInputValue(suggestion);
                  handleSend();
                }}
                className="flex-shrink-0 px-3 py-2 rounded-full bg-gray-100 text-xs text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};