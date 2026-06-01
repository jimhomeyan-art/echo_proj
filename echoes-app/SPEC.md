# Echoes / 回响 - 产品规格文档

## 1. Concept & Vision 概念与愿景

**产品口号**: 给你的情绪配一段电影 BGM。

**核心理念**: 一款将即时情绪与音乐品味连接的轻量化疗愈社交数字产品。通过高水准的电影感审美，为用户提供低压力、高共情的私人情绪角落，利用音乐品味实现人与人之间的深度连接。

**情感基调**: 深邃、温暖、私密、电影感。如同深夜独自观看的艺术电影，带有微微的忧郁与希望。

---

## 2. Design Language 设计语言

### 2.1 Aesthetic Direction 美学方向
**风格参考**: 深夜电影感 × 流体艺术 × 极简主义
- 深色系沉浸式界面
- 流体渐变动画表现情绪波动
- 大量留白与呼吸感
- 电影感光影效果

### 2.2 Color Palette 色彩系统

```
Primary Colors 主色:
├── Deep Night 深夜蓝:     #0D1B2A  (主背景)
├── Twilight 暮光紫:       #1B263B  (卡片背景)
├── Dusk 暮色:             #415A77  (次级元素)
└── Mist 薄雾:            #778DA9  (辅助文字)

Accent Colors 情绪色彩:
├── Warm Amber 暖琥珀:     #E07A5F  (温暖/治愈)
├── Soft Lavender 柔薰:    #9D8DF1  (平静/沉思)
├── Ocean Blue 海洋蓝:      #4EA8DE  (深邃/治愈)
├── Sunset Coral 日落珊:    #F4845F  (活力/希望)
└── Forest Green 森林绿:    #81B29A  (平静/自然)

Functional Colors 功能色:
├── Glow 发光:             rgba(255, 255, 255, 0.1)
├── Ripple 波纹:           rgba(255, 255, 255, 0.05)
└── Particle 粒子:         rgba(255, 255, 255, 0.03)
```

### 2.3 Typography 字体系统

```
Primary Font 主字体:
├── Chinese: "PingFang SC", "Noto Sans SC"
├── English: "SF Pro Display", "-apple-system"
└── Fallback: "Helvetica Neue", sans-serif

Font Sizes 字号:
├── Hero 英雄标题:    48rpx / 1.5 line-height
├── H1 一级标题:      40rpx / 1.4
├── H2 二级标题:      32rpx / 1.4
├── H3 三级标题:      28rpx / 1.5
├── Body 正文:        28rpx / 1.6
├── Caption 辅助:     24rpx / 1.5
└── Micro 极小:       20rpx / 1.4

Font Weights 字重:
├── Light:     300
├── Regular:   400
├── Medium:    500
└── Semibold:  600
```

### 2.4 Spatial System 空间系统

```
Base Unit 基础单位:  8rpx

Spacing Scale 间距:
├── xs:   8rpx   (紧凑)
├── sm:   16rpx  (元素内)
├── md:   24rpx  (元素间)
├── lg:   32rpx  (区块内)
├── xl:   48rpx  (区块间)
├── 2xl:  64rpx  (页面内大区块)
└── 3xl:  96rpx  (页面间)

Border Radius 圆角:
├── sm:   8rpx   (按钮)
├── md:   16rpx  (卡片)
├── lg:   24rpx  (模态框)
└── full: 9999rpx (圆形)
```

### 2.5 Motion Philosophy 动效哲学

**核心原则**: 流畅、有机、呼吸感

```
Animation Timings 动效时长:
├── instant:   100ms  (微交互)
├── fast:      200ms  (状态切换)
├── normal:    400ms  (内容过渡)
├── slow:      600ms  (页面切换)
└── dramatic:  1000ms (情绪转换)

Easing Functions 缓动曲线:
├── ease-out:      cubic-bezier(0.0, 0.0, 0.2, 1)
├── ease-in-out:   cubic-bezier(0.4, 0.0, 0.2, 1)
├── spring:        cubic-bezier(0.175, 0.885, 0.32, 1.275)
└── gentle:        cubic-bezier(0.25, 0.1, 0.25, 1)

Signature Animations 标志性动效:
├── Fluid Gradient:  流体渐变背景 (持续循环, 20s)
├── Pulse Wave:      情绪脉冲波 (响应用户输入)
├── Particle Drift:  粒子漂浮 (低频持续)
├── Ripple Echo:     涟漪扩散 (共振反馈)
└── Glow Breathe:     发光呼吸 (状态指示)
```

### 2.6 Visual Assets 视觉资产

