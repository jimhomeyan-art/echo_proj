// chatService.js - Qwen/DashScope 聊天机器人服务
const axios = require('axios')
const { isRichStyleHint } = require('./musicService')

const QWEN_API_BASE_URL = process.env.QWEN_API_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-plus'

const systemPrompt = `你是 Echo，一个自然、温和、会聊天的 AI 音乐伙伴。

你的主任务：
1. 像正常朋友一样和用户聊天，优先回应用户刚刚说的话。
2. 你有上下文记忆：必须记住本轮聊天里用户提过的事实、地点、人物、心情和事件，例如下雨、鞋湿、朋友结婚、中奖等；用户后续用“它/这个/刚才/不是/说错了”时，要结合前文理解。
3. 不要套路化共情，不要心理咨询腔，不要过度文学化。
4. 不要写死式追问，不要每句话都往“情绪很重”上靠。
5. 用户开心就轻松聊，用户难过就温柔一点，用户开玩笑就接住玩笑。
6. 聊到 3-4 轮后，可以自然地问一句：“要不要把这个感觉做成一段音乐？”
7. 如果用户不想创作音乐，就继续正常聊天。
8. 默认所有音乐都是「有歌词的歌曲（song）」。不要再问用户"要纯音乐还是有歌词"，直接默认按歌曲来。
9. 用户主动说"纯音乐 / 无歌词 / 伴奏 / BGM / 配乐 / 不要歌词 / 器乐"时，才切换到 instrumental。
10. 用户明确说歌曲/歌词/唱/人声时，musicType 是 song，lyricsRequired=true。
11. 信息够了时，reply 里给一句简短的方向确认。但同一段对话同样的确认问题最多问一次，**不要反复问"要不要现在开始"**。
12. 如果用户已经回答过"开始/试试看/可以/好/嗯/行"，并且你上一轮就已经在确认方向，本轮就直接把 readyToGenerate 设为 true，并自然说一句"那就开始啦"之类，**不要再问要不要开始**。
13. 在最终确认前，如果还没聊清楚音乐风格（genre/乐器/曲风/参考艺人），可以先问一次用户偏好，但只问一次。用户如果说"随便/无所谓/都行"，就由你来决定。
14. 重要：如果你之前提到过"男声/女声/中性嗓/低音男嗓"等具体声音偏好，本轮 styleHint 里必须保留它（如 male vocal / female vocal / Mandarin male vocal 等），不要中途换性别。
15. 不要写死式追问；不要每句都套用同一句模板。
16. 重要：如果上下文里已经出现过 "[已生成歌曲：《xxx》。已经放到播放器里了。]"，说明已经生成过一首歌了。这之后用户的反馈（如"听完心情好了/不错/好听"）你只需要正常聊回应，**不要再 readyToGenerate=true，也不要再宣告创作**。但只要用户表达想再来一首/换一首/换风格/换情绪/再写/再做/换换/不一样的/下一首/继续做之类的意思（不必严格用某个固定词），就可以再进入下一首的创作流程，按正常的"先聊清楚 → 用户点头 → readyToGenerate=true"流程走。

回复风格：
- 40-100 个中文字符。
- 具体、自然、口语化。
- 不要使用“被接住、心口、重量、深夜、光、肩上、没被听见”等抽象套话。
- 不要说“你刚刚这句话挺直接”。

你必须只输出合法 JSON，不要 Markdown，不要代码块：
{
  "reply": "给用户看的中文回复",
  "emotion": "melancholy|solitude|anxiety|anger|confusion|calm|joy|hope|exhaustion",
  "musicType": "instrumental|song|null",
  "styleHint": "英文音乐风格提示词。准备生成时必须根据本轮对话主动设计，不要复用通用模板。必须包含：\n  - genre（明确流派，如 'Mandopop ballad', 'Chinese folk pop with zhongguofeng', 'lofi indie acoustic', 'city pop', 'neo soul', 'shoegaze', 'trap', '90s J-pop' 等。如果用户提到具体艺人/风格关键词如周杰伦/草东/陈奕迅/lofi/古风/电子，必须直接体现在 genre）\n  - 3-5 个具体 instruments（贴合情绪和用户输入，例如古筝/二胡/木吉他/合成器/808鼓/钢琴/弦乐等）\n  - tempo（具体 BPM 数字）\n  - vocal_type（soft female vocal / smooth Mandarin male vocal / breathy female / Cantonese male 等）\n  - texture/mood（一个关键词形容质感，如 intimate / dreamy / driving / bittersweet）\n  示例：'Chinese zhongguofeng Mandopop ballad, guzheng, pipa, soft piano, light strings, 78 BPM, smooth Mandarin male vocal, melancholic poetic'。未准备生成时为空字符串",
  "musicTitle": "中文标题，2-8字，根据本轮对话定制，不要复用通用名（如\"湖面微风/晨光\"）。**当 readyToGenerate=true 时必须给一个具体标题，不能为空字符串**。未准备生成时为空字符串",
  "lyricsRequired": true|false,
  "readyToGenerate": true|false
}`

