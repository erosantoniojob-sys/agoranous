import React from 'react'
import philosophersEditorial from '../assets/philosophers-editorial.jpg'

type Philosopher = 'socrates' | 'marcus-aurelius' | 'simone-de-beauvoir' | 'nietzsche'

const positions: Record<Philosopher, string> = {
  socrates: '0% 0%',
  'marcus-aurelius': '100% 0%',
  'simone-de-beauvoir': '0% 100%',
  nietzsche: '100% 100%',
}

const labels: Record<Philosopher, string> = {
  socrates: 'Retrato editorial de Sócrates',
  'marcus-aurelius': 'Retrato editorial de Marco Aurélio',
  'simone-de-beauvoir': 'Retrato editorial de Simone de Beauvoir',
  nietzsche: 'Retrato editorial de Friedrich Nietzsche',
}

export const PhilosopherPortrait: React.FC<{ philosopher: Philosopher; className?: string }> = ({ philosopher, className = '' }) => (
  <div
    role="img"
    aria-label={labels[philosopher]}
    className={`philosopher-portrait ${className}`}
    style={{
      backgroundImage: `url(${philosophersEditorial})`,
      backgroundPosition: positions[philosopher],
    }}
  />
)
