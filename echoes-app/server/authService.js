// authService.js - 注册 / 登录 / JWT
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('./db')

const JWT_SECRET = process.env.JWT_SECRET || 'echoes-dev-secret-change-me'
const JWT_EXPIRES = '30d'

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
]

// 对外返回的用户字段（不含密码哈希）
function publicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatar: row.avatar,
    bio: row.bio
  }
}

function signToken(userId) {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

async function register({ username, password, nickname }) {
  username = String(username || '').trim()
  password = String(password || '')
  nickname = String(nickname || '').trim() || username

  if (username.length < 3) throw new Error('用户名至少 3 个字符')
  if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('用户名只能包含字母、数字、下划线')
  if (password.length < 6) throw new Error('密码至少 6 位')

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exists) throw new Error('用户名已被占用')

  const password_hash = await bcrypt.hash(password, 10)
  const avatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]
  const now = Date.now()

  const info = db.prepare(`
    INSERT INTO users (username, password_hash, nickname, avatar, bio, created_at)
    VALUES (?, ?, ?, ?, '', ?)
  `).run(username, password_hash, nickname, avatar, now)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  return { token: signToken(user.id), user: publicUser(user) }
}

async function login({ username, password }) {
  username = String(username || '').trim()
  password = String(password || '')

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user) throw new Error('用户名或密码错误')

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) throw new Error('用户名或密码错误')

  return { token: signToken(user.id), user: publicUser(user) }
}

function getUserById(id) {
  return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id))
}

// 更新资料：昵称 / 简介 / 头像（均可选）
function updateProfile(userId, { nickname, bio, avatar }) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user) throw new Error('用户不存在')

  const fields = {}
  if (nickname !== undefined) {
    const v = String(nickname).trim()
    if (v.length < 1 || v.length > 20) throw new Error('昵称需 1-20 个字符')
    fields.nickname = v
  }
  if (bio !== undefined) {
    const v = String(bio).trim()
    if (v.length > 60) throw new Error('简介最多 60 个字符')
    fields.bio = v
  }
  if (avatar !== undefined) {
    fields.avatar = String(avatar).trim()
  }

  const keys = Object.keys(fields)
  if (keys.length === 0) return publicUser(user)

  const setClause = keys.map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...keys.map(k => fields[k]), userId)
  return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(userId))
}

// Express 中间件：校验 Authorization: Bearer <token>
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token && verifyToken(token)
  if (!payload) {
    return res.status(401).json({ success: false, error: '未登录或登录已过期' })
  }
  req.userId = payload.uid
  next()
}

module.exports = {
  register,
  login,
  getUserById,
  updateProfile,
  verifyToken,
  authMiddleware,
  publicUser,
  DEFAULT_AVATARS
}
