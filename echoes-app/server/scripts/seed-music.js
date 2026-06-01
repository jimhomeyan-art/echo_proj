// Seed music 批量生成脚本
// 用法：
//   cd echoes-app/server
//   node scripts/seed-music.js              生成所有缺失的
//   node scripts/seed-music.js --force      强制重新生成所有
//   node scripts/seed-music.js seed-id1 seed-id2   只跑指定 id
//
// 调用 Mureka 生成 → 轮询 → 下载 stable_url 到 public/seed/<id>.mp3

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { generateMusic, getMusicStatus } = require('../musicService')
const tracks = require('./seedTracks')

const OUT_DIR = path.resolve(__dirname, '../../melody-soul-project/melody-soul/public/seed')
const POLL_INTERVAL = 5000
const POLL_TIMEOUT = 5 * 60 * 1000
const DOWNLOAD_TIMEOUT = 60 * 1000

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function downloadFile(url, outPath) {
  const resp = await axios.get(url, { responseType: 'stream', timeout: DOWNLOAD_TIMEOUT })
  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(outPath)
    resp.data.pipe(ws)
    ws.on('finish', resolve)
    ws.on('error', reject)
    resp.data.on('error', reject)
  })
}

async function seedOne(track) {
  const musicType = track.withLyrics ? 'song' : 'instrumental'
  const outPath = path.join(OUT_DIR, `${track.id}.mp3`)
  console.log(`\n▶ ${track.id}  「${track.title}」  (${musicType})`)
  console.log(`  prompt: ${track.prompt}`)
  console.log(`  style : ${track.styleHint}`)

  // 1) 触发生成
  const submitRes = await generateMusic({
    emotion: track.mood && /开心|joy|喜悦/.test(track.mood) ? 'joy'
           : /悲|忧|melan/.test(track.mood) ? 'melancholy'
           : /平静|calm|宁/.test(track.mood) ? 'calm'
           : 'calm',
    userText: track.prompt,
    musicType,
    styleHint: track.styleHint,
    musicTitle: track.title,
  })
  const taskId = submitRes?.taskId || submitRes?.data?.task_id || submitRes?.data?.id
  if (!taskId) {
    console.error(`  ✗ 没拿到 taskId, 跳过`)
    console.error('   raw:', JSON.stringify(submitRes).slice(0, 300))
    return false
  }
  console.log(`  taskId: ${taskId}`)

  // 2) 轮询
  const t0 = Date.now()
  let stableUrl = null
  while (Date.now() - t0 < POLL_TIMEOUT) {
    await sleep(POLL_INTERVAL)
    const st = await getMusicStatus(taskId, musicType)
    const status = st?.status || st?.data?.status
    stableUrl = st?.data?.stable_url || st?.data?.url
    process.stdout.write(`  status=${status}${stableUrl ? ' (stable_url ready)' : ''}\r`)
    if (status === 'completed' && stableUrl) {
      console.log(`\n  ✓ stable_url: ${stableUrl}`)
      break
    }
    if (status === 'failed' || status === 'error') {
      console.error(`\n  ✗ 生成失败: ${status}`)
      return false
    }
  }
  if (!stableUrl) {
    console.error(`\n  ✗ 超时未拿到 stable_url`)
    return false
  }

  // 3) 下载
  console.log(`  ⇣ 下载到 ${path.relative(process.cwd(), outPath)}`)
  await downloadFile(stableUrl, outPath)
  const size = fs.statSync(outPath).size
  console.log(`  ✓ ${(size / 1024).toFixed(1)} KB`)
  return true
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const argv = process.argv.slice(2)
  const force = argv.includes('--force')
  const onlyIds = argv.filter(a => !a.startsWith('--'))

  let targets = tracks
  if (onlyIds.length) {
    targets = tracks.filter(t => onlyIds.includes(t.id))
    console.log(`只生成: ${onlyIds.join(', ')}`)
  }
  if (!force) {
    targets = targets.filter(t => !fs.existsSync(path.join(OUT_DIR, `${t.id}.mp3`)))
  }
  if (targets.length === 0) {
    console.log('所有 seed 文件都已经存在；如需重新生成请加 --force')
    return
  }

  console.log(`将生成 ${targets.length} 首：`)
  targets.forEach(t => console.log(`  • ${t.id}  ${t.title}`))

  let ok = 0, fail = 0
  for (const t of targets) {
    try {
      const done = await seedOne(t)
      done ? ok++ : fail++
    } catch (e) {
      fail++
      console.error(`  ✗ 异常: ${e.message}`)
    }
  }
  console.log(`\n完成。成功 ${ok}，失败 ${fail}`)
}

main().catch(e => {
  console.error('Seed 脚本崩了:', e)
  process.exit(1)
})
