// matchService.js - 情绪匹配队列
const db = require('./db')
const { getUserById } = require('./authService')
const { getOrCreateConversation } = require('./messageService')

// 命中后让两人成为好友（accepted）并建会话
function becomeFriends(a, b) {
  const now = Date.now()
  const existing = db.prepare(`
    SELECT * FROM friendships
    WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
  `).get(a, b, b, a)
  if (existing) {
    if (existing.status !== 'accepted') {
      db.prepare(`UPDATE friendships SET status = 'accepted', updated_at = ? WHERE id = ?`).run(now, existing.id)
    }
  } else {
    db.prepare(`
      INSERT INTO friendships (requester_id, addressee_id, status, created_at, updated_at)
      VALUES (?, ?, 'accepted', ?, ?)
    `).run(a, b, now, now)
  }
  getOrCreateConversation(a, b)
}

// 加入匹配：若已有相同情绪的等待者 → 立即配对；否则入队
function joinQueue(userId, emotion) {
  emotion = String(emotion || '').trim()
  if (!emotion) throw new Error('请选择一种情绪')

  const partner = db.prepare(`
    SELECT * FROM match_queue
    WHERE emotion = ? AND user_id != ?
    ORDER BY created_at ASC LIMIT 1
  `).get(emotion, userId)

  if (partner) {
    db.prepare('DELETE FROM match_queue WHERE user_id IN (?, ?)').run(userId, partner.user_id)
    becomeFriends(userId, partner.user_id)
    return { matched: true, partner: getUserById(partner.user_id), emotion }
  }

  const now = Date.now()
  db.prepare(`
    INSERT INTO match_queue (user_id, emotion, created_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET emotion = excluded.emotion, created_at = excluded.created_at
  `).run(userId, emotion, now)
  return { matched: false }
}

function leaveQueue(userId) {
  db.prepare('DELETE FROM match_queue WHERE user_id = ?').run(userId)
}

module.exports = { joinQueue, leaveQueue }
