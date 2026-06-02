import React, { useState } from 'react'
import { Check, PenLine } from 'lucide-react'
import type { NamingPrompt } from '../../context/ChatContext'

interface NamingCardProps {
  messageId: string
  naming: NamingPrompt
  onChoose: (messageId: string, mode: 'ai' | 'self') => void
  onSubmit: (messageId: string, title: string) => void
}

export const NamingCard: React.FC<NamingCardProps> = ({ messageId, naming, onChoose, onSubmit }) => {
  const [title, setTitle] = useState('')
  const isDone = naming.status === 'done'
  const awaitingInput = naming.status === 'awaitingInput'
  const hasAiTitle = Boolean((naming.aiTitle || '').trim())

  if (isDone) {
    return (
      <div className="bg-ink-50 rounded-2xl rounded-tl-md px-4 py-3 text-[14px] text-ink-500">
        准备开始创作。
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-ink-100 rounded-2xl rounded-tl-md p-4 max-w-full">
      {!awaitingInput ? (
        <>
          {/* 歌名展示 */}
          <div className="text-center mb-4">
            {hasAiTitle ? (
              <>
                <p className="text-[12px] text-ink-500 mb-1">Echo 建议的名字</p>
                <p className="text-[22px] font-display font-bold text-ink-900 leading-tight">
                  《{naming.aiTitle}》
                </p>
              </>
            ) : (
              <p className="text-[15px] text-ink-900 font-medium">这首歌想叫什么名字？</p>
            )}
          </div>

          {/* 两个干净按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => onChoose(messageId, 'self')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-pill border border-ink-100 bg-white text-[13px] font-medium text-ink-500 hover:border-ink-300 hover:text-ink-900 transition-colors btn-press"
            >
              <PenLine className="w-3.5 h-3.5" />
              换个名字
            </button>
            <button
              onClick={() => onChoose(messageId, 'ai')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-pill bg-echo-green text-ink-900 text-[13px] font-semibold shadow-flame btn-press hover:opacity-90 transition-opacity"
            >
              <Check className="w-3.5 h-3.5" />
              {hasAiTitle ? '就用这个' : '让 Echo 起名'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[13px] text-ink-500 mb-2.5">起一个名字吧：</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && title.trim()) onSubmit(messageId, title)
              }}
              placeholder={naming.aiTitle || '比如：雨夜霓虹'}
              maxLength={20}
              autoFocus
              className="flex-1 bg-ink-50 rounded-pill px-4 py-2.5 text-[14px] text-ink-900 outline-none focus:ring-1 focus:ring-ink-900 transition-all placeholder:text-ink-300"
            />
            <button
              onClick={() => onSubmit(messageId, title)}
              disabled={!title.trim()}
              className="px-4 py-2.5 rounded-pill bg-echo-green text-ink-900 text-[13px] font-semibold shadow-flame disabled:opacity-40 btn-press"
            >
              确定
            </button>
          </div>
        </>
      )}
    </div>
  )
}
