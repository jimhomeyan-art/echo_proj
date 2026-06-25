import QRCode from 'qrcode'
import type { ShareSongMeta } from './share'
import { buildShareUrl } from './share'

function loadImage(src: string, crossOrigin = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 生成精美分享海报，返回 PNG dataURL */
export async function generatePoster(m: ShareSongMeta): Promise<string> {
  const W = 750, H = 1334
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 背景：深色渐变
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#1B1B1F')
  bg.addColorStop(1, '#0C0C0E')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 封面（模糊大背景 + 主图）
  let cover: HTMLImageElement | null = null
  if (m.cover) {
    try { cover = await loadImage(m.cover) } catch { cover = null }
  }

  if (cover) {
    // 顶部大图铺满 + 渐隐
    ctx.save()
    ctx.globalAlpha = 0.35
    ctx.filter = 'blur(24px)'
    ctx.drawImage(cover, -40, -40, W + 80, 620)
    ctx.restore()
    ctx.fillStyle = 'rgba(12,12,14,0.55)'
    ctx.fillRect(0, 0, W, 620)
  }

  // 品牌
  ctx.fillStyle = '#1DB954'
  ctx.font = 'bold 30px sans-serif'
  ctx.fillText('✦', 80, 110)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '28px sans-serif'
  ctx.fillText('Echoes · AI 音乐', 120, 110)

  // 主封面卡（居中圆角）
  const cw = 430, cx = (W - cw) / 2, cy = 180
  ctx.save()
  roundRect(ctx, cx, cy, cw, cw, 36)
  ctx.clip()
  if (cover) {
    ctx.drawImage(cover, cx, cy, cw, cw)
  } else {
    ctx.fillStyle = '#2A2A30'
    ctx.fillRect(cx, cy, cw, cw)
  }
  ctx.restore()
  // 卡阴影描边
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  roundRect(ctx, cx, cy, cw, cw, 36)
  ctx.stroke()

  // 标题
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 52px sans-serif'
  ctx.textAlign = 'center'
  const title = m.title.length > 12 ? m.title.slice(0, 12) + '…' : m.title
  ctx.fillText(title, W / 2, cy + cw + 90)

  // 情绪标签
  if (m.mood) {
    ctx.font = '30px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(`「${m.mood}」`, W / 2, cy + cw + 145)
  }

  ctx.textAlign = 'left'

  // 底部：二维码 + 文案
  const shareUrl = buildShareUrl(m)
  const qrDataUrl = await QRCode.toDataURL(shareUrl, { width: 180, margin: 1, color: { dark: '#0C0C0E', light: '#FFFFFF' } })
  const qr = await loadImage(qrDataUrl, false)

  const qrSize = 170, qrX = 80, qrY = H - qrSize - 90
  // 白底圆角衬托
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 20)
  ctx.fill()
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = 'bold 38px sans-serif'
  ctx.fillText('扫码听这首歌', qrX + qrSize + 50, qrY + 60)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '26px sans-serif'
  ctx.fillText('在 Echoes，把心情变成音乐', qrX + qrSize + 50, qrY + 110)

  return canvas.toDataURL('image/png')
}
