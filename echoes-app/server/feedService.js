// feedService.js - 动态发布 / 流 / 点赞 / 评论
const db = require('./db')

function pub(row) {
  if (!row) return null
  return { id: row.id, username: row.username, nickname: row.nickname, avatar: row.avatar, bio: row.bio }
}

function parseMusic(raw) {
  try { return JSON.parse(raw) } catch { return null }
}

// 好友 id 列表（accepted，任意方向）
function friendIds(meId) {
  const rows = db.prepare(`
    SELECT CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END AS fid
    FROM friendships
    WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
  `).all(meId, meId, meId)
  return rows.map(r => r.fid)
}

// 发布动态
function createPost(meId, music, caption) {
  if (!music || typeof music !== 'object') throw new Error('缺少音乐内容')
  const cap = String(caption || '').slice(0, 200)
  const now = Date.now()
  const info = db.prepare(
    'INSERT INTO posts (user_id, music, caption, created_at) VALUES (?, ?, ?, ?)'
  ).run(meId, JSON.stringify(music), cap, now)
  return getPost(meId, info.lastInsertRowid)
}

// 单条动态（带聚合信息）
function getPost(meId, postId) {
  const row = db.prepare(`
    SELECT p.*, u.username, u.nickname, u.avatar, u.bio
    FROM posts p JOIN users u ON u.id = p.user_id
    WHERE p.id = ?
  `).get(postId)
  if (!row) return null
  return formatPost(meId, row)
}

function formatPost(meId, row) {
  const likes = db.prepare('SELECT COUNT(*) AS c FROM post_likes WHERE post_id = ?').get(row.id).c
  const comments = db.prepare('SELECT COUNT(*) AS c FROM post_comments WHERE post_id = ?').get(row.id).c
  const liked = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(row.id, meId)
  return {
    id: row.id,
    user: pub(row),
    music: parseMusic(row.music),
    caption: row.caption,
    createdAt: row.created_at,
    likes,
    comments,
    shares: row.shares || 0,
    isLiked: !!liked
  }
}

// 动态流：scope = 'friends'(含自己) | 'global'
function listFeed(meId, scope = 'friends', limit = 50) {
  let rows
  if (scope === 'global') {
    rows = db.prepare(`
      SELECT p.*, u.username, u.nickname, u.avatar, u.bio
      FROM posts p JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC LIMIT ?
    `).all(limit)
  } else {
    const ids = [meId, ...friendIds(meId)]
    const placeholders = ids.map(() => '?').join(',')
    rows = db.prepare(`
      SELECT p.*, u.username, u.nickname, u.avatar, u.bio
      FROM posts p JOIN users u ON u.id = p.user_id
      WHERE p.user_id IN (${placeholders})
      ORDER BY p.created_at DESC LIMIT ?
    `).all(...ids, limit)
  }
  return rows.map(r => formatPost(meId, r))
}

// 点赞 / 取消（toggle）
function toggleLike(meId, postId) {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
  if (!post) throw new Error('动态不存在')
  const existing = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, meId)
  if (existing) {
    db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, meId)
  } else {
    db.prepare('INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)').run(postId, meId, Date.now())
  }
  const likes = db.prepare('SELECT COUNT(*) AS c FROM post_likes WHERE post_id = ?').get(postId).c
  return { liked: !existing, likes }
}

// 评论列表
function listComments(postId) {
  const rows = db.prepare(`
    SELECT c.*, u.username, u.nickname, u.avatar, u.bio
    FROM post_comments c JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(postId)
  return rows.map(r => ({ id: r.id, user: pub(r), content: r.content, createdAt: r.created_at }))
}

// 添加评论
function addComment(meId, postId, content) {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
  if (!post) throw new Error('动态不存在')
  const text = String(content || '').trim().slice(0, 300)
  if (!text) throw new Error('评论内容不能为空')
  const now = Date.now()
  const info = db.prepare(
    'INSERT INTO post_comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)'
  ).run(postId, meId, text, now)
  const row = db.prepare(`
    SELECT c.*, u.username, u.nickname, u.avatar, u.bio
    FROM post_comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?
  `).get(info.lastInsertRowid)
  return { id: row.id, user: pub(row), content: row.content, createdAt: row.created_at }
}

// 转发计数 +1
function incrementShare(postId) {
  const post = db.prepare('SELECT shares FROM posts WHERE id = ?').get(postId)
  if (!post) throw new Error('动态不存在')
  db.prepare('UPDATE posts SET shares = shares + 1 WHERE id = ?').run(postId)
  return { shares: (post.shares || 0) + 1 }
}

module.exports = { createPost, getPost, listFeed, toggleLike, listComments, addComment, incrementShare }
