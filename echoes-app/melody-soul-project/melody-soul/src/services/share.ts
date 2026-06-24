// 外部分享工具：生成歌曲落地页链接、复制、各平台分享

export interface ShareSongMeta {
  id: string
  title: string
  cover?: string
  url?: string
  mood?: string
}

/** 生成公开落地页链接（信息编码进 URL，免建库） */
export function buildShareUrl(m: ShareSongMeta): string {
  const params = new URLSearchParams()
  params.set('t', m.title)
  if (m.cover) params.set('c', m.cover)
  if (m.url) params.set('u', m.url)
  if (m.mood) params.set('m', m.mood)
  return `${window.location.origin}/s?${params.toString()}`
}

/** 复制文本：优先 clipboard API，HTTP 下降级 textarea+execCommand */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {}
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/** 微博网页分享直链 */
export function weiboShareUrl(link: string, title: string): string {
  const text = `${title} —— 用 Echoes 创作的音乐`
  return `https://service.weibo.com/share/share.php?url=${encodeURIComponent(link)}&title=${encodeURIComponent(text)}`
}
