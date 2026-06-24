import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Loader2, Music2, Play, Pause, X } from 'lucide-react';
import { getMessages, sendMessage, getSocket, type IMMessage } from '../../services/im';
import { useAuth } from '../../context/AuthContext';
import { useIM } from '../../context/IMContext';
import { useChat } from '../../context/ChatContext';
import type { AuthUser } from '../../services/auth';

interface MusicPayload {
  id: string;
  title: string;
  cover?: string;
  duration?: string;
  url?: string;
  mood?: string;
}

// 时间格式：HH:mm
function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
// 是否需要显示时间分隔（间隔 > 5 分钟）
function needTimeSep(prev: IMMessage | undefined, cur: IMMessage) {
  if (!prev) return true;
  return cur.createdAt - prev.createdAt > 5 * 60 * 1000;
}

export const ChatRoom: React.FC<{ friend: AuthUser; onBack: () => void }> = ({ friend, onBack }) => {
  const { user } = useAuth();
  const myId = user?.id;
  const myAvatar = user?.avatar || '';
  const { setActiveUser, markRead, bump } = useIM();
  const { capsules, nowPlaying, isPlaying, setNowPlaying, togglePlay, openFullPlayer } = useChat();

  const [messages, setMessages] = useState<IMMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 标记当前会话为活跃 + 已读
  useEffect(() => {
    setActiveUser(friend.id);
    markRead(friend.id);
    return () => setActiveUser(null);
  }, [friend.id, setActiveUser, markRead]);

  // 拉历史
  useEffect(() => {
    let alive = true;
    getMessages(friend.id)
      .then((d) => { if (alive) setMessages(d.messages); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [friend.id]);

  // 监听实时消息
  useEffect(() => {
    const socket = getSocket();
    const onNew = (payload: { from: number; message: IMMessage }) => {
      if (payload.from === friend.id) {
        setMessages((prev) => prev.some((m) => m.id === payload.message.id) ? prev : [...prev, payload.message]);
        markRead(friend.id);
      }
    };
    socket.on('message:new', onNew);
    return () => { socket.off('message:new', onNew); };
  }, [friend.id, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const doSend = async (type: 'text' | 'music', content: any) => {
    if (sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(friend.id, type, content);
      setMessages((prev) => [...prev, msg]);
      bump(friend.id, msg, true);
    } catch {
      if (type === 'text') setText(content);
    } finally {
      setSending(false);
    }
  };

  const sendText = () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    doSend('text', content);
  };

  const sendMusic = (m: MusicPayload) => {
    setShowMusicPicker(false);
    doSend('music', m);
  };

  const playMusic = (m: MusicPayload) => {
    if (!m.url) return;
    const isCurrent = nowPlaying?.id === m.id;
    if (isCurrent) { togglePlay(); return; }
    setNowPlaying({ id: m.id, title: m.title, cover: m.cover, artist: friend.nickname, url: m.url, mood: m.mood });
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-[#EDEDED]">
      <header className="sticky top-0 z-30 bg-[#EDEDED]/95 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-md mx-auto px-2 h-12 flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 text-ink-900" aria-label="返回">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-[16px] text-ink-900 truncate px-2">{friend.nickname}</h1>
          <span className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-3 py-4" style={{ paddingBottom: '140px' }}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 text-ink-300 animate-spin" /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-[12px] text-ink-400 py-16">开始和 {friend.nickname} 聊天吧</p>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === myId;
              const avatar = isMe ? myAvatar : friend.avatar;
              const sep = needTimeSep(messages[i - 1], msg);
              return (
                <React.Fragment key={msg.id}>
                  {sep && (
                    <div className="flex justify-center py-2">
                      <span className="text-[11px] text-ink-400 bg-black/5 px-2 py-0.5 rounded">{fmtTime(msg.createdAt)}</span>
                    </div>
                  )}
                  <div className={`flex items-start gap-2 py-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <img src={avatar} alt="" className="w-9 h-9 rounded-[5px] object-cover flex-shrink-0" />
                    <div className="relative max-w-[68%]">
                      {msg.type === 'music' ? (
                        <MusicBubble
                          isMe={isMe}
                          music={typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content}
                          playing={(() => { const mm = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content; return nowPlaying?.id === mm.id && isPlaying; })()}
                          onPlay={playMusic}
                          onOpen={openFullPlayer}
                        />
                      ) : (
                        <>
                          {isMe
                            ? <span className="absolute right-[-5px] top-[13px] w-0 h-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-[#95EC69]" />
                            : <span className="absolute left-[-5px] top-[13px] w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-white" />}
                          <div className={`px-3 py-2 rounded-[5px] ${isMe ? 'bg-[#95EC69]' : 'bg-white'}`}>
                            <p className="text-[15px] leading-[1.4] text-ink-900 break-words whitespace-pre-wrap">
                              {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* 输入栏 */}
      <div className="fixed left-0 right-0 z-40 bg-[#F7F7F7] border-t border-black/5" style={{ bottom: '64px' }}>
        <div className="max-w-md mx-auto px-3 py-2 flex items-center gap-2">
          <button
            onClick={() => setShowMusicPicker(true)}
            className="w-9 h-9 rounded-full bg-white border border-black/5 flex items-center justify-center text-ink-700 btn-press flex-shrink-0"
            aria-label="发送音乐"
          >
            <Music2 className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendText(); }}
            className="flex-1 px-3 py-2 bg-white rounded-[5px] text-[15px] text-ink-900 outline-none border border-black/5 focus:border-black/10 transition-colors"
          />
          <button
            onClick={sendText}
            disabled={!text.trim() || sending}
            className={`px-4 py-2 rounded-[5px] text-[14px] font-medium btn-press transition-colors ${
              text.trim() ? 'bg-[#07C160] text-white' : 'bg-[#E5E5E5] text-ink-400'
            }`}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : '发送'}
          </button>
        </div>
      </div>

      {/* 音乐选择器 */}
      {showMusicPicker && (
        <MusicPicker
          capsules={capsules}
          onPick={sendMusic}
          onClose={() => setShowMusicPicker(false)}
        />
      )}
    </div>
  );
};

const MusicBubble: React.FC<{
  isMe: boolean;
  music: MusicPayload;
  playing: boolean;
  onPlay: (m: MusicPayload) => void;
  onOpen: () => void;
}> = ({ isMe, music, playing, onPlay, onOpen }) => (
  <>
    {isMe
      ? <span className="absolute right-[-5px] top-[13px] w-0 h-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-[#95EC69]" />
      : <span className="absolute left-[-5px] top-[13px] w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-white" />}
    <div className={`w-[210px] rounded-[5px] overflow-hidden ${isMe ? 'bg-[#95EC69]' : 'bg-white'}`}>
      <div className="flex items-center gap-2.5 p-2">
        <button
          onClick={() => onPlay(music)}
          className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-ink-100"
        >
          {music.cover && <img src={music.cover} alt="" className="w-full h-full object-cover" />}
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            {playing ? <Pause className="w-4 h-4 text-white" fill="currentColor" strokeWidth={0} />
                     : <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" strokeWidth={0} />}
          </span>
        </button>
        <button onClick={onOpen} className="flex-1 min-w-0 text-left">
          <p className="text-[13px] font-semibold text-ink-900 truncate">{music.title}</p>
          <p className="text-[11px] text-ink-600 truncate">{music.mood || '音乐'} · {music.duration || ''}</p>
        </button>
      </div>
      <div className="px-2 pb-1.5 flex items-center gap-1">
        <Music2 className="w-3 h-3 text-ink-500" />
        <span className="text-[10px] text-ink-500">Echoes 音乐</span>
      </div>
    </div>
  </>
);

const MusicPicker: React.FC<{
  capsules: any[];
  onPick: (m: MusicPayload) => void;
  onClose: () => void;
}> = ({ capsules, onPick, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
    <div className="absolute inset-0 bg-black/30" />
    <div
      className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl max-h-[70vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
        <h3 className="text-[16px] font-semibold text-ink-900">分享音乐</h3>
        <button onClick={onClose} className="p-1 text-ink-500"><X className="w-5 h-5" /></button>
      </div>
      <div className="overflow-y-auto p-3">
        {capsules.length === 0 ? (
          <p className="text-center text-[13px] text-ink-400 py-10">胶囊里还没有音乐</p>
        ) : (
          <div className="space-y-1">
            {capsules.map((c) => (
              <button
                key={c.id}
                onClick={() => onPick({ id: c.id, title: c.title, cover: c.cover, duration: c.duration, url: c.url, mood: c.mood })}
                className="w-full flex items-center gap-3 p-2.5 rounded-card hover:bg-ink-50 text-left"
              >
                <img src={c.cover} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink-900 truncate">{c.title}</p>
                  <p className="text-[12px] text-ink-500 truncate">{c.mood || '音乐'} · {c.duration || ''}</p>
                </div>
                <Music2 className="w-4 h-4 text-echo-green flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
