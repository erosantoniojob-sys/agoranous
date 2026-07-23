import React, { useState } from 'react'
import { Quote, RefreshCw, Sparkles, BookOpen } from 'lucide-react'

interface QuoteData {
  quote: string
  author: string
  source: string
  category: string
}

const CLASSICAL_QUOTES: QuoteData[] = [
  {
    quote: 'A beleza salvará o mundo. O amor ativo é um trabalho árduo e assustador comparado ao amor passivo.',
    author: 'Fiódor Dostoiévski',
    source: 'Os Irmãos Karamázov',
    category: 'Literatura Clássica & Ética',
  },
  {
    quote: 'Tentei todas as coisas e, veja, em nenhuma delas encontrei a felicidade até que descansei na tua presença.',
    author: 'Santo Agostinho',
    source: 'Confissões',
    category: 'Teologia & Filosofia',
  },
  {
    quote: 'Não é que tenhamos pouco tempo, mas sim que perdemos muito. A vida é longa o suficiente se soubermos empregá-la.',
    author: 'Sêneca',
    source: 'Sobre a Brevidade da Vida',
    category: 'Filosofia Estoica & Hábitos',
  },
  {
    quote: 'A vida só pode ser compreendida olhando-se para trás, mas só pode ser vivida olhando-se para a frente.',
    author: 'Søren Kierkegaard',
    source: 'Diários',
    category: 'Filosofia Existencial',
  },
  {
    quote: 'A mente que se abre a uma nova ideia jamais voltará ao seu tamanho original.',
    author: 'Platão',
    source: 'A República',
    category: 'Filosofia Grega',
  },
  {
    quote: 'Somos o que fazemos repetidamente. A excelência, portanto, não é um ato, mas um hábito.',
    author: 'Aristóteles',
    source: 'Ética a Nicômaco',
    category: 'Hábitos & Ética',
  },
  {
    quote: 'A literatura e a arte revelam o transcendente onde o discurso comum silencia.',
    author: 'C.S. Lewis',
    source: 'O Peso da Glória',
    category: 'Teologia & Cosmovisão',
  },
  {
    quote: 'Aqueles que não conseguem lembrar o passado estão condenados a repeti-lo.',
    author: 'G.K. Chesterton',
    source: 'Ortodoxia',
    category: 'Filosofia & Crítica Social',
  },
]

export const DailyQuoteCard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const currentQuote = CLASSICAL_QUOTES[currentIndex]

  const handleRefreshQuote = async () => {
    setIsLoading(true)
    try {
      // Rotate to next quote or fetch via chatMentor endpoint
      const nextIdx = (currentIndex + 1) % CLASSICAL_QUOTES.length
      await new Promise((r) => setTimeout(r, 300))
      setCurrentIndex(nextIdx)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-bg-surface via-[#182a3a] to-bg-surface border border-accent-gold/30 rounded-2xl p-6 sm:p-7 shadow-3d-deep backdrop-blur-md transition-all group">
      {/* Soft golden glow in the background */}
      <div className="absolute -right-12 -top-12 w-56 h-56 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-gold/15 transition-all" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top bar with category badge and AI generator button */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/15 text-accent-gold text-[11px] font-semibold uppercase tracking-wider border border-accent-gold/30 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <span>Citação Diária • {currentQuote.category}</span>
          </div>

          <button
            onClick={handleRefreshQuote}
            disabled={isLoading}
            className="p-2 text-text-secondary hover:text-accent-gold hover:bg-bg-base/60 rounded-xl border border-text-primary/10 hover:border-accent-gold/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Gerar / Alternar Citação Diária"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-accent-gold' : ''}`} />
            <span className="hidden sm:inline">Nova Citação</span>
          </button>
        </div>

        {/* Quote Text */}
        <div className="space-y-3 pt-1">
          <div className="relative pl-6 border-l-2 border-accent-gold/80">
            <Quote className="w-5 h-5 text-accent-gold/40 absolute -left-2.5 -top-2 fill-accent-gold/20" />
            <p className="font-serif italic text-lg sm:text-xl text-text-primary leading-relaxed drop-shadow-sm">
              "{currentQuote.quote}"
            </p>
          </div>

          {/* Author Citation */}
          <div className="flex items-center justify-between pt-2 border-t border-text-primary/10 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-accent-gold text-base">
                — {currentQuote.author}
              </span>
              <span className="text-text-secondary font-sans text-xs hidden sm:inline">
                ({currentQuote.source})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-accent-gold/80 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Oráculo Ágora</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