function normalizeMessages(messages) {
  return messages
    .map(message => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content || '').trim()
    }))
    .filter(message => message.content)
    .slice(-20)
}

function getUserTurnCount(messages) {
  return messages.filter(m => m.role === 'user').length
}

function getLastAssistantText(messages) {
  return [...messages].reverse().find(m => m.role === 'assistant')?.content || ''
}

function getLastUserText(messages) {
  return [...messages].reverse().find(m => m.role === 'user')?.content || ''
}

function detectEmotion(text) {
  const map = {
    melancholy: ['难过', '伤心', '失落', '忧郁', '想哭'],
    solitude: ['孤独', '寂寞', '一个人', '没人懂'],
    anxiety: ['焦虑', '不安', '紧张', '压力', '失眠'],
    anger: ['生气', '愤怒', '烦躁', '火大'],
    confusion: ['迷茫', '困惑', '纠结', '不知道'],
    calm: ['平静', '安静', '放松'],
    joy: ['开心', '快乐', '高兴', '幸福', '中奖', '结婚'],
    hope: ['希望', '期待', '未来'],
    exhaustion: ['累', '疲惫', '困', '没力气']
  }
  for (const [emotion, keywords] of Object.entries(map)) {
    if (keywords.some(k => text.includes(k))) return emotion
  }
  return 'calm'
}

function safeParseJson(content) {
  try {
    return JSON.parse(content)
  } catch (_) {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('LLM response is not JSON')
    return JSON.parse(match[0])
  }
}

function inferPendingMusicType(messages) {
  const recentAssistantText = messages
    .filter(m => m.role === 'assistant')
    .slice(-3)
    .map(m => m.content)
    .join('\n')
  const recentUserText = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content)
    .join('\n')

  const text = `${recentAssistantText}\n${recentUserText}`
  // 优先识别纯音乐关键词
  if (/纯音乐|伴奏|BGM|bgm|配乐|无歌词|不要歌词|器乐|氛围音乐|纯器乐/.test(text)) return 'instrumental'
  // 默认：只要有创作意图，按歌曲处理
  if (/想做|生成|创作|来一首|做一首|写一首|帮我做|想听|配一段|做成音乐|歌|唱|歌词|歌曲|歌声|人声|女声|男声|开始做|来吧/.test(text)) return 'song'
  return null
}