```
Icons 图标:
- 风格: 线性 + 圆润端点, 2px 描边
- 尺寸: 24px / 32px / 48px
- 颜色: #778DA9 (默认), #E07A5F (激活)

Backgrounds 背景:
- 主背景: 深色流体渐变 (多色渐变动画)
- 卡片: 半透明毛玻璃效果
- 情绪背景: 基于情绪类型变化的动态渐变

Decorative Elements 装饰:
- 粒子系统: 白色微粒漂浮
- 光晕: 情绪色彩的光晕效果
- 波形: 音频波动的可视化
```

---

## 3. Layout & Structure 布局与结构

### 3.1 App Architecture 应用架构

```
┌─────────────────────────────────────┐
│           Echoes / 回响               │
├─────────────────────────────────────┤
│  Tab Bar 导航 (底部, 毛玻璃)          │
│  ├── 首页 Home (情绪入口)            │
│  ├── 频道 Channel (即时连接)         │
│  ├── 胶囊 Capsule (时空胶囊)         │
│  └── 我的 Mine (个人中心)             │
└─────────────────────────────────────┘
```

### 3.2 Page Structure 页面结构

**首页 (Home)**
```
┌─────────────────────────────────────┐
│  Status Bar (沉浸式状态栏)           │
├─────────────────────────────────────┤
│  Logo + 时间问候                     │
│  "晚安，此刻你在想什么？"            │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    情绪输入区域              │    │
│  │    (文字/语音输入)           │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  情绪分析结果展示                    │
│  ┌──────┬──────┬──────┐             │
│  │忧郁  │愤怒  │迷茫  │             │
│  │ 35%  │ 12%  │ 28%  │             │
│  └──────┴──────┴──────┘             │
│                                     │
│  [播放情绪配乐] 按钮                 │
│                                     │
│  生成的配乐播放器                    │
│  (波形可视化 + 进度条)              │
│                                     │
│  视觉背景 (流体艺术)                 │
│                                     │
├─────────────────────────────────────┤
│  Tab Bar                            │
└─────────────────────────────────────┘
```

**频道 (Channel)**
```
┌─────────────────────────────────────┐
│  标题: 即时频道                      │
├─────────────────────────────────────┤
│                                     │
│  当前情绪频率显示                    │
│  ┌─────────────────────────────┐    │
│  │    ◉ 你的频率: 432Hz        │    │
│  │    [可视化波形动画]         │    │
│  └─────────────────────────────┘    │
│                                     │
│  附近同频者                          │
│  ┌─────────────────────────────┐    │
│  │ ○ ○ ○  (3人同频)            │    │
│  │ 点击发送共振信号              │    │
│  └─────────────────────────────┘    │
│                                     │
│  [发起流星通话] 按钮                 │
│                                     │
│  共振雷达 (圆形可视化)               │
│  显示附近用户位置和频率              │
│                                     │
├─────────────────────────────────────┤
│  Tab Bar                            │
└─────────────────────────────────────┘
```

**胶囊 (Capsule)**
```
┌─────────────────────────────────────┐
│  标题: 时空胶囊                      │
├─────────────────────────────────────┤
│                                     │
│  胶囊列表                            │
│  ┌─────────────────────────────┐    │
│  │ 📅 2024.03.15 21:30          │    │
│  │ "今天终于完成了项目..."       │    │
│  │ [播放配乐片段]                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📅 2024.02.28 02:15          │    │
│  │ "凌晨的孤独..."              │    │
│  │ [播放配乐片段]                │    │
│  └─────────────────────────────┘    │
│                                     │
│  [+ 创建新胶囊] FAB 按钮             │
│                                     │
│  收到回响通知区                      │
│  "一年前的今天，你留下了..."         │
│                                     │
├─────────────────────────────────────┤
│  Tab Bar                            │
└─────────────────────────────────────┘
```

**我的 (Mine)**
```
┌─────────────────────────────────────┐
│  用户信息卡片                        │
│  ┌─────────────────────────────┐    │
│  │  头像 (渐变边框)            │    │
│  │  昵称                       │    │
│  │  "情绪收藏: 128"            │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  功能列表                            │
│  ├── 我的情绪档案                    │
│  ├── 收藏的配乐                     │
│  ├── 聆听历史                       │
│  ├── 设置                           │
│  └── 关于                           │
├─────────────────────────────────────┤
│  Tab Bar                            │
└─────────────────────────────────────┘
```

---

## 4. Features & Interactions 功能与交互

### 4.1 AI 情绪炼金术 (核心功能)

**文字输入**
- 输入框: 占位符 "此刻，你的思绪..."
- 最大字数: 500字
- 实时字数统计
- 发送按钮: 右上角，发光脉冲效果

