import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, Terminal, BookOpen, Sparkles } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'

export const RightChatDrawer: React.FC = () => {
  const { isRightChatOpen, setIsRightChatOpen, chatMessages, sendChatMessage, userProfile } = useAgoraStore()
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isRightChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isRightChatOpen])

  if (!isRightChatOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const messageText = input
    setInput('')
    setIsSending(true)

    await sendChatMessage(messageText)

    setIsSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsRightChatOpen(false)}
        className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm animate-fadeIn"
      />

      {/* Right Drawer Panel */}
      <div className="relative w-96 max-w-[90vw] bg-bg-surface border-l border-text-primary/15 h-full z-10 flex flex-col justify-between shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 bg-bg-elevated/80 border-b border-text-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg-base border border-accent-gold/40 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-text-primary flex items-center gap-1.5">
                <span>Mentor Oráculo</span>
                <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              </h3>
              <p className="text-[10px] text-text-secondary">
                Consultor do Segundo Cérebro • ABNT
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRightChatOpen(false)}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-base transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 px-1 text-[10px] text-text-secondary">
                  <span>{isUser ? (userProfile.nome || 'Convidado') : 'Oráculo IA'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[92%] whitespace-pre-wrap leading-relaxed border ${
                    isUser
                      ? 'bg-accent-gold/15 text-text-primary border-accent-gold/30 rounded-tr-none'
                      : 'bg-bg-elevated text-text-primary border-text-primary/10 rounded-tl-none font-mono text-[11px]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            )
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-text-secondary text-xs italic p-2 bg-bg-elevated/40 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-accent-gold animate-ping" />
              <span>Sintetizando consulta em formato ABNT...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-bg-elevated/90 border-t border-text-primary/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Perguntar ao Mentor Oráculo..."
            className="flex-1 px-3 py-2 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
          />

          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="px-3.5 py-2 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
