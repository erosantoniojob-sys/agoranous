import catalog from './cinema.json'
import type { MediaItem } from '../types/agora'

export interface CinemaFilm {
  id: string
  title: string
  year: number
  director: string
  minutes: number
  country: string
  genre: string
  synopsis: string
  study: string
  poster: string
  source: string
  foundation: boolean
  book?: { title: string; author: string; year: string; relationship: string }
}

export const cinemaFilms: CinemaFilm[] = catalog
export const CINEMA_CATEGORY = 'Cinema · Formação de clássicos'
export const normalizeCinemaTitle = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '')

export function findCinemaMedia(film: CinemaFilm, items: MediaItem[]) {
  return items.find(item => item.tipo === 'Filme' && (
    item.fonte === `agora:cinema:${film.id}` ||
    (normalizeCinemaTitle(item.titulo) === normalizeCinemaTitle(film.title) && (!item.ano || item.ano === film.year))
  ))
}

export function cinemaMediaInput(film: CinemaFilm): Omit<MediaItem, 'id' | 'criadoEm'> {
  return {
    titulo: film.title, tipo: 'Filme', ano: film.year, autor_criador: film.director,
    sinopse: film.synopsis, url_capa: film.poster, generos: [film.genre],
    status: 'Pendente', avaliacao_numerica: 0, progresso_percentual: 0,
    fonte: `agora:cinema:${film.id}`, motivo_leitura: film.study,
    progresso_detalhado: { atual: 0, total: film.minutes, unidade: 'minutos' },
  }
}
