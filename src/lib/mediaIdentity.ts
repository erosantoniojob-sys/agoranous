import type { MediaItem } from '../types/agora'

type Identity = Pick<MediaItem, 'tipo' | 'titulo' | 'autor_criador' | 'ano' | 'fonte'>
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '')

export function sameMediaIdentity(existing: Identity, incoming: Identity): boolean {
  if (existing.tipo !== incoming.tipo) return false
  if (incoming.fonte?.startsWith('agora:classic:') && existing.fonte === incoming.fonte) return true
  if (normalize(existing.titulo) !== normalize(incoming.titulo)) return false
  if (incoming.tipo === 'Livro' && existing.autor_criador && incoming.autor_criador) {
    return normalize(existing.autor_criador) === normalize(incoming.autor_criador)
  }
  return !['Filme', 'Série'].includes(incoming.tipo) || !existing.ano || !incoming.ano || existing.ano === incoming.ano
}
