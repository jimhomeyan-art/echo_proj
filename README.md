# Echoes / 回响

> 给你的情绪配一段电影 BGM。

一款将即时情绪与音乐品味连接的轻量化疗愈社交数字产品。通过深夜电影感美学，为用户提供低压力、高共情的私人情绪角落。

---

## 项目结构

```
echo_proj/
└── echoes-app/
    ├── 微信小程序          原生小程序版本（pages/components/services）
    ├── echoes-web/         主 Web 端（React + Vite + TypeScript）
    ├── melody-soul-project/melody-soul/   新版 UI 工程（移动端样式）
    └── server/             后端 API 代理（Express + 千问 + Mureka）
```

---

## 技术栈

| 层 | 技术 |
|---|---|
| Web 前端 | React 18 + TypeScript + Vite + Tailwind + Radix UI |
| 后端 | Node.js + Express |
| AI 聊天 | 通义千问（DashScope OpenAI 兼容接口） |
| AI 音乐 | Mureka（`/v1/instrumental/generate` + `/v1/lyrics/generate` + `/v1/song/generate`） |

---

## 本地启动

### 1. 后端

```bash
cd echoes-app/server
npm install
cp .env.example .env       # 然后填入真实 API Key
npm start                  # 默认 :3001
```

需要的 API Key：

- `MUREKA_API_KEY`：[https://platform.mureka.ai](https://platform.mureka.ai)
- `QWEN_API_KEY`：[https://bailian.console.aliyun.com](https://bailian.console.aliyun.com)

### 2. Web 前端

```bash
cd echoes-app/echoes-web
pnpm install
pnpm dev                   # 默认 http://127.0.0.1:5173
```

可选：复制 `.env.example` 为 `.env`，调整后端地址。

---

## 核心能力

- **Echo 对话**：千问驱动的治愈型对话伙伴，会根据上下文自然引导音乐创作
- **歌曲生成**：默认按歌曲生成，支持千问主导 styleHint，含中国风/lofi/city pop 等多种 sonic palette
- **纯音乐生成**：用户主动说 BGM/纯音乐/伴奏时切换
- **情绪记忆**：本轮对话记住下雨/朋友/中奖等具体事件
- **音乐卡片**：聊天窗口内嵌播放器，跨页面持久化

---

## 安全

- **API Key 仅在后端 `.env`，不进 Git**
- 前端通过本地 `/api` 代理调用，避免泄露
- `.gitignore` 已排除所有 `.env`、`*.log`、`smoke-test.cjs` 等本地文件

---

## License

私有项目，未对外开源。
