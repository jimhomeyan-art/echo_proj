import React from 'react';
import { Settings, Edit3, Heart, Music, MessageCircle, Share2, ChevronRight, Shield, Bell, HelpCircle, LogOut, X, Loader2, Check } from 'lucide-react';
import { currentUser, myLibrary } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { updateProfile, fetchAvatars, type AuthUser } from '../services/auth';

export const ProfilePage: React.FC = () => {
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'works' | 'liked' | 'moments'>('works');
  const [editing, setEditing] = React.useState(false);
  const { user, logout, updateUser } = useAuth();

  // 真实登录用户信息（统计数据暂用 mock）
  const displayName = user?.nickname || currentUser.name;
  const displayUsername = user ? `@${user.username}` : currentUser.username;
  const displayAvatar = user?.avatar || currentUser.avatar;
  const displayBio = user?.bio || currentUser.bio;

  const works = myLibrary.created.concat(myLibrary.liked.slice(0, 4) as any).slice(0, 9);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-md mx-auto px-5 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-[28px] font-display font-bold text-ink-900 leading-none tracking-tight">
            个人中心
          </h1>
          <button onClick={() => setEditing(true)} className="w-10 h-10 rounded-full border border-ink-100 flex items-center justify-center text-ink-900 btn-press">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Profile */}
      <div className="max-w-md mx-auto px-5 pt-2 pb-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-1 ring-ink-100">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <button onClick={() => setEditing(true)} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ink-900 text-white flex items-center justify-center btn-press">
              <Edit3 className="w-3 h-3" />
            </button>
          </div>

          <h2 className="text-[20px] font-display font-bold text-ink-900">{displayName}</h2>
          <p className="text-[13px] text-ink-500 mt-0.5">{displayUsername}</p>
          <p className="text-[14px] text-ink-900 mt-3 max-w-xs leading-relaxed">{displayBio}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-5 w-full justify-center">
            <Stat n={currentUser.songs} label="作品" />
            <span className="w-px h-8 bg-ink-100" />
            <Stat n={currentUser.followers} label="粉丝" />
            <span className="w-px h-8 bg-ink-100" />
            <Stat n={currentUser.following} label="关注" />
            <span className="w-px h-8 bg-ink-100" />
            <Stat n={currentUser.likes} label="获赞" />
          </div>

          {/* Action */}
          <div className="flex items-center gap-2 mt-5 w-full">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`
                flex-1 py-3 rounded-pill font-semibold text-[14px] btn-press transition-colors
                ${isFollowing
                  ? 'border border-ink-100 text-ink-900 bg-white'
                  : 'bg-ink-900 text-white'}
              `}
            >
              {isFollowing ? '已关注' : '关注'}
            </button>
            <button className="w-12 h-12 rounded-full border border-ink-100 text-ink-900 flex items-center justify-center btn-press">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="w-12 h-12 rounded-full border border-ink-100 text-ink-900 flex items-center justify-center btn-press">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-5">
        <div className="flex gap-6 border-b border-ink-100">
          {([
            { id: 'works', icon: Music, label: '作品' },
            { id: 'liked', icon: Heart, label: '赞过' },
            { id: 'moments', icon: MessageCircle, label: '动态' },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3 flex items-center gap-1.5 text-[14px] font-semibold transition-colors ${
                  active ? 'text-ink-900' : 'text-ink-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {active && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-ink-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-md mx-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-2">
          {works.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 cursor-pointer group"
            >
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                <p className="text-[11px] text-white font-semibold truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="max-w-md mx-auto px-5 pt-2 pb-4">
        <h3 className="text-[12px] font-semibold text-ink-500 mb-2 px-1">设置</h3>
        <div className="space-y-1">
          {([
            { icon: Shield, label: '隐私设置' },
            { icon: Bell, label: '通知设置' },
            { icon: HelpCircle, label: '帮助与反馈' },
          ] as const).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center text-ink-900">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-[14px] font-medium text-ink-900">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-ink-300" />
              </button>
            );
          })}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-ink-50 transition-colors text-left text-tinder-flame"
          >
            <div className="w-10 h-10 rounded-full bg-tinder-flame/10 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="flex-1 text-[14px] font-medium">退出登录</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-4 text-center">
        <p className="text-[11px] text-ink-300">Echoes v1.0.0</p>
        <p className="text-[11px] text-ink-300 mt-0.5">用音乐连接世界</p>
      </div>

      {editing && user && (
        <EditProfileModal
          user={user}
          onClose={() => setEditing(false)}
          onSaved={(u) => { updateUser(u); setEditing(false); }}
        />
      )}
    </div>
  );
};

const TOKEN_KEY = 'echoes_token';

const EditProfileModal: React.FC<{
  user: AuthUser;
  onClose: () => void;
  onSaved: (u: AuthUser) => void;
}> = ({ user, onClose, onSaved }) => {
  const [nickname, setNickname] = React.useState(user.nickname);
  const [bio, setBio] = React.useState(user.bio || '');
  const [avatar, setAvatar] = React.useState(user.avatar);
  const [avatars, setAvatars] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchAvatars().then((list) => setAvatars(list.length ? Array.from(new Set([user.avatar, ...list])) : [user.avatar]));
  }, [user.avatar]);

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY) || '';
      const u = await updateProfile(token, { nickname: nickname.trim(), bio: bio.trim(), avatar });
      onSaved(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <button onClick={onClose} className="text-ink-500"><X className="w-5 h-5" /></button>
          <h3 className="text-[16px] font-semibold text-ink-900">编辑资料</h3>
          <button onClick={save} disabled={saving || !nickname.trim()} className="text-echo-green font-semibold text-[14px] disabled:opacity-40 flex items-center gap-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}保存
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {error && <p className="text-[13px] text-tinder-flame text-center">{error}</p>}

          {/* 当前头像 */}
          <div className="flex flex-col items-center">
            <img src={avatar} alt="" className="w-20 h-20 rounded-full object-cover ring-1 ring-ink-100" />
            <p className="text-[12px] text-ink-500 mt-2">选择头像</p>
          </div>

          {/* 头像选择 */}
          <div className="grid grid-cols-5 gap-3">
            {avatars.map((a) => (
              <button key={a} onClick={() => setAvatar(a)} className="relative aspect-square rounded-full overflow-hidden">
                <img src={a} alt="" className="w-full h-full object-cover" />
                {avatar === a && (
                  <span className="absolute inset-0 ring-2 ring-echo-green rounded-full flex items-center justify-center bg-black/20">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 昵称 */}
          <div>
            <label className="text-[12px] font-semibold text-ink-500 mb-1.5 block">昵称</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-2.5 bg-ink-50 rounded-card text-[14px] text-ink-900 outline-none focus:ring-1 focus:ring-ink-900"
            />
          </div>

          {/* 简介 */}
          <div>
            <label className="text-[12px] font-semibold text-ink-500 mb-1.5 block">简介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={60}
              rows={3}
              placeholder="介绍一下自己..."
              className="w-full px-4 py-2.5 bg-ink-50 rounded-card text-[14px] text-ink-900 outline-none focus:ring-1 focus:ring-ink-900 resize-none"
            />
            <p className="text-[11px] text-ink-300 text-right mt-1">{bio.length}/60</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[18px] font-display font-bold text-ink-900 tabular-nums leading-none">{n}</p>
      <p className="text-[11px] text-ink-500 mt-1">{label}</p>
    </div>
  );
}
