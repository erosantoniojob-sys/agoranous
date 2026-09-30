import type { CatalogItem } from '../types/catalog'

export const coursesCatalog: CatalogItem[] = [
  {
    catalogId: 'agora:course:metodo-km-basics', titulo: 'Método KM Basics', tipo: 'Curso',
    autor_criador: 'Kim da Moda · KM Basics',
    sinopse: 'Formação sobre estilo masculino, combinação de roupas e construção de um guarda-roupa pessoal.',
    generos: ['Estilo pessoal'], fonte: 'https://www.kimdamoda.com.br/', sourceUrl: 'https://www.kimdamoda.com.br/',
    progresso_percentual: 0,
  },
  {
    catalogId: 'agora:course:filosofia-do-zero', titulo: 'Filosofia do Zero', tipo: 'Curso',
    autor_criador: 'Guilherme Freire',
    sinopse: 'Estudo de filosofia do nível introdutório ao avançado, com leitura e reflexão sobre a tradição filosófica.',
    generos: ['Filosofia'], fonte: 'https://filosofiadozero.com.br/a-2', sourceUrl: 'https://filosofiadozero.com.br/a-2',
    progresso_percentual: 0,
  },
]
