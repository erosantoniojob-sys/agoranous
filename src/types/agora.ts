export type MediaType = 'Livro' | 'Filme' | 'Série' | 'Jogo' | 'App' | 'Podcast' | 'Curso';

export type MediaStatus = 'Lendo' | 'Assistindo' | 'Jogando' | 'Concluído' | 'Pendente';

export interface MediaItem {
  id: string;
  titulo: string;
  tipo: MediaType;
  url_capa?: string | null;
  capa_oficial?: string | null;
  url_capa_oficial?: string | null;
  sinopse: string;
  status: MediaStatus;
  avaliacao_numerica: number; // 0 to 5
  autor_criador?: string;
  ano?: number | null;
  data_lancamento_oficial?: string;
  progresso_percentual?: number; // 0 to 100
  generos?: string[];
  fonte?: string;
  criadoEm: string; // ISO date string
}

export interface Aprendizado {
  id: string;
  mediaId: string;
  texto: string;
  data: string; // ISO or formatted date string
  topico?: string;
}

export interface Category {
  id: string;
  label: string;
  tipo: MediaType | string;
  count?: number;
}

export interface CustomTrail {
  id: string;
  nome: string;
  descricao: string;
  mediaIds: string[];
  categoria?: string;
  dataCriacao: string;
  progresso_percentual: number;
}

export interface TrilhaItem {
  id: string;
  titulo?: string;
  descricao?: string;
  progresso_percentual?: number;
  media: MediaItem;
  aprendizados: Aprendizado[];
  dataConclusao: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}

export interface EventoRegressivo {
  id: string;
  titulo: string;
  dataAlvo: string;
}

export interface UserProfile {
  nome: string;
  biografia: string;
  avatar_url: string;
  avatar?: string;
  capa_url: string;
  tags_interesses: string[];
  formatos_preferidos?: MediaType[];
  objetivo_descoberta?: string;
  ritmo_estudo?: string;
  eventos_regressivos: EventoRegressivo[];
  hasCompletedOnboarding?: boolean;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'autor' | 'conceito' | 'obra';
  bordaDourada?: boolean;
  conexoes: string[];
}

export interface Statistics {
  totalItens: number;
  totalAprendizados: number;
  categoriasExploradas: number;
  totalLivros: number;
  totalFilmes: number;
  totalSeries: number;
  totalJogos: number;
  totalApps?: number;
  totalPodcasts?: number;
  totalCursos?: number;
  mediaAvaliacao: number;
}
