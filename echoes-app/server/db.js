// db.js - SQLite 数据库初始化与 schema
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const DATA_DIR = path.join(__dirname, 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'echoes.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── 表结构 ──
db.exec(`
  -- 用户
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    nickname      TEXT    NOT NULL,
    avatar        TEXT    DEFAULT '',
    bio           TEXT    DEFAULT '',
    created_at    INTEGER NOT NULL
  );

  -- 好友关系（含申请）：requester 发起，addressee 接收
  CREATE TABLE IF NOT EXISTS friendships (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status       TEXT    NOT NULL DEFAULT 'pending',  -- pending / accepted
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL,
    UNIQUE(requester_id, addressee_id)
  );

  -- 会话：user_a < user_b 保证唯一
  CREATE TABLE IF NOT EXISTS conversations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_a      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,
    UNIQUE(user_a, user_b)
  );

  -- 消息
  CREATE TABLE IF NOT EXISTS messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT    NOT NULL DEFAULT 'text',   -- text / music
    content         TEXT    NOT NULL,                  -- 文本内容 或 音乐 JSON
    created_at      INTEGER NOT NULL
  );

  -- 情绪匹配队列
  CREATE TABLE IF NOT EXISTS match_queue (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    emotion    TEXT    NOT NULL,
    created_at INTEGER NOT NULL
  );

  -- 动态（发布的音乐）
  CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    music      TEXT    NOT NULL,          -- 音乐 JSON
    caption    TEXT    DEFAULT '',
    shares     INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  -- 动态点赞
  CREATE TABLE IF NOT EXISTS post_likes (
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (post_id, user_id)
  );

  -- 动态评论
  CREATE TABLE IF NOT EXISTS post_comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT    NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_friend_addressee ON friendships(addressee_id, status);
  CREATE INDEX IF NOT EXISTS idx_friend_requester ON friendships(requester_id, status);
  CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
  CREATE INDEX IF NOT EXISTS idx_post_comments ON post_comments(post_id, created_at);
`)

console.log('✅ SQLite ready:', path.join(DATA_DIR, 'echoes.db'))

// 迁移：旧 posts 表补 shares 列
try {
  const cols = db.prepare(`PRAGMA table_info(posts)`).all()
  if (!cols.some(c => c.name === 'shares')) {
    db.exec(`ALTER TABLE posts ADD COLUMN shares INTEGER DEFAULT 0`)
    console.log('🔧 Migrated: posts.shares added')
  }
} catch (e) { console.error('posts.shares migration failed:', e.message) }

module.exports = db
