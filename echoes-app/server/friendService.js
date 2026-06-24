// friendService.js - 好友搜索 / 申请 / 列表
const db = require('./db')

// 公开用户字段
function pub(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatar: row.avatar,
    bio: row.bio
  }
}

// 查两人之间的好友关系记录（任意方向）
function findFriendship(a, b) {
  return db.prepare(`
    SELECT * FROM friendships
    WHERE (requester_id = ? AND addressee_id = ?)
       OR (requester_id = ? AND addressee_id = ?)
  `).get(a, b, b, a)
}

// 计算 me 对 other 的关系状态
function relationOf(meId, other) {
  const f = findFriendship(meId, other.id)
  if (!f) return 'none'
  if (f.status === 'accepted') return 'friends'
  // pending：区分是我发出的还是对方发来的
  return f.requester_id === meId ? 'outgoing' : 'incoming'
}

// 搜索用户（按 username / nickname 模糊匹配，排除自己），附带关系状态
function searchUsers(meId, query) {
  const q = String(query || '').trim()
  if (!q) return []
  const like = `%${q}%`
  const rows = db.prepare(`
    SELECT * FROM users
    WHERE id != ? AND (username LIKE ? OR nickname LIKE ?)
    ORDER BY nickname LIMIT 20
  `).all(meId, like, like)
  return rows.map(r => ({ ...pub(r), relation: relationOf(meId, r) }))
}

// 发送好友申请
function sendRequest(meId, targetId) {
  targetId = Number(targetId)
  if (!targetId || targetId === meId) throw new Error('无法添加该用户')

  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId)
  if (!target) throw new Error('用户不存在')

  const existing = findFriendship(meId, targetId)
  if (existing) {
    if (existing.status === 'accepted') throw new Error('你们已经是好友了')
    // 对方已经向我发过申请 → 直接互相接受
    if (existing.requester_id === targetId) {
      acceptByPair(existing)
      return { status: 'friends' }
    }
    throw new Error('已发送过申请，等待对方同意')
  }

  const now = Date.now()
  db.prepare(`
    INSERT INTO friendships (requester_id, addressee_id, status, created_at, updated_at)
    VALUES (?, ?, 'pending', ?, ?)
  `).run(meId, targetId, now, now)
  return { status: 'outgoing' }
}

// 收到的好友申请列表（pending，addressee = me）
function listIncoming(meId) {
  const rows = db.prepare(`
    SELECT f.id AS request_id, f.created_at, u.*
    FROM friendships f
    JOIN users u ON u.id = f.requester_id
    WHERE f.addressee_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `).all(meId)
  return rows.map(r => ({ requestId: r.request_id, createdAt: r.created_at, user: pub(r) }))
}

function acceptByPair(f) {
  const now = Date.now()
  db.prepare(`UPDATE friendships SET status = 'accepted', updated_at = ? WHERE id = ?`).run(now, f.id)
  ensureConversation(f.requester_id, f.addressee_id)
}

// 同意 / 拒绝申请（仅 addressee 可操作）
function respondRequest(meId, requestId, action) {
  const f = db.prepare('SELECT * FROM friendships WHERE id = ?').get(Number(requestId))
  if (!f || f.addressee_id !== meId || f.status !== 'pending') {
    throw new Error('申请不存在或已处理')
  }
  if (action === 'accept') {
    acceptByPair(f)
    return { status: 'accepted' }
  } else {
    db.prepare('DELETE FROM friendships WHERE id = ?').run(f.id)
    return { status: 'rejected' }
  }
}

// 好友列表（accepted，任意方向）
function listFriends(meId) {
  const rows = db.prepare(`
    SELECT u.* FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
    WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
    ORDER BY u.nickname
  `).all(meId, meId, meId)
  return rows.map(pub)
}

// 建立会话（user_a < user_b），已存在则忽略
function ensureConversation(u1, u2) {
  const a = Math.min(u1, u2)
  const b = Math.max(u1, u2)
  const now = Date.now()
  const row = db.prepare('SELECT id FROM conversations WHERE user_a = ? AND user_b = ?').get(a, b)
  if (row) return row.id
  const info = db.prepare(`
    INSERT INTO conversations (user_a, user_b, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(a, b, now, now)
  return info.lastInsertRowid
}

module.exports = {
  searchUsers,
  sendRequest,
  listIncoming,
  respondRequest,
  listFriends,
  ensureConversation
}
