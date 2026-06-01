import React, { useState } from 'react'
import { Check, Sparkles, PenLine } from 'lucide-react'
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
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft text-sm text-text-secondary">
        准备开始创作。
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/15 rounded-2xl rounded-tl-sm p-4 max-w-full">
      {!awaitingInput ? (
        <>
          <p className="text-sm text-text-primary leading-relaxed">
            {hasAiTitle
              ? <>就叫 <span className="text-primary font-bold">《{naming.aiTitle}》</span> 怎么样？</>
              : '这首歌想叫什么名字？'}
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={() => onChoose(messageId, 'ai')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-primary btn-press"
            >
              <Check className="w-4 h-4" />
              {hasAiTitle ? `用《${naming.aiTitle}》` : '让 AI 起名'}
            </button>

            <button
              onClick={() => onChoose(messageId, 'self')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-secondary/40 text-sm font-medium text-text-primary btn-press"
            >
              <PenLine className="w-4 h-4 text-secondary" />
              我想换个名字
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-text-primary mb-3">起一个名字吧：</p>
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
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={() => onSubmit(messageId, title)}
              disabled={!title.trim()}
              className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-primary disabled:opacity-40 btn-press"
            >
              确定
            </button>
          </div>
        </>
      )}
    </div>
  )
}
