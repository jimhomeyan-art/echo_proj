// socketServer.js - socket.io 实时聊天
const { Server } = require('socket.io')
const { verifyToken } = require('./authService')
const { getUserById } = require('./authService')
const { saveMessage } = require('./messageService')
const { joinQueue, leaveQueue } = require('./matchService')

// 挂载到已有 http server。每个用户加入房间 user:<id>。
function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: true, credentials: true }
  })

  // 握手鉴权：socket.handshake.auth.token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    const payload = token && verifyToken(token)
    if (!payload) return next(new Error('unauthorized'))
    socket.userId = payload.uid
    next()
  })

  io.on('connection', (socket) => {
    const uid = socket.userId
    socket.join(`user:${uid}`)
    console.log(`🔌 socket connected: user ${uid}`)

    // 发送消息：{ toUserId, type, content }，ack 返回已保存消息
    socket.on('message:send', (payload, ack) => {
      try {
        const { toUserId, type, content } = payload || {}
        const msg = saveMessage(uid, toUserId, type, content)
        // 推给接收方（如在线）
        io.to(`user:${Number(toUserId)}`).emit('message:new', { from: uid, message: msg })
        if (typeof ack === 'function') ack({ success: true, message: msg })
      } catch (err) {
        if (typeof ack === 'function') ack({ success: false, error: err.message || '发送失败' })
      }
    })

    socket.on('disconnect', () => {
      leaveQueue(uid)
      console.log(`🔌 socket disconnected: user ${uid}`)
    })

    // ── 情绪匹配 ──
    // 加入匹配：{ emotion }，ack 返回 { matched, partner? }
    socket.on('match:join', (payload, ack) => {
      try {
        const result = joinQueue(uid, (payload || {}).emotion)
        if (result.matched) {
          // 通知对方匹配成功（partner = 当前用户）
          io.to(`user:${result.partner.id}`).emit('match:found', {
            partner: getUserById(uid),
            emotion: result.emotion
          })
          if (typeof ack === 'function') ack({ success: true, matched: true, partner: result.partner, emotion: result.emotion })
        } else {
          if (typeof ack === 'function') ack({ success: true, matched: false })
        }
      } catch (err) {
        if (typeof ack === 'function') ack({ success: false, error: err.message || '匹配失败' })
      }
    })

    // 取消匹配
    socket.on('match:cancel', (_payload, ack) => {
      leaveQueue(uid)
      if (typeof ack === 'function') ack({ success: true })
    })
  })

  return io
}

module.exports = { attachSocket }