function isAffirmative(text) {
  const t = text.trim().replace(/[～~。！!.,，]+$/g, '')
  if (!t) return false
  // 短词强匹配
  if (/^(可以|好的|好|嗯+|行+|对|是的|来吧|来|就这个|开始|生成|可以的|没问题|ok+|OK+|okay|Okay|好呀|好啊|可以呀|可以啊|那就这样|就这样|做吧|那做吧|开始吧|开始呗|可以开始|没事|没关系|嗯嗯|嗯嗯嗯|确认|确定|嗷|嗷嗷|gogo|go|GO|Go|let's go|安排|安排上|整|整一个|来一个|走|走起|走吧|出发|妥|妥了|稳|稳了|中|嘿|嘿嘿|哎|要的|嘞|嘞好|没毛病|起飞|开干)$/i.test(t)) return true
  // 短句包含正面意图
  if (t.length <= 14 && /可以|好的|没问题|开始|去吧|做吧|就这样|确认|gogo|安排|整一个|来一个|走起|起飞|开干|出发/i.test(t)) return true
  return false
}

function hasExplicitMusicTypeRequest(messages) {
  // 默认按 song 生成；只要有任何创作意图就视为类型已确定
  const allUserText = messages.filter(m => m.role === 'user').map(m => m.content).join('\n')
  return /想做|生成|创作|来一首|做一首|写一首|帮我做|想听|配一段|做成音乐|歌|唱|歌词|歌曲|歌声|人声|女声|男声|纯音乐|无歌词|不要歌词|伴奏|BGM|bgm|配乐|器乐|开始做|来吧/.test(allUserText)
}

function hasCreationIntent(messages) {
  const allUserText = messages.filter(m => m.role === 'user').map(m => m.content).join('\n')
  const lastUser = getLastUserText(messages)
  const pendingType = inferPendingMusicType(messages)
  return /想做|生成|创作|来一首|做一首|写一首|配一段|做成音乐|开始做|可以做|帮我做|想听|纯音乐|歌曲|歌词|BGM|bgm|配乐|女声|男声|女生唱|男生唱/.test(allUserText) || Boolean(pendingType && isAffirmative(lastUser))
}

const VALID_EMOTIONS = ['melancholy', 'solitude', 'anxiety', 'anger', 'confusion', 'calm', 'joy', 'hope', 'exhaustion']

function isRepeatedReply(reply, messages) {
  const lastAssistant = getLastAssistantText(messages)
  if (!lastAssistant) return false
  return reply.trim() === lastAssistant.trim() || reply.includes(lastAssistant.slice(0, 16))
}

function lastUserFallbackReply(lastUser) {
  if (!lastUser) return '我在，你可以继续说。'
  return `我看到了你说的“${lastUser.slice(0, 24)}”。可以再多讲一点点吗？`
}

function buildContextualFallbackReply(lastUser) {
  if (/干嘛|做什么|在干什么/.test(lastUser)) {
    return '我在这儿陪你聊天，也顺便帮你把心情慢慢整理成音乐。你刚刚是在忙，还是刚闲下来？'
  }
  if (/上班|工作|下班|老板|同事/.test(lastUser)) {
    return '刚上班啊，那脑子可能还没完全启动。今天是普通忙，还是一上来就有事压过来？'
  }
  if (/哈哈|好吧|笑死|hhh|233/.test(lastUser)) {
    return '哈哈，你这个反应我懂。那我们先轻松聊，不急着上价值。刚刚那句是觉得我说得怪，还是你真被逗到了？'
  }
  if (/开心|高兴|爽|不错|挺好/.test(lastUser)) {
    return '挺好，那就先接住这个好心情。是发生了什么具体的好事，还是今天整体都比较顺？'
  }
  if (/累|烦|压力|难受|emo|崩/.test(lastUser)) {
    return '听起来今天不太轻松。是事情本身让你累，还是那种一直绷着的感觉比较明显？'
  }
  return `我听到了。你刚刚说“${lastUser.slice(0, 24)}”，我先不乱猜。你想继续讲讲这件事，还是想让我帮你把它做成音乐？`
}

function isWeakReply(reply) {
  if (!reply) return true
  const trimmed = reply.trim()
  if (trimmed.length < 6) return true
  return ['嗯，我在。你继续说。', '我在听，你可以慢慢说。', '嗯，我听到了。你可以继续说，我先不急着把它变成音乐。', '哈哈，你这个反应我懂。那我们先轻松聊，不急着上价值。刚刚那句是觉得我说得怪，还是你真被逗到了？']
    .some(s => trimmed === s || trimmed.includes(s.slice(0, 18)))
}

function isGenericReply(reply) {
  return [
    '嗯，我在。你继续说。',
    '我在听，你可以慢慢说。',
    '嗯，我听到了。你可以继续说，我先不急着把它变成音乐。'
  ].includes(reply.trim())
}

function normalizeChatResult(result, messages = []) {
  let reply = String(result.reply || '').trim()
  let isEmpty = !reply
  if (!reply) {
    const lastUser = getLastUserText(messages)
    reply = lastUser
      ? `我看到了你刚刚说的”${lastUser.slice(0, 24)}”，我想再多了解一点，可以再展开说说吗？`
      : '我在，你可以继续说。'
  }

  return {
    reply,
    _wasEmpty: isEmpty,
    emotion: VALID_EMOTIONS.includes(result.emotion) ? result.emotion : detectEmotion(String(result.reply || '')),
    musicType: result.musicType === 'song' || result.musicType === 'instrumental' ? result.musicType : null,
    styleHint: String(result.styleHint || ''),
    musicTitle: String(result.musicTitle || ''),
    lyricsRequired: Boolean(result.lyricsRequired || result.musicType === 'song'),
    readyToGenerate: Boolean(result.readyToGenerate)
  }
}

function recentAssistantText(messages, n = 3) {
  return messages.filter(m => m.role === 'assistant').slice(-n).map(m => m.content).join('\n')
}

function lastAssistantHasConfirmQuestion(messages) {
  const text = recentAssistantText(messages, 3)
  return /要不要|就这样|这个方向|开始生成|开始做|我来生成|我现在.*做|准备好了吗|可以开始吗|要不就|要不就这样|那我们|我们来|来一首|做一首|写一首|来做|帮你做.*[?？]|好不好[?？]?|可以吗[?？]?|怎么样[?？]?|如何[?？]?/.test(text)
}

function lastAssistantAnnouncesCreation(messages) {
  const text = recentAssistantText(messages, 3)
  return /我这就|这就开始|这就为你|这就给你|我来给你|马上为你|马上给你|那我就按|按这个方向|就这样开始|开始为你|我来写|我来做|那就开始|那我做|那我写/.test(text)
}

function isUserCasualAboutStyle(text) {
  if (!text) return false
  const t = text.trim()
  return /^(随便|无所谓|都行|你看着办|你决定|你来定|看你|看你的|帮我选|帮我定|随你|随意|whatever|你看|凭你|你挑)/i.test(t) ||
    /随便|无所谓|你看着办|你决定|你来定|帮我选|帮我定|随你|凭你/.test(t)
}

function detectInstrumentalRequest(messages) {
  const allUserText = messages.filter(m => m.role === 'user').map(m => m.content).join('\n')
  return /纯音乐|无歌词|不要歌词|伴奏|BGM|bgm|配乐|器乐|纯器乐/.test(allUserText)
}

function replyContainsOpenQuestion(reply) {
  if (!reply) return false
  const r = String(reply)
  // AI 自己在反问风格 / 偏好，不应该立刻进生成
  if (/[?？]\s*$/.test(r.trim())) return /哪|什么|哪种|哪一种|比如|偏哪|想要|希望|喜欢|风格|感觉|偏好|偏向/.test(r)
  return /比如：|比如:|你希望它|你想要|你喜欢哪|哪一种|哪种感觉|哪种风格|更偏|更接近|偏哪|要不要|要不就/.test(r)
}

// 检测最近 N 条 AI 消息里是否问过"要不要开始"类的话
function aiAlreadyAskedToStart(messages) {
  const recent = messages.filter(m => m.role === 'assistant').slice(-3).map(m => m.content).join('\n')
  return /要不要现在|要不要开始|可以开始吗|准备好了吗|要不要做|要不要生成|那我就按.+(要不要|开始)/.test(recent)
}

// 检测用户最近 N 条里有没有连续点头/积极表态
function userRepeatedlyAffirmed(messages) {
  const recentUsers = messages.filter(m => m.role === 'user').slice(-3)
  return recentUsers.length >= 1 && recentUsers.some(m => isAffirmative(m.content))
}

// 从对话里提取声音性别偏好（用户/AI 都算）
function detectVocalGender(messages) {
  const all = messages.map(m => m.content).join('\n')
  if (/男声|男生唱|男嗓|male vocal|male singer/i.test(all)) return 'male'
  if (/女声|女生唱|女嗓|female vocal|female singer/i.test(all)) return 'female'
  return null
}

function alreadyGeneratedMusic(messages) {
  return messages.some(m => m.role === 'assistant' && /\[已生成歌曲/.test(m.content))
}

function userExplicitlyWantsAnother(messages) {
  // 找到最后一次"已生成歌曲"标记的位置
  let lastGenIdx = -1
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === 'assistant' && /\[已生成歌曲/.test(m.content)) {
      lastGenIdx = i
      break
    }
  }
  // 取该标记之后的所有用户消息拼起来检测意图
  const afterUserTexts = messages
    .slice(lastGenIdx + 1)
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n')
  if (!afterUserTexts) return false
  // 1) 再/又 + 创作动词
  if (/(再|又).{0,8}(写|做|来|生成|听|创作|搞|整|弄|尝试|试|帮我|加)/.test(afterUserTexts)) return true
  // 2) 换/另/新/多 + (一首/一种/一个/首/版/种/风格/调子...)
  if (/(换|另|新|多).{0,6}(一首|一种|一个|首歌|首曲|首|版本|风格|调子|曲子|首歌曲|个调|种情绪|个情绪|种感觉|个感觉|种风|个风|首试|个版本)/.test(afterUserTexts)) return true
  // 3) 直接关键句
  if (/还想.{0,4}(做|写|来|听|生成)|多来一首|继续(做|写|生成)|不一样的|不同的.{0,3}(歌|曲|风格|感觉)|下一首|换换|换换口味|换一下/.test(afterUserTexts)) return true
  return false
}

function applyGenerationPolicy(result, messages) {
  const userTurns = getUserTurnCount(messages)
  const hasType = hasExplicitMusicTypeRequest(messages)
  const wantsCreate = hasCreationIntent(messages)
  const lastUser = getLastUserText(messages)
  const wantsInstrumental = detectInstrumentalRequest(messages)
  // 默认按 song 生成，除非用户明确要纯音乐
  const pendingType = wantsInstrumental ? 'instrumental' : (wantsCreate ? 'song' : null)
  const userConfirmed = isAffirmative(lastUser)
  const aiAskedConfirm = lastAssistantHasConfirmQuestion(messages)
  const aiAnnouncedCreation = lastAssistantAnnouncesCreation(messages)
  const replyIsQuestion = replyContainsOpenQuestion(result.reply)
  const aiAlreadyStarted = aiAlreadyAskedToStart(messages)
  const userPushed = userRepeatedlyAffirmed(messages)
  const vocalGender = detectVocalGender(messages)
  const hasGenerated = alreadyGeneratedMusic(messages)
  // 统一信号：AI 是否在最近邀请 / 宣告 / 确认要创作
  const aiInvited = aiAskedConfirm || aiAnnouncedCreation || aiAlreadyStarted

  // 已经生成过音乐：只要不是"AI 刚邀请 + 用户点头"，就继续聊不重复生成
  if (hasGenerated && !(aiInvited && userConfirmed)) {
    return {
      ...result,
      readyToGenerate: false,
      musicType: null,
      styleHint: '',
      musicTitle: '',
      lyricsRequired: false
    }
  }

  // 强触发 0：用户已点头 + AI 之前就在问开始 → 绕过 question 守卫立即生成
  // 这是为了打断千问"反复问要不要开始"的死循环
  if (pendingType && userConfirmed && aiAlreadyStarted) {
    let styleHint = result.styleHint || ''
    // 强制保留性别偏好
    if (vocalGender === 'male' && !/male vocal|男声/i.test(styleHint)) {
      styleHint += (styleHint ? ', ' : '') + 'Mandarin male vocal'
    } else if (vocalGender === 'female' && !/female vocal|女声/i.test(styleHint)) {
      styleHint += (styleHint ? ', ' : '') + 'Mandarin female vocal'
    }
    if (!styleHint) {
      styleHint = pendingType === 'song'
        ? 'warm Mandarin pop, gentle groove, intimate vocal'
        : 'warm instrumental, gentle groove'
    }
    // 这一轮 reply 不应该再是问句，强行覆盖避免 AI 又问又开始的违和感
    const replyHasQ = /[?？]/.test(String(result.reply || ''))
    return {
      ...result,
      reply: replyHasQ || !result.reply ? '好，那就开始啦。' : result.reply,
      musicType: pendingType,
      lyricsRequired: pendingType === 'song',
      styleHint,
      musicTitle: result.musicTitle || (pendingType === 'song' ? '小心情' : '轻片刻'),
      readyToGenerate: true
    }
  }

  // 如果千问这一轮 reply 还在反问，绝不允许立刻生成（哪怕用户上一句点头）
  if (replyIsQuestion) {
    return {
      ...result,
      readyToGenerate: false,
      musicType: pendingType || result.musicType || null,
      lyricsRequired: (pendingType || result.musicType) === 'song'
    }
  }

  // 强触发 1：上一轮 AI 提到具体音乐类型 + 用户明确点头 → 立刻生成，不再反问
  if (pendingType && userConfirmed && (aiAskedConfirm || aiAnnouncedCreation)) {
    let styleHint = result.styleHint || (pendingType === 'song'
      ? 'warm Mandarin pop, gentle groove, intimate vocal'
      : 'warm instrumental, gentle groove')
    if (vocalGender === 'male' && !/male vocal|男声/i.test(styleHint)) {
      styleHint += ', Mandarin male vocal'
    } else if (vocalGender === 'female' && !/female vocal|女声/i.test(styleHint)) {
      styleHint += ', Mandarin female vocal'
    }
    return {
      ...result,
      musicType: pendingType,
      lyricsRequired: pendingType === 'song',
      styleHint,
      musicTitle: result.musicTitle || (pendingType === 'song' ? '轻快小歌' : '轻快片刻'),
      readyToGenerate: true
    }
  }

  // 强触发 2：AI 已明确宣告要开始创作 + pendingType 明确 + 千问也说 ready
  if (result.readyToGenerate && pendingType && aiAnnouncedCreation) {
    let styleHint = result.styleHint || ''
    if (vocalGender === 'male' && !/male vocal|男声/i.test(styleHint)) {
      styleHint += (styleHint ? ', ' : '') + 'Mandarin male vocal'
    } else if (vocalGender === 'female' && !/female vocal|女声/i.test(styleHint)) {
      styleHint += (styleHint ? ', ' : '') + 'Mandarin female vocal'
    }
    return {
      ...result,
      musicType: result.musicType || pendingType,
      lyricsRequired: result.lyricsRequired || pendingType === 'song',
      styleHint,
      musicTitle: result.musicTitle || '小心情',
      readyToGenerate: true
    }
  }

  // 即将触发生成（千问主动 ready 但 AI 还没宣告）：检查 styleHint 是否够具体
  if (result.readyToGenerate && pendingType && !aiAnnouncedCreation && !aiAskedConfirm) {
    const userCasual = isUserCasualAboutStyle(lastUser) ||
      messages.filter(m => m.role === 'user').slice(-3).some(m => isUserCasualAboutStyle(m.content))
    const styleRich = isRichStyleHint(result.styleHint)

    if (!styleRich && !userCasual) {
      // 风格还不够具体，AI 必须先问清楚
      return {
        ...result,
        readyToGenerate: false,
        musicType: pendingType || result.musicType,
        lyricsRequired: (pendingType || result.musicType) === 'song',
        styleHint: result.styleHint || '',
        reply: result.reply || '我可以现在就给你写一首。不过先想问一下：你希望它更偏哪一种？比如\n· 安静的钢琴民谣\n· 轻快的流行小调\n· 复古爵士/lofi\n· 中国风\n或者直接告诉我，你喜欢的歌手风格也行。',
      }
    }
  }

  // 不到 3 轮且没有明确创作意图，不引导生成
  if (userTurns < 3 && !wantsCreate) {
    return {
      ...result,
      musicType: null,
      styleHint: '',
      musicTitle: '',
      lyricsRequired: false,
      readyToGenerate: false
    }
  }

  // 没有创作意图：继续聊天，不触发生成
  if (!wantsCreate) {
    return {
      ...result,
      musicType: null,
      styleHint: '',
      musicTitle: '',
      lyricsRequired: false,
      readyToGenerate: false
    }
  }

  // 有创作意图但没明确音乐类型：继续问，不生成
  if (!hasType) {
    return {
      ...result,
      musicType: null,
      styleHint: '',
      musicTitle: '',
      lyricsRequired: false,
      readyToGenerate: false
    }
  }

  // 默认拒绝千问主动 readyToGenerate；必须用户明确点头确认 或 AI 已宣告创作
  if (result.readyToGenerate && !userConfirmed && !aiAskedConfirm && !aiAnnouncedCreation) {
    return {
      ...result,
      readyToGenerate: false,
      // 保留 musicType 和 styleHint，方便下一轮确认
      reply: result.reply
    }
  }

  // 有类型但模型没给类型，也不生成
  if (!result.musicType) {
    return { ...result, readyToGenerate: false, lyricsRequired: false }
  }

  return result
}

function fallbackChat({ messages }) {
  const last = getLastUserText(messages)
  const wantsSong = /歌词|歌曲|唱|人声|歌声/.test(last)
  const wantsInstrumental = /纯音乐|无歌词|伴奏|BGM|bgm|配乐/.test(last)

  if (wantsSong || wantsInstrumental) {
    return applyGenerationPolicy({
      reply: wantsSong ? '可以，那我按有歌词的歌来做。你想要更轻松一点，还是更感动一点？' : '可以，那我按纯音乐来做。你想要安静一点，还是更有节奏一点？',
      emotion: detectEmotion(last),
      musicType: wantsSong ? 'song' : 'instrumental',
      styleHint: wantsSong ? 'warm vocal song, natural, intimate' : 'warm instrumental, natural, intimate',
      musicTitle: wantsSong ? '小小好运' : '轻松片刻',
      lyricsRequired: wantsSong,
      readyToGenerate: false
    }, messages)
  }

  return applyGenerationPolicy({
    reply: lastUserFallbackReply(last),
    emotion: detectEmotion(last),
    musicType: null,
    styleHint: '',
    musicTitle: '',
    lyricsRequired: false,
    readyToGenerate: false
  }, messages)
}

function buildMemorySummary(messages) {
  const userTexts = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('；')

  const facts = []
  if (/雨|下雨|淋湿|湿了/.test(userTexts)) facts.push('用户提到下雨/淋湿')
  if (/鞋|鞋子|袜子/.test(userTexts)) facts.push('用户提到鞋子/脚部不舒服')
  if (/开心|高兴|好心情|还好|挺好/.test(userTexts)) facts.push('用户心情偏开心或轻松')
  if (/累|烦|压力|难受/.test(userTexts)) facts.push('用户有疲惫或压力')
  if (/朋友|结婚|幸福/.test(userTexts)) facts.push('用户提到朋友/婚礼/幸福')
  if (/中奖|彩票|20块|二十/.test(userTexts)) facts.push('用户提到中奖或小惊喜')
  if (/上班|工作/.test(userTexts)) facts.push('用户提到上班/工作')

  return facts.length ? `本轮对话已知事实：${facts.join('；')}。请结合这些事实回答，不要当作没听过。` : ''
}

async function callQwen({ apiKey, messages, temperature = 0.75, timeoutMs }) {
  const response = await axios.post(
    `${QWEN_API_BASE_URL}/chat/completions`,
    {
      model: QWEN_MODEL,
      messages,
      temperature,
      presence_penalty: 0.4,
      frequency_penalty: 0.5,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: timeoutMs ?? Number(process.env.CHAT_REQUEST_TIMEOUT || 25000)
    }
  )
  const content = response.data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty Qwen response')
  return safeParseJson(content)
}

async function chatWithQwen({ messages }) {
  const apiKey = process.env.QWEN_API_KEY
  const normalizedMessages = normalizeMessages(messages)
  const memorySummary = buildMemorySummary(normalizedMessages)

  if (!apiKey || apiKey === 'YOUR_QWEN_API_KEY') {
    return fallbackChat({ messages: normalizedMessages })
  }

  const baseMessages = [
    { role: 'system', content: systemPrompt },
    ...(memorySummary ? [{ role: 'system', content: memorySummary }] : []),
    ...normalizedMessages
  ]

  let parsedRaw = await callQwen({ apiKey, messages: baseMessages })
  let parsed = normalizeChatResult(parsedRaw, normalizedMessages)

  // 如果回复为空 / 太通用 / 重复，让千问基于上下文重答一次
  if (parsed._wasEmpty || isRepeatedReply(parsed.reply, normalizedMessages) || isWeakReply(parsed.reply)) {
    const lastUser = getLastUserText(normalizedMessages)
    const retryMessages = [
      ...baseMessages,
      {
        role: 'system',
        content: `你刚刚的回复为空或太通用。请根据用户最近一句"${lastUser}"，结合上下文，写一段 30-90 个中文字符、自然、像朋友的回复。必须填 reply 字段，仍然以 JSON 输出。`
      }
    ]
    try {
      const retryRaw = await callQwen({ apiKey, messages: retryMessages, temperature: 0.9, timeoutMs: 15000 })
      const retryParsed = normalizeChatResult(retryRaw, normalizedMessages)
      if (!retryParsed._wasEmpty && !isRepeatedReply(retryParsed.reply, normalizedMessages) && !isWeakReply(retryParsed.reply)) {
        parsed = retryParsed
      }
    } catch (e) {
      // 重试失败保留原 parsed
    }
  }

  delete parsed._wasEmpty
  return applyGenerationPolicy(parsed, normalizedMessages)
}

/**
 * 调千问生成中文歌词（中文能力比 Mureka /v1/lyrics/generate 强）
 * 返回 { lyrics, title } 或 抛错
 */
async function generateLyricsWithQwen({ userText, styleHint, emotion, musicTitle }) {
  const apiKey = process.env.QWEN_API_KEY
  if (!apiKey || apiKey === 'YOUR_QWEN_API_KEY') {
    throw new Error('Qwen API key not configured')
  }

  const moodMap = {
    melancholy: '低沉、含蓄、带一点叹息感',
    solitude: '安静、独白式',
    anxiety: '紧绷、想被安抚',
    anger: '直接、有冲击力',
    confusion: '游离、提问感',
    calm: '舒缓、像呼吸',
    joy: '轻快、明亮',
    hope: '克制的暖意、像晨光',
    exhaustion: '疲惫但温柔'
  }
  const mood = moodMap[emotion] || moodMap.calm

  const systemPrompt = `你是一位中文流行歌曲作词人。请根据用户的对话上下文写一段中文歌词。

要求：
1. 必须紧扣用户在聊天里实际表达的具体场景、人物、事件、情绪。不要写无关的通用情歌。
2. **严禁陈词滥调**：不要写"雨滴/雨水/窗台/灯影/月光/泪水/心头/夜深/被接住/深夜/重量"。一句都不要。
3. 意象要具体、独特、新鲜——可以写街角的便利店、地铁、外卖、奶茶、加班、凌晨的微信、工位、塞车、秋叶、沙拉、口罩、共享单车、电话铃……贴近用户真实生活。
4. 用日常普通话，画面感强，能让人记住一个具体画面。
5. 结构：[Verse 1] / [Chorus] / [Verse 2] / [Chorus] / [Bridge]（可选）。
6. 总字数 180–260 个中文字。
7. 副歌要有强记忆点（一句重复、有节奏感）。

只输出 JSON：
{ "lyrics": "[Verse 1]\\n...\\n[Chorus]\\n...", "title": "中文标题，2-8字" }`

  const userPrompt = `情绪基调：${mood}。
${musicTitle ? `已有标题：《${musicTitle}》。` : ''}
${styleHint ? `音乐方向：${styleHint}。` : ''}
${userText ? `用户的真实聊天内容：\n${String(userText).slice(0, 600)}` : ''}

请基于以上内容写歌词。`

  const data = await callQwen({
    apiKey,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.95,
    timeoutMs: 30000
  })

  const lyrics = String(data?.lyrics || '').trim()
  const title = String(data?.title || musicTitle || '').trim()
  if (!lyrics) throw new Error('Qwen lyrics empty')
  return { lyrics, title }
}

module.exports = {
  chatWithQwen,
  generateLyricsWithQwen
}
