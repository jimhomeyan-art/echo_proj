// messageService.js - 会话与消息持久化
const db = require('./db')

function pub(row) {
  if (!row) return null
  return { id: row.id, username: row.username, nickname: row.nickname, avatar: row.avatar, bio: row.bio }
}

// 校验两人是否好友
function areFriends(a, b) {
  const f = db.prepare(`
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
      AND ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))
  `).get(a, b, b, a)
  return !!f
}

// 取（或建）两人会话 id；user_a < user_b
function getOrCreateConversation(u1, u2) {
  const a = Math.min(u1, u2)
  const b = Math.max(u1, u2)
  const row = db.prepare('SELECT id FROM conversations WHERE user_a = ? AND user_b = ?').get(a, b)
  if (row) return row.id
  const now = Date.now()
  const info = db.prepare(`
    INSERT INTO conversations (user_a, user_b, created_at, updated_at) VALUES (?, ?, ?, ?)
  `).run(a, b, now, now)
  return info.lastInsertRowid
}

// 会话列表（含对方信息 + 最后一条消息）
function listConversations(meId) {
  const rows = db.prepare(`
    SELECT c.id AS conv_id, c.updated_at,
           u.* 
    FROM conversations c
    JOIN users u ON u.id = CASE WHEN c.user_a = ? THEN c.user_b ELSE c.user_a END
    WHERE c.user_a = ? OR c.user_b = ?
    ORDER BY c.updated_at DESC
  `).all(meId, meId, meId)

  return rows.map(r => {
    const last = db.prepare(`
      SELECT type, content, sender_id, created_at FROM messages
      WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(r.conv_id)
    return {
      conversationId: r.conv_id,
      updatedAt: r.updated_at,
      user: pub(r),
      lastMessage: last
        ? { type: last.type, content: last.content, senderId: last.sender_id, createdAt: last.created_at }
        : null
    }
  })
}

// 拉取与某好友的历史消息
function getMessages(meId, friendId, limit = 100) {
  friendId = Number(friendId)
  if (!areFriends(meId, friendId)) throw new Error('你们还不是好友')
  const convId = getOrCreateConversation(meId, friendId)
  const rows = db.prepare(`
    SELECT id, conversation_id, sender_id, type, content, created_at
    FROM messages WHERE conversation_id = ?
    ORDER BY created_at ASC LIMIT ?
  `).all(convId, limit)
  return { conversationId: convId, messages: rows.map(formatMsg) }
}

function formatMsg(r) {
  let content = r.content
  if (r.type === 'music') {
    try { content = JSON.parse(r.content) } catch { /* keep string */ }
  }
  return {
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    type: r.type,
    content,
    createdAt: r.created_at
  }
}

// 保存消息（好友校验 + 更新会话时间）。content 为对象时存 JSON。
function saveMessage(meId, friendId, type, content) {
  friendId = Number(friendId)
  if (!areFriends(meId, friendId)) throw new Error('你们还不是好友')
  type = type === 'music' ? 'music' : 'text'
  const stored = typeof content === 'string' ? content : JSON.stringify(content)
  if (!stored || (type === 'text' && !stored.trim())) throw new Error('消息不能为空')

  const convId = getOrCreateConversation(meId, friendId)
  const now = Date.now()
  const info = db.prepare(`
    INSERT INTO messages (conversation_id, sender_id, type, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(convId, meId, type, stored, now)
  db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(now, convId)

  return formatMsg({
    id: info.lastInsertRowid, conversation_id: convId,
    sender_id: meId, type, content: stored, created_at: now
  })
}

module.exports = {
  areFriends,
  getOrCreateConversation,
  listConversations,
  getMessages,
  saveMessage
}