**语音输入**
- 长按录音按钮
- 波形可视化反馈
- 最长60秒
- 释放发送

**情绪分析展示**
- 动画进入: 从底部渐入 (400ms)
- 显示3-5种情绪及其百分比
- 情绪标签动画: 数字滚动效果
- 颜色编码对应情绪类型

**情绪类型定义**
```
情绪库:
├── 忧郁 Melancholy:    #778DA9
├── 孤独 Solitude:      #415A77
├── 焦虑 Anxiety:       #E07A5F
├── 愤怒 Anger:         #F4845F
├── 迷茫 Confusion:      #9D8DF1
├── 平静 Calm:          #81B29A
├── 喜悦 Joy:           #FFD166
├── 希望 Hope:          #4EA8DE
└── 疲惫 Exhausted:     #6C757D
```

**情绪配乐生成**
- 加载状态: 波形动画 + "正在为你谱曲..."
- 生成完成: 音乐播放器滑入
- 播放器包含:
  - 专辑封面 (动态渐变)
  - 曲目名称 (基于情绪命名)
  - 艺术家: "Echoes AI"
  - 播放/暂停按钮
  - 进度条 (可拖拽)
  - 波形可视化条

**视觉背景**
- 根据情绪类型切换渐变
- 流体动画持续循环
- 粒子系统漂浮

### 4.2 即时频道与共振雷达

**频率系统**
- 频率计算: 基于情绪类型和强度
- 频率范围: 174Hz - 963Hz
- 可视化: 圆形雷达图

**频道列表**
- 显示当前在线人数
- 频率相似度 > 70% 自动匹配
- 点击加入频道

**共振交互**
- 点击发送共振信号
- 涟漪动画扩散
- 对方收到:
  - 屏幕边缘闪烁
  - 轻微震动反馈
  - 音效: 水滴声

**流星通话**
- 需要达到 Lv.3 解锁
- 通话时长: 60秒
- 背景自动播放情绪配乐
- 通话结束: 自动保存为胶囊

### 4.3 时空胶囊

**创建胶囊**
- 情绪记录 (引用之前的情绪)
- 文字内容 (选填)
- 配乐片段
- 设定解封时间 (默认一年后)

**回响触发**
- 一年后同一天推送通知
- 内容: "一年前的今天，你曾这样写道..."
- 可选择公开或保持私密

**匹配机制**
- 系统将胶囊匹配给当前处于相似情绪的用户
- 被匹配者收到: "有人与你共情"
- 创作者收到: "你的胶囊被回响"

---

## 5. Component Inventory 组件清单

### 5.1 Navigation 导航组件

**TabBar**
- 4个标签: 首页、频道、胶囊、我的
- 高度: 100rpx + safe-area
- 背景: 毛玻璃效果
- 图标: 24px, 未选中灰色，选中渐变色
- 文字: 20rpx
- 状态: 默认、选中、徽标

### 5.2 Input 输入组件

**EmotionInput (情绪输入框)**
- 样式: 全宽圆角输入框
- 背景: rgba(255,255,255,0.05)
- 边框: 1px solid rgba(255,255,255,0.1)
- placeholder: #778DA9
- 聚焦: 边框发光效果

**VoiceButton (语音按钮)**
- 尺寸: 120rpx 圆形
- 背景: 渐变色
- 动画: 按下缩小 + 波纹扩散
- 状态: 空闲、录音中、发送中

### 5.3 Display 展示组件

**EmotionCard (情绪卡片)**
- 背景: 毛玻璃
- 内容: 情绪类型 + 百分比
- 动画: 数字滚动效果
- 点击: 展开详情

**MusicPlayer (音乐播放器)**
- 封面: 动态渐变 + 旋转动画
- 控制: 播放/暂停、进度条
- 波形: 音频可视化条
- 歌词: 逐行淡入淡出

**CapsuleCard (胶囊卡片)**
- 布局: 日期 + 情绪图标 + 文字预览
- 缩略图: 配乐波形
- 操作: 播放、删除

### 5.4 Feedback 反馈组件

**Toast**
- 样式: 居中弹出，毛玻璃
- 动画: 缩放淡入
- 自动消失: 2s

**Modal**
- 全屏半透明遮罩
- 内容居中卡片
- 动画: 从底部滑入

**Loading**
- 全屏: 波浪动画
- 局部: 脉冲点

---

## 6. Technical Approach 技术方案

### 6.1 Framework 框架选择

**微信小程序原生开发**
- 使用微信小程序原生框架
- TypeScript 开发
- Vite 构建 (可选)

### 6.2 Project Structure 项目结构

