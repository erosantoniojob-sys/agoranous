import works from './classicalWorks.json'
import type { MediaItem, MediaType } from '../types/agora'

export type FormationArea = 'musica' | 'artes' | 'teatro' | 'literatura'
export interface ClassicalWork {
  source?: string;
  cover?: string;
  id: string; area: string; title: string; author: string; period: string; wiki: string; era: string; context: string; activity: string
}
export const classicalWorks: ClassicalWork[] = works
export const classicalFormations: { id: FormationArea; title: string; subtitle: string; type: MediaType; verb: string; method: string; project: string }[] = [
  { id: 'musica', title: 'Música', subtitle: 'Aprender a escutar', type: 'Música', verb: 'Ouvir', method: 'Escute uma vez sem interrupções. Retorne ao trecho indicado e registre o que mudou na segunda escuta.', project: 'Crie um programa comentado de cinco obras, justificando a ordem e as relações entre elas.' },
  { id: 'artes', title: 'Artes visuais', subtitle: 'Educar o olhar', type: 'Arte', verb: 'Observar', method: 'Observe a obra antes de ler sobre ela. Descreva composição, luz e cor; depois confronte sua impressão com o contexto.', project: 'Organize uma exposição imaginária de cinco obras e escreva um pequeno texto de apresentação.' },
  { id: 'teatro', title: 'Teatro', subtitle: 'Dar voz ao conflito', type: 'Teatro', verb: 'Ler ou assistir', method: 'Leia uma cena em voz alta ou assista a uma montagem. Observe gestos, pausas e diferenças entre texto e encenação.', project: 'Escolha uma cena e proponha uma encenação: espaço, gestos, pausas e intenções de cada personagem.' },
  { id: 'literatura', title: 'Literatura', subtitle: 'Habitar outras vozes', type: 'Livro', verb: 'Ler', method: 'Leia no seu ritmo e registre passagens, perguntas e mudanças de perspectiva. As atividades são portas de entrada, não substitutos da obra.', project: 'Escreva um ensaio curto comparando o narrador e um conflito central de duas obras do percurso.' },
]
export const formationCategory = (area: string) => `Formação clássica · ${area}`
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '')
export function findClassicalMedia(work: ClassicalWork, items: MediaItem[]) {
  const type = classicalFormations.find(area => area.id === work.area)!.type
  return items.find(item => item.fonte === `agora:classical:${work.id}` || (item.tipo === type && normalize(item.titulo) === normalize(work.title) && (!item.autor_criador || normalize(item.autor_criador) === normalize(work.author))))
}
export function classicalMediaInput(work: ClassicalWork): Omit<MediaItem, 'id' | 'criadoEm'> {
  return {
    titulo: work.title,
    tipo: classicalFormations.find(area => area.id === work.area)!.type,
    autor_criador: work.author,
    url_capa: work.cover || '',
    capa_oficial: work.cover || '',
    url_capa_oficial: work.cover || '',
    sinopse: `${work.context}\n\nÉpoca: ${work.period}.\n\nAtividade: ${work.activity}`,
    status: 'Pendente',
    avaliacao_numerica: 0,
    progresso_percentual: 0,
    generos: [work.era, 'Clássicos'],
    fonte: `agora:classical:${work.id}`,
    motivo_leitura: work.activity,
  }
}
