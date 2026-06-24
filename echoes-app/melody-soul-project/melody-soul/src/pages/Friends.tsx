import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserPlus, Check, X, Clock, Users, ArrowLeft, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import {
  searchUsers, listFriends, listRequests,
  sendFriendRequest, respondRequest,
  type SearchResult, type FriendRequest, type Relation
} from '../services/friends';
import { joinMatch, cancelMatch, onMatchFound } from '../services/im';
import { useIM } from '../context/IMContext';
import { ChatRoom } from '../components/chat/ChatRoom';
import type { AuthUser } from '../services/auth';

type View = 'chats' | 'list' | 'search' | 'requests' | 'match';

// 相对时间：今天 HH:mm / 昨天 / M月D日
function relTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return '昨天';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export const FriendsPage: React.FC = () => {
  const [view, setView] = useState<View>('chats');
  const [friends, setFriends] = useState<AuthUser[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatWith, setChatWith] = useState<AuthUser | null>(null);
  const { conversations, unread, refresh: refreshConvs } = useIM();

  const refresh = useCallback(async () => {
    try {
      const [f, r] = await Promise.all([listFriends(), listRequests()]);
      setFriends(f);
      setRequests(r);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openChat = (u: AuthUser) => { setChatWith(u); };
  const backFromChat = () => { setChatWith(null); refreshConvs(); };

  if (chatWith) {
    return <ChatRoom friend={chatWith} onBack={backFromChat} />;
  }
  if (view === 'match') {
    return (
      <MatchView
        onBack={() => { setView('chats'); refresh(); }}
        onStartChat={(partner) => { setView('chats'); refresh(); setChatWith(partner); }}
      />
    );
  }
  if (view === 'search') {
    return <SearchView onBack={() => { setView('list'); refresh(); }} />;
  }
  if (view === 'requests') {
    return (
      <RequestsView
        requests={requests}
        onBack={() => setView('list')}
        onChanged={() => { refresh(); refreshConvs(); }}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-md mx-auto px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            {/* 分段：消息 / 好友 */}
            <div className="flex items-center gap-1 bg-ink-50 rounded-pill p-1">
              <button
                onClick={() => setView('chats')}
                className={`px-4 py-1.5 rounded-pill text-[14px] font-semibold transition-colors ${
                  view === 'chats' ? 'bg-ink-900 text-white' : 'text-ink-500'
                }`}
              >消息</button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-1.5 rounded-pill text-[14px] font-semibold transition-colors ${
                  view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-500'
                }`}
              >好友</button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('requests')}
                className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press relative"
                aria-label="好友申请"
              >
                <Clock className="w-4 h-4" />
                {requests.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-tinder-flame text-white text-[10px] font-semibold flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setView('search')}
                className="w-10 h-10 rounded-full bg-ink-900 text-white flex items-center justify-center btn-press"
                aria-label="添加好友"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {view === 'list' && (
            <>
              <button
                onClick={() => setView('search')}
                className="mt-4 w-full flex items-center gap-2 pl-10 pr-4 py-2.5 bg-ink-50 rounded-pill text-[14px] text-ink-300 relative text-left"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
                搜索用户名添加好友...
              </button>
              <button
                onClick={() => setView('match')}
                className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-card bg-gradient-to-r from-echo-green to-tinder-lime text-ink-900 btn-press text-left"
              >
                <span className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-semibold">情绪匹配</span>
                  <span className="block text-[12px] opacity-70">找到此刻和你有相同情绪的人</span>
                </span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-3">
        {view === 'chats' ? (
          conversations.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="w-7 h-7 text-ink-300" />}
              title="还没有聊天"
              desc="去「好友」里找人聊聊，或试试情绪匹配"
              action={<button onClick={() => setView('list')} className="mt-4 px-5 py-2.5 bg-echo-green text-ink-900 rounded-pill font-semibold text-[14px] btn-press">去找好友</button>}
            />
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => {
                const n = unread[c.user.id] || 0;
                const last = c.lastMessage;
                const preview = !last ? '' : last.type === 'music' ? '[音乐]' : last.content;
                return (
                  <button
                    key={c.conversationId}
                    onClick={() => openChat(c.user)}
                    className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <img src={c.user.avatar} alt={c.user.nickname} className="w-12 h-12 rounded-full object-cover" />
                      {n > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-tinder-flame text-white text-[10px] font-semibold flex items-center justify-center">
                          {n > 99 ? '99+' : n}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[14px] text-ink-900 truncate">{c.user.nickname}</h3>
                      <p className="text-[12px] text-ink-500 truncate">{preview}</p>
                    </div>
                    {last && <span className="text-[11px] text-ink-300 flex-shrink-0">{relTime(last.createdAt)}</span>}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 text-ink-300 animate-spin" /></div>
          ) : friends.length === 0 ? (
            <EmptyState
              icon={<Users className="w-7 h-7 text-ink-300" />}
              title="还没有好友"
              desc="搜索用户名，发送好友申请开始连接"
              action={<button onClick={() => setView('search')} className="mt-4 px-5 py-2.5 bg-echo-green text-ink-900 rounded-pill font-semibold text-[14px] btn-press">添加好友</button>}
            />
          ) : (
            <div className="space-y-1">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => openChat(f)}
                  className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left"
                >
                  <img src={f.avatar} alt={f.nickname} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[14px] text-ink-900 truncate">{f.nickname}</h3>
                    <p className="text-[12px] text-ink-500 truncate">@{f.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

// ── 搜索添加好友 ──
const SearchView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const key = q.trim();
    if (!key) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try { setResults(await searchUsers(key)); } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const add = async (u: SearchResult) => {
    setPending((p) => ({ ...p, [u.id]: true }));
    try {
      const { status } = await sendFriendRequest(u.id);
      setResults((rs) => rs.map((r) => r.id === u.id ? { ...r, relation: status as Relation } : r));
    } catch {
      /* ignore */
    } finally {
      setPending((p) => ({ ...p, [u.id]: false }));
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-md mx-auto px-3 pt-4 pb-3 flex items-center gap-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-ink-50 text-ink-900" aria-label="返回">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="输入用户名或昵称..."
              className="w-full pl-10 pr-4 py-2.5 bg-ink-50 rounded-pill text-[14px] text-ink-900 placeholder:text-ink-300 focus:bg-white focus:ring-1 focus:ring-ink-900 outline-none transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-ink-300 animate-spin" /></div>
        ) : results.length === 0 ? (
          <p className="text-center text-[13px] text-ink-300 py-10">{q.trim() ? '没有找到匹配的用户' : '输入关键词搜索用户'}</p>
        ) : (
          <div className="space-y-1">
            {results.map((u) => (
              <div key={u.id} className="w-full flex items-center gap-3 p-3 rounded-card">
                <img src={u.avatar} alt={u.nickname} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[14px] text-ink-900 truncate">{u.nickname}</h3>
                  <p className="text-[12px] text-ink-500 truncate">@{u.username}</p>
                </div>
                <RelationButton relation={u.relation} loading={!!pending[u.id]} onAdd={() => add(u)} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const RelationButton: React.FC<{ relation: Relation; loading: boolean; onAdd: () => void }> = ({ relation, loading, onAdd }) => {
  if (relation === 'friends') return <span className="text-[12px] text-ink-300 font-medium px-2">已是好友</span>;
  if (relation === 'outgoing') return <span className="text-[12px] text-ink-300 font-medium px-2">待通过</span>;
  if (relation === 'incoming') return <span className="text-[12px] text-echo-green font-medium px-2">待你确认</span>;
  return (
    <button
      onClick={onAdd}
      disabled={loading}
      className="px-3.5 py-2 rounded-pill bg-echo-green text-ink-900 text-[13px] font-semibold btn-press flex items-center gap-1 flex-shrink-0 disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
      添加
    </button>
  );
};

// ── 好友申请 ──
const RequestsView: React.FC<{ requests: FriendRequest[]; onBack: () => void; onChanged: () => void }> = ({ requests, onBack, onChanged }) => {
  const [busy, setBusy] = useState<Record<number, boolean>>({});

  const handle = async (requestId: number, action: 'accept' | 'reject') => {
    setBusy((b) => ({ ...b, [requestId]: true }));
    try { await respondRequest(requestId, action); onChanged(); }
    catch { setBusy((b) => ({ ...b, [requestId]: false })); }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-md mx-auto px-3 pt-4 pb-3 flex items-center gap-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-ink-50 text-ink-900" aria-label="返回">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[18px] font-display font-bold text-ink-900">好友申请</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-3">
        {requests.length === 0 ? (
          <p className="text-center text-[13px] text-ink-300 py-16">暂无新的好友申请</p>
        ) : (
          <div className="space-y-1">
            {requests.map((r) => (
              <div key={r.requestId} className="w-full flex items-center gap-3 p-3 rounded-card">
                <img src={r.user.avatar} alt={r.user.nickname} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[14px] text-ink-900 truncate">{r.user.nickname}</h3>
                  <p className="text-[12px] text-ink-500 truncate">@{r.user.username}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handle(r.requestId, 'accept')}
                    disabled={busy[r.requestId]}
                    className="w-9 h-9 rounded-full bg-echo-green text-ink-900 flex items-center justify-center btn-press disabled:opacity-60"
                    aria-label="同意"
                  >
                    {busy[r.requestId] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handle(r.requestId, 'reject')}
                    disabled={busy[r.requestId]}
                    className="w-9 h-9 rounded-full border border-ink-100 text-ink-500 flex items-center justify-center btn-press disabled:opacity-60"
                    aria-label="拒绝"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }> = ({ icon, title, desc, action }) => (
  <div className="flex flex-col items-center text-center py-16">
    <div className="w-16 h-16 rounded-full bg-ink-50 flex items-center justify-center mb-4">{icon}</div>
    <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
    <p className="text-[13px] text-ink-500 mt-1 max-w-[240px]">{desc}</p>
    {action}
  </div>
);

// ── 情绪匹配 ──
const EMOTIONS = [
  { key: 'joy', label: '开心', emoji: '😊' },
  { key: 'melancholy', label: '难过', emoji: '😢' },
  { key: 'calm', label: '平静', emoji: '😌' },
  { key: 'anxiety', label: '焦虑', emoji: '😰' },
  { key: 'solitude', label: '孤独', emoji: '🌙' },
  { key: 'anger', label: '愤怒', emoji: '😤' },
  { key: 'hope', label: '期待', emoji: '✨' },
  { key: 'exhaustion', label: '疲惫', emoji: '😮‍💨' },
];

type MatchStage = 'pick' | 'searching' | 'matched';

const MatchView: React.FC<{ onBack: () => void; onStartChat: (p: AuthUser) => void }> = ({ onBack, onStartChat }) => {
  const [stage, setStage] = useState<MatchStage>('pick');
  const [emotion, setEmotion] = useState<typeof EMOTIONS[number] | null>(null);
  const [partner, setPartner] = useState<AuthUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const off = onMatchFound(({ partner: p }) => {
      setPartner(p);
      setStage('matched');
    });
    return () => { off(); };
  }, []);

  useEffect(() => {
    return () => { cancelMatch(); };
  }, []);

  const pick = async (e: typeof EMOTIONS[number]) => {
    setEmotion(e);
    setError('');
    setStage('searching');
    try {
      const res = await joinMatch(e.key);
      if (res.matched && res.partner) {
        setPartner(res.partner);
        setStage('matched');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '匹配失败');
      setStage('pick');
    }
  };

  const stop = async () => {
    await cancelMatch();
    setStage('pick');
    setEmotion(null);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-md mx-auto px-3 pt-4 pb-3 flex items-center gap-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-ink-50 text-ink-900" aria-label="返回">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[18px] font-display font-bold text-ink-900">情绪匹配</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-6">
        {stage === 'pick' && (
          <>
            <p className="text-[14px] text-ink-500 text-center mb-6">此刻你是什么心情？选择后为你匹配同频的人</p>
            {error && <p className="text-[13px] text-tinder-flame text-center mb-4">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              {EMOTIONS.map((e) => (
                <button
                  key={e.key}
                  onClick={() => pick(e)}
                  className="flex items-center gap-3 px-4 py-4 rounded-card bg-white border border-ink-100 hover:border-echo-green btn-press"
                >
                  <span className="text-[26px]">{e.emoji}</span>
                  <span className="text-[15px] font-semibold text-ink-900">{e.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {stage === 'searching' && (
          <div className="flex flex-col items-center text-center pt-16">
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <span className="absolute inset-0 rounded-full bg-echo-green/20 animate-ping" />
              <span className="absolute inset-3 rounded-full bg-echo-green/30 animate-pulse" />
              <span className="relative text-[44px]">{emotion?.emoji}</span>
            </div>
            <h3 className="text-[16px] font-semibold text-ink-900">正在寻找同样「{emotion?.label}」的人...</h3>
            <p className="text-[13px] text-ink-500 mt-2">匹配成功后会自动成为好友</p>
            <button
              onClick={stop}
              className="mt-8 px-6 py-2.5 rounded-pill border border-ink-100 text-ink-900 font-semibold text-[14px] btn-press"
            >
              取消匹配
            </button>
          </div>
        )}

        {stage === 'matched' && partner && (
          <div className="flex flex-col items-center text-center pt-12">
            <div className="relative mb-4">
              <img src={partner.avatar} alt={partner.nickname} className="w-24 h-24 rounded-full object-cover ring-4 ring-echo-green/30" />
              <span className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-echo-green flex items-center justify-center text-[18px]">{emotion?.emoji}</span>
            </div>
            <h3 className="text-[18px] font-display font-bold text-ink-900">匹配成功！</h3>
            <p className="text-[14px] text-ink-900 mt-1">{partner.nickname}</p>
            <p className="text-[12px] text-ink-500">@{partner.username}</p>
            <p className="text-[13px] text-ink-500 mt-3">你们此刻都感到「{emotion?.label}」</p>
            <button
              onClick={() => onStartChat(partner)}
              className="mt-8 w-full max-w-[260px] py-3 rounded-pill bg-echo-green text-ink-900 font-semibold text-[15px] shadow-flame btn-press"
            >
              开始聊天
            </button>
            <button
              onClick={() => { setStage('pick'); setPartner(null); setEmotion(null); }}
              className="mt-3 text-[13px] text-ink-500 btn-press"
            >
              继续匹配其他人
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