```
echoes/
├── app.js              # 应用入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── pages/
│   ├── home/           # 首页
│   │   ├── index.js
│   │   ├── index.wxml
│   │   ├── index.json
│   │   └── index.wxss
│   ├── channel/        # 频道页
│   ├── capsule/        # 胶囊页
│   └── mine/           # 我的页
├── components/
│   ├── emotion-input/  # 情绪输入组件
│   ├── music-player/   # 音乐播放器组件
│   ├── emotion-display/# 情绪展示组件
│   ├── capsule-card/   # 胶囊卡片组件
│   ├── radar/         # 共振雷达组件
│   └── tab-bar/       # 底部导航组件
├── utils/
│   ├── emotions.js    # 情绪分析工具
│   ├── music.js       # 音乐相关工具
│   └── storage.js     # 本地存储工具
├── services/
│   └── api.js         # API 服务
├── assets/
│   ├── icons/         # 图标
│   ├── images/        # 图片
│   └── audio/         # 音频
└── styles/
    ├── variables.wxss # CSS 变量
    └── animations.wxss# 动画定义
```

### 6.3 Key Technologies 关键技术

**情绪识别 (模拟)**
- 前端模拟多维情绪分析
- 基于文字关键词匹配
- 返回情绪比例数据

**音频播放**
- 使用 innerAudioContext
- 背景音乐播放支持
- 波形数据获取

**动画系统**
- CSS 动画为主
- 小程序动画 API
- rpx 响应式单位

### 6.4 Data Models 数据模型

**情绪记录 EmotionRecord**
```javascript
{
  id: string,
  createdAt: timestamp,
  type: 'text' | 'voice',
  content: string,
  emotions: {
    [emotionType]: number  // 0-100
  },
  musicId: string,
  musicUrl: string,
  visualStyle: string
}
```

**时空胶囊 Capsule**
```javascript
{
  id: string,
  createdAt: timestamp,
  unlockAt: timestamp,
  emotionRecord: EmotionRecord,
  content: string,
  isPublic: boolean,
  echoes: number  // 被回响次数
}
```

**用户 User**
```javascript
{
  id: string,
  nickname: string,
  avatar: string,
  level: number,
  emotionCount: number,
  capsuleCount: number,
  createdAt: timestamp
}
```

### 6.5 State Management 状态管理

**全局状态 (App Global Data)**
```javascript
{
  user: User,
  currentEmotion: EmotionRecord | null,
  nowPlaying: Music | null,
  isPlaying: boolean
}
```

**页面状态 (Page Data)**
- 每个页面管理自己的状态
- 通过事件与组件通信

---

## 7. Implementation Phases 实施阶段

### Phase 1: MVP 最小可行产品
- [ ] 首页基础布局
- [ ] 情绪输入与模拟分析
- [ ] 模拟音乐播放器
- [ ] 基础视觉动效
- [ ] 底部导航

### Phase 2: 核心功能
- [ ] 频道列表与加入
- [ ] 共振雷达可视化
- [ ] 时空胶囊 CRUD
- [ ] 用户个人中心

### Phase 3: 高级功能
- [ ] 语音输入
- [ ] 流星通话 UI
- [ ] 回响匹配系统
- [ ] 推送通知

### Phase 4: 优化与体验
- [ ] 性能优化
- [ ] 更多视觉动效
- [ ] 音效系统
- [ ] 社交分享

---

## 8. Mock Data 模拟数据

### 模拟情绪分析结果
```javascript
const mockEmotionResult = {
  emotions: {
    melancholy: 35,
    solitude: 28,
    confusion: 18,
    hope: 12,
    calm: 7
  },
  dominant: 'melancholy',
  intensity: 72
};
```

### 模拟音乐数据
```javascript
const mockMusic = {
  id: 'music_001',
  title: '深夜独白',
  artist: 'Echoes AI',
  duration: 60,
  url: '/assets/audio/demo.mp3',
  coverGradient: ['#415A77', '#1B263B', '#0D1B2A']
};
```

### 模拟胶囊数据
```javascript
const mockCapsules = [
  {
    id: 'capsule_001',
    createdAt: '2024-03-15T21:30:00',
    unlockAt: '2025-03-15T21:30:00',
    content: '今天终于完成了困扰两周的项目，如释重负。',
    emotions: { calm: 45, relief: 35, hope: 20 },
    musicTitle: '曙光'
  },
  {
    id: 'capsule_002',
    createdAt: '2024-02-28T02:15:00',
    unlockAt: '2025-02-28T02:15:00',
    content: '凌晨三点的窗外，失眠成了老朋友。',
    emotions: { solitude: 50, exhaustion: 30, melancholy: 20 },
    musicTitle: '蓝色时刻'
  }
];
```
