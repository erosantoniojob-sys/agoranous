import records from './classicBooks.json'
import type { MediaItem } from '../types/agora'

export interface ClassicBook {
  id: string
  title: string
  author: string
  category: string
  themes: string[]
  language: string
  subjects: string[]
  sourceUrl: string
  cover: string
}

export const classicBooks: ClassicBook[] = records
export const normalizeBookText = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, ' ').trim()
export const classicBookKey = (title: string, author: string) => `${normalizeBookText(title)}|${normalizeBookText(author)}`
export const classicBookSearch = new Map(classicBooks.map(book => [book.id, normalizeBookText([book.title, book.author, ...book.themes, ...book.subjects].join(' '))]))

export function classicBookInput(book: ClassicBook): Omit<MediaItem, 'id' | 'criadoEm'> {
  return {
    titulo: book.title,
    tipo: 'Livro',
    autor_criador: book.author,
    url_capa: book.cover,
    sinopse: `${book.category}. Temas: ${book.themes.join(', ')}.\nEdição em ${book.language === 'pt' ? 'português' : 'inglês'}.\nReferência bibliográfica: ${book.sourceUrl}`,
    generos: [...book.themes, 'Clássicos'],
    fonte: `agora:classic:${book.id}`,
    status: 'Pendente',
    avaliacao_numerica: 0,
    progresso_percentual: 0,
  }
}
