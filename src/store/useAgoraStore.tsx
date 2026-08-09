import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  MediaItem,
  Aprendizado,
  TrilhaItem,
  CustomTrail,
  Category,
  Statistics,
  MediaType,
  MediaStatus,
  ChatMessage,
  UserProfile,
  KnowledgeNode,
  DeletedMediaItem,
} from '../types/agora';
import { supabase, useAuth } from '../context/AuthContext';
import { readBrowserValue, writeBrowserValue } from '../lib/browserStorage';
import type { ViewName } from '../lib/viewPreload';

export interface Recommendation {
  id: string;
  titulo: string;
  tipo: MediaType;
  autor_criador: string;
  ano: number;
  data_lancamento_oficial?: string;
  sinopse: string;
  generos: string[];
  url_capa: string;
  url_capa_oficial?: string;
  fonte: string;
  motivoRecomendacao: string;
}

export type LearningEnrichmentState = {
  status: 'idle' | 'analyzing' | 'done' | 'error';
  added: number;
  analyzedWorks: number;
  totalWorks: number;
  outcome?: 'added' | 'already_complete' | 'no_media';
  source?: string;
  error?: string;
};

const EMPTY_LEARNING_ENRICHMENT: LearningEnrichmentState = {
  status: 'idle',
  added: 0,
  analyzedWorks: 0,
  totalWorks: 0,
};

const EMPTY_PROFILE: UserProfile = {
  nome: '',
  biografia: '',
  avatar_url: '',
  capa_url: '',
  tags_interesses: [],
  formatos_preferidos: [],
  objetivo_descoberta: '',
  ritmo_estudo: '',
  eventos_regressivos: [],
};

function hasExistingUserData(data: { media?: unknown; learnings?: unknown; trails?: unknown; profile?: Partial<UserProfile> }) {
  if (Array.isArray(data.media) && data.media.length > 0) return true
  if (Array.isArray(data.learnings) && data.learnings.length > 0) return true
  if (Array.isArray(data.trails) && data.trails.length > 0) return true

  const profile = data.profile
  return Boolean(
    profile?.nome?.trim()
    || profile?.biografia?.trim()
    || profile?.avatar_url?.trim()
    || profile?.capa_url?.trim()
    || profile?.tags_interesses?.length
    || profile?.eventos_regressivos?.length,
  )
}

function isLegacyDefaultProfile(profile?: Partial<UserProfile>) {
  return profile?.nome === 'Visitante' && profile.biografia?.includes('Banda Pioneiros')
}

function readStoredArray<T>(key: string): T[] {
  const parsed = readBrowserValue<unknown>(key, [])
  return Array.isArray(parsed) ? parsed as T[] : []
}

function readStoredObject<T>(key: string): T | null {
  return readBrowserValue<T | null>(key, null)
}

// Chaves usadas pelas versões anteriores à sincronização por conta. Mantemos a
// leitura como migração: até a versão 1.6.6.1 os dados autenticados usavam o
// prefixo sem o id da conta. Sem isso, uma atualização faria o acervo parecer
// vazio mesmo que ele ainda estivesse salvo no navegador.
const LEGACY_MEDIA_STORAGE_KEY = 'agora_media_items_v3'
const LEGACY_ACCOUNT_STORAGE_PREFIX = 'agora_user_v5_'

function firstNonEmptyArray<T>(...values: T[][]): T[] {
  return values.find((value) => value.length > 0) || []
}

const SEED_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    titulo: 'Os Irmãos Karamázov',
    tipo: 'Livro',
    url_capa: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Um épico monumental sobre a fé, a dúvida e a dinâmica familiar. Examina as forças opostas entre Dmitri (paixão), Ivan (intelectualismo niilista) e Aliócha (amor ativo).',
    status: 'Concluído',
    avaliacao_numerica: 5.0,
    autor_criador: 'Fiódor Dostoiévski',
    ano: 1880,
    data_lancamento_oficial: '1880-11-01',
    progresso_percentual: 100,
    generos: ['Romance Filosófico', 'Literatura Clássica'],
    fonte: 'Edição Crítica Oficial',
    criadoEm: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm2',
    titulo: 'A República',
    tipo: 'Livro',
    url_capa: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Diálogo clássico fundacional de Sócrates e Platão investigando a justiça, a cidade ideal e a célebre Alegoria da Caverna.',
    status: 'Lendo',
    avaliacao_numerica: 4.9,
    autor_criador: 'Platão & Sócrates',
    ano: -375,
    data_lancamento_oficial: '0375-01-01 a.C.',
    progresso_percentual: 68,
    generos: ['Filosofia', 'Clássico Grego'],
    fonte: 'Acervo Filosófico',
    criadoEm: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm3',
    titulo: 'EA Sports FC 24 (FIFA)',
    tipo: 'Jogo',
    url_capa: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Simulador esportivo mundial com motor de física HyperMotionV, táticas avançadas de jogo e maestria espacial no campo.',
    status: 'Jogando',
    avaliacao_numerica: 4.8,
    autor_criador: 'EA Vancouver / EA Sports',
    ano: 2023,
    data_lancamento_oficial: '2023-09-29',
    progresso_percentual: 56,
    generos: ['Esporte', 'Simulação Competitiva'],
    fonte: 'Base Oficial de Jogos',
    criadoEm: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm4',
    titulo: 'Compêndio de Cosmovisão Teológica',
    tipo: 'Curso',
    url_capa: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Estudo das 6 Funções Fundamentais da Cosmovisão: Ontológica, Epistemológica, Antropológica, Axiológica/Ética, Teleológica e Escatológica/Histórica.',
    status: 'Lendo',
    avaliacao_numerica: 5.0,
    autor_criador: 'Teologia Sistemática & Filosofia',
    ano: 2024,
    data_lancamento_oficial: '2024-01-15',
    progresso_percentual: 85,
    generos: ['Teologia', 'Cosmovisão'],
    fonte: 'Estudos de Filosofia Cristã',
    criadoEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm5',
    titulo: 'Ética a Nicômaco',
    tipo: 'Livro',
    url_capa: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Obra central de Aristóteles sobre virtude, felicidade e o bom viver.',
    status: 'Lendo',
    avaliacao_numerica: 4.7,
    autor_criador: 'Aristóteles',
    ano: -340,
    data_lancamento_oficial: '0340-01-01 a.C.',
    progresso_percentual: 55,
    generos: ['Filosofia', 'Clássico Grego'],
    fonte: 'Acervo de Filosofia Clássica',
    criadoEm: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm6',
    titulo: 'Confissões',
    tipo: 'Livro',
    url_capa: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Autobiografia espiritual de Agostinho, com foco em memória, graça e conversão.',
    status: 'Concluído',
    avaliacao_numerica: 5.0,
    autor_criador: 'Santo Agostinho',
    ano: 397,
    data_lancamento_oficial: '0397-01-01',
    progresso_percentual: 100,
    generos: ['Espiritualidade', 'Teologia'],
    fonte: 'Tradição Cristã',
    criadoEm: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm7',
    titulo: 'A Cidade de Deus',
    tipo: 'Livro',
    url_capa: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Grande obra de Agostinho sobre a cidade terrena e a cidade celestial.',
    status: 'Lendo',
    avaliacao_numerica: 4.8,
    autor_criador: 'Santo Agostinho',
    ano: 426,
    data_lancamento_oficial: '0426-01-01',
    progresso_percentual: 40,
    generos: ['Espiritualidade', 'Filosofia Cristã'],
    fonte: 'Patrística',
    criadoEm: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm8',
    titulo: 'O Peregrino',
    tipo: 'Livro',
    url_capa: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Clássico devocional da tradição puritana sobre o caminho espiritual.',
    status: 'Lendo',
    avaliacao_numerica: 4.6,
    autor_criador: 'John Bunyan',
    ano: 1678,
    data_lancamento_oficial: '1678-01-01',
    progresso_percentual: 30,
    generos: ['Devocional', 'Teologia Puritana'],
    fonte: 'Clássicos Cristãos',
    criadoEm: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm9',
    titulo: 'Dom Quixote',
    tipo: 'Livro',
    url_capa: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    capa_oficial: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    url_capa_oficial: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    sinopse: 'Romance clássico sobre idealismo, leitura e o desejo de viver em grandeza.',
    status: 'Concluído',
    avaliacao_numerica: 4.9,
    autor_criador: 'Miguel de Cervantes',
    ano: 1605,
    data_lancamento_oficial: '1605-01-01',
    progresso_percentual: 100,
    generos: ['Literatura Clássica', 'Romance'],
    fonte: 'Biblioteca Clássica',
    criadoEm: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_LEARNINGS: Aprendizado[] = [
  {
    id: 'a1',
    mediaId: 'm1',
    texto: 'A dinâmica de personagens em Karamázov expõe o conflito moral: Dmitri encarna a paixão trágica, Ivan o niilismo e Aliócha o amor ativo. A responsabilidade moral precede a liberdade.',
    data: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    topico: 'Dinâmica de Personagens & Ética',
  },
  {
    id: 'a2',
    mediaId: 'm2',
    texto: 'Na Alegoria da Caverna de Platão, a libertação das correntes da opinião pública (doxa) é o primeiro passo para contemplar o Bem inteligível.',
    data: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    topico: 'Epistemologia e Alegoria',
  },
  {
    id: 'a3',
    mediaId: 'm4',
    texto: 'A Cosmovisão correta abrange estritamente 6 funções essenciais: Ontológica, Epistemológica, Antropológica, Axiológica, Teleológica e Escatológica. Qualquer modelo de 4 funções é incompleto.',
    data: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    topico: 'Estrutura de Cosmovisão',
  },
];

const SEED_CHAT: ChatMessage[] = [
  {
    id: 'c1',
    sender: 'mentor',
    text: 'Saudações. Sou o Mentor Oráculo da Ágora. Como posso auxiliar seus estudos e sínteses de conhecimento hoje?',
    timestamp: '14:30',
  },
];

const VISITOR_CHAT: ChatMessage[] = [
  {
    id: 'c_v1',
    sender: 'mentor',
    text: 'Seja bem-vindo à Ágora. Seu segundo cérebro está totalmente limpo para que você cadastre suas próprias mídias e sínteses ABNT.',
    timestamp: '12:00',
  },
];

const SEED_CUSTOM_TRAILS: CustomTrail[] = [
  {
    id: 'tr1',
    nome: 'Filosofia Grega & Cosmovisão',
    descricao: 'Trilha integrada conectando Dostoiévski, Platão e a Teologia Sistemática em 6 Funções.',
    mediaIds: ['m1', 'm2', 'm4'],
    categoria: 'Filosofia',
    dataCriacao: '2026-02-10',
    progresso_percentual: 78,
  },
];

const KNOWLEDGE_NODES: KnowledgeNode[] = [
  { id: 'k1', label: 'Fiódor Dostoiévski', type: 'autor', bordaDourada: true, conexoes: ['k2', 'k3'] },
  { id: 'k2', label: 'Os Irmãos Karamázov', type: 'obra', bordaDourada: true, conexoes: ['k1', 'k3'] },
  { id: 'k3', label: 'Amor Ativo vs. Niilismo', type: 'conceito', bordaDourada: false, conexoes: ['k1', 'k2'] },
  { id: 'k4', label: 'Platão & Sócrates', type: 'autor', bordaDourada: true, conexoes: ['k5', 'k6'] },
  { id: 'k5', label: 'A República', type: 'obra', bordaDourada: true, conexoes: ['k4', 'k6'] },
  { id: 'k6', label: 'Alegoria da Caverna', type: 'conceito', bordaDourada: false, conexoes: ['k4', 'k5'] },
  { id: 'k7', label: 'Cosmovisão (6 Funções)', type: 'conceito', bordaDourada: true, conexoes: ['k3', 'k6'] },
];

interface AgoraStoreContextType {
  mediaItems: MediaItem[];
  aprendizados: Aprendizado[];
  chatMessages: ChatMessage[];
  userProfile: UserProfile;
  customTrails: CustomTrail[];
  customCategories: Category[];
  knowledgeNodes: KnowledgeNode[];
  activeTab: ViewName;
  setActiveTab: (tab: ViewName) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedMedia: MediaItem | null;
  setSelectedMedia: (item: MediaItem | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isLeftDrawerOpen: boolean;
  setIsLeftDrawerOpen: (open: boolean) => void;
  isRightChatOpen: boolean;
  setIsRightChatOpen: (open: boolean) => void;
  addMedia: (item: Omit<MediaItem, 'id' | 'criadoEm'>) => MediaItem;
  updateMedia: (id: string, updatedData: Partial<MediaItem>) => void;
  updateMediaStatusAndRating: (id: string, status: MediaStatus, avaliacao: number, progresso?: number) => void;
  addAprendizado: (mediaId: string, texto: string, topico?: string) => Aprendizado;
  addCustomTrail: (nome: string, descricao: string, mediaIds: string[], categoria?: string) => CustomTrail;
  updateCustomTrail: (id: string, updatedData: Partial<CustomTrail>) => void;
  deleteCustomTrail: (id: string) => void;
  addCategory: (label: string, tipo?: string) => void;
  sendChatMessage: (text: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  getEstatisticas: () => Statistics;
  getTrilha: () => TrilhaItem[];
  fetchInteligente: (query: string, tipo: MediaType) => Promise<Omit<MediaItem, 'id' | 'criadoEm' | 'status' | 'avaliacao_numerica'>>;
  fetchRecommendations: () => Promise<Recommendation[]>;
  deleteMediaItem: (id: string) => void;
  deletedMediaItems: DeletedMediaItem[];
  restoreMediaItem: (id: string) => void;
  isVisitor: boolean;
  isDataReady: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (profileData?: Partial<UserProfile>) => void;
  resetOnboarding: () => void;
  syncStatus: 'local' | 'syncing' | 'synced' | 'error';
  learningEnrichment: LearningEnrichmentState;
  enrichExistingWorks: () => Promise<number>;
}

const AgoraStoreContext = createContext<AgoraStoreContextType | undefined>(undefined);

export const AgoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const isVisitor = Boolean(user && (user.id === 'guest_user' || user.id.startsWith('guest_')));
  // O cache local é apenas um fallback. Cada conta precisa de uma chave própria
  // para que dados de usuários diferentes nunca sejam reaproveitados no mesmo navegador.
  const storagePrefix = isVisitor
    ? 'agora_guest_v5_'
    : `agora_user_v5_${user?.id || 'anonymous'}_`;
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const isCloudHydrated = Boolean(user?.id && hydratedUserId === user.id);
  const isDataReady = !user || hydratedUserId === user.id;

  // Os dados do visitante também pertencem ao navegador atual. Eles não são
  // enviados à nuvem, mas precisam sobreviver a recargas e reabertura do app.

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => readStoredArray(storagePrefix + 'media'));

  const [aprendizados, setAprendizados] = useState<Aprendizado[]>(() => readStoredArray(storagePrefix + 'learnings'));

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const stored = readStoredArray<ChatMessage>(storagePrefix + 'chat')
    return stored.length ? stored : isVisitor ? VISITOR_CHAT : SEED_CHAT
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => readStoredObject<UserProfile>(storagePrefix + 'profile') || EMPTY_PROFILE);

  const [customTrails, setCustomTrails] = useState<CustomTrail[]>(() => readStoredArray(storagePrefix + 'trails'));
  const [deletedMediaItems, setDeletedMediaItems] = useState<DeletedMediaItem[]>(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return readStoredArray<DeletedMediaItem>(storagePrefix + 'media_trash').filter(item => new Date(item.deletedAt).getTime() > cutoff)
  });

  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => readStoredObject<boolean>(storagePrefix + 'has_completed_onboarding') ?? false);

  // BUSCA DA NUVEM AO LOGAR (Re-sync inteligente usando API da Vercel)
  useEffect(() => {
    const keyPrefix = storagePrefix;
    let cancelled = false;

    async function loadCloudData() {
      setHydratedUserId(null);
      if (!isVisitor && user?.id) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error('Sessão não encontrada.');

          const res = await fetch('/api/getUserData', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const cloudData = await res.json();
            if (cancelled) return;

            const localMedia = readStoredArray<MediaItem>(keyPrefix + 'media');
            const legacyAccountMedia = readStoredArray<MediaItem>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'media');
            const legacyMedia = readStoredArray<MediaItem>(LEGACY_MEDIA_STORAGE_KEY);
            const cloudMedia = Array.isArray(cloudData.media) ? cloudData.media as MediaItem[] : [];
            // Uma resposta vazia nunca pode apagar uma cópia existente. A ordem
            // também cobre o prefixo v5 anterior, que ainda não tinha user.id.
            const recoveredMedia = firstNonEmptyArray(cloudMedia, localMedia, legacyAccountMedia, legacyMedia);

            const localLearnings = readStoredArray<Aprendizado>(keyPrefix + 'learnings');
            const legacyAccountLearnings = readStoredArray<Aprendizado>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'learnings');
            const cloudLearnings = Array.isArray(cloudData.learnings) ? cloudData.learnings as Aprendizado[] : [];

            const localTrails = readStoredArray<CustomTrail>(keyPrefix + 'trails');
            const legacyAccountTrails = readStoredArray<CustomTrail>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'trails');
            const cloudTrails = Array.isArray(cloudData.trails) ? cloudData.trails as CustomTrail[] : [];

            const localChat = readStoredArray<ChatMessage>(keyPrefix + 'chat');
            const legacyAccountChat = readStoredArray<ChatMessage>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'chat');
            const cloudChat = Array.isArray(cloudData.chat) ? cloudData.chat as ChatMessage[] : [];

            const localProfile = readStoredObject<UserProfile>(keyPrefix + 'profile');
            const legacyAccountProfile = readStoredObject<UserProfile>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'profile');
            const cloudProfile = cloudData.profile && typeof cloudData.profile === 'object'
              ? cloudData.profile as UserProfile
              : null;
            const recoveredProfile = hasExistingUserData({ profile: cloudProfile || undefined })
              ? cloudProfile!
              : hasExistingUserData({ profile: localProfile || undefined })
                ? localProfile!
                : hasExistingUserData({ profile: legacyAccountProfile || undefined })
                  ? legacyAccountProfile!
                  : EMPTY_PROFILE;

            setMediaItems(recoveredMedia);
            setAprendizados(firstNonEmptyArray(cloudLearnings, localLearnings, legacyAccountLearnings));
            setUserProfile(recoveredProfile);
            setCustomTrails(firstNonEmptyArray(cloudTrails, localTrails, legacyAccountTrails));
            setChatMessages(firstNonEmptyArray(cloudChat, localChat, legacyAccountChat, SEED_CHAT));
            setDeletedMediaItems(readStoredArray<DeletedMediaItem>(keyPrefix + 'media_trash'))
            setHasCompletedOnboarding(Boolean(
              Boolean(cloudData.onboarding)
                || hasExistingUserData({ media: recoveredMedia, learnings: firstNonEmptyArray(cloudLearnings, localLearnings, legacyAccountLearnings), trails: firstNonEmptyArray(cloudTrails, localTrails, legacyAccountTrails), profile: recoveredProfile })
                || isLegacyDefaultProfile(recoveredProfile),
            ));
            setHydratedUserId(user.id);
            return; 
          }
          throw new Error(`Falha ao buscar dados sincronizados (${res.status}).`);
        } catch (error) {
          console.error("Erro ao buscar da nuvem. Usando cache local.", error);
        }
      }

      // Fallback local se for visitante ou falha de rede
      if (cancelled) return;
      const localMedia = readStoredArray<MediaItem>(keyPrefix + 'media');
      const legacyAccountMedia = !isVisitor ? readStoredArray<MediaItem>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'media') : [];
      const legacyMedia = !isVisitor ? readStoredArray<MediaItem>(LEGACY_MEDIA_STORAGE_KEY) : [];
      const recoveredMedia = firstNonEmptyArray(localMedia, legacyAccountMedia, legacyMedia);
      setMediaItems(recoveredMedia);

      const localLearnings = readStoredArray<Aprendizado>(keyPrefix + 'learnings');
      const legacyAccountLearnings = !isVisitor ? readStoredArray<Aprendizado>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'learnings') : [];
      const recoveredLearnings = firstNonEmptyArray(localLearnings, legacyAccountLearnings);
      setAprendizados(recoveredLearnings);

      const localChat = readStoredArray<ChatMessage>(keyPrefix + 'chat');
      const legacyAccountChat = !isVisitor ? readStoredArray<ChatMessage>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'chat') : [];
      setChatMessages(firstNonEmptyArray(localChat, legacyAccountChat, isVisitor ? VISITOR_CHAT : SEED_CHAT));

      const localProfile = isVisitor ? EMPTY_PROFILE : readStoredObject<UserProfile>(keyPrefix + 'profile') || EMPTY_PROFILE;
      const legacyAccountProfile = !isVisitor ? readStoredObject<UserProfile>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'profile') : null;
      const recoveredProfile = hasExistingUserData({ profile: localProfile })
        ? localProfile
        : hasExistingUserData({ profile: legacyAccountProfile || undefined })
          ? legacyAccountProfile!
          : EMPTY_PROFILE;
      setUserProfile(recoveredProfile);

      const localTrails = readStoredArray<CustomTrail>(keyPrefix + 'trails');
      const legacyAccountTrails = !isVisitor ? readStoredArray<CustomTrail>(LEGACY_ACCOUNT_STORAGE_PREFIX + 'trails') : [];
      const recoveredTrails = firstNonEmptyArray(localTrails, legacyAccountTrails);
      setCustomTrails(recoveredTrails);
      setDeletedMediaItems(readStoredArray<DeletedMediaItem>(keyPrefix + 'media_trash'))

      const storedOnboarding = readStoredObject<boolean>(keyPrefix + 'has_completed_onboarding');
      setHasCompletedOnboarding(Boolean(
        storedOnboarding
          || (storedOnboarding === null && hasExistingUserData({ media: recoveredMedia, learnings: recoveredLearnings, trails: recoveredTrails, profile: recoveredProfile }))
          || isLegacyDefaultProfile(recoveredProfile),
      ));
      setHydratedUserId(user?.id || null);
    }

    loadCloudData();
    return () => { cancelled = true; };
  }, [isVisitor, storagePrefix, user?.id]);

  const [activeTab, setActiveTab] = useState<ViewName>('inicio');
  const [selectedFilter, setSelectedFilter] = useState<string>('Todos');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isRightChatOpen, setIsRightChatOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'local' | 'syncing' | 'synced' | 'error'>(isVisitor ? 'local' : 'synced');
  const [learningEnrichment, setLearningEnrichment] = useState<LearningEnrichmentState>(EMPTY_LEARNING_ENRICHMENT);
  const [serverLearningRevision, setServerLearningRevision] = useState(0)
  const pendingSyncs = useRef(0)
  const handledServerLearningRevision = useRef(0)
  const activeEnrichmentUserId = useRef<string | null>(user?.id || null)
  const enrichmentRequest = useRef<{ userId: string; controller: AbortController } | null>(null)

  useEffect(() => {
    activeEnrichmentUserId.current = user?.id || null
    const activeRequest = enrichmentRequest.current
    if (activeRequest && activeRequest.userId !== user?.id) {
      activeRequest.controller.abort()
      enrichmentRequest.current = null
    }
    setLearningEnrichment(EMPTY_LEARNING_ENRICHMENT)

    return () => {
      const requestToCancel = enrichmentRequest.current
      if (requestToCancel && requestToCancel.userId === user?.id) {
        requestToCancel.controller.abort()
        enrichmentRequest.current = null
      }
    }
  }, [user?.id])

  // FUNÇÃO UTILITÁRIA PARA SALVAR NA NUVEM (Usando API da Vercel)
  const syncToCloud = useCallback(async (collection: string, data: unknown) => {
    if (!isVisitor && user?.id && isCloudHydrated) {
      pendingSyncs.current += 1
      setSyncStatus('syncing')
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Sessão não encontrada.');

        const response = await fetch('/api/syncUserData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            collection,
            data
          })
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || `Falha ao sincronizar (${response.status}).`);
        }
        pendingSyncs.current -= 1
        if (pendingSyncs.current === 0) setSyncStatus('synced')
      } catch (err) {
        pendingSyncs.current = Math.max(0, pendingSyncs.current - 1)
        setSyncStatus('error')
        console.error(`Erro ao sincronizar ${collection}:`, err);
      }
    } else if (isVisitor) {
      setSyncStatus('local')
    }
  }, [isCloudHydrated, isVisitor, user?.id]);

  const enrichExistingWorks = useCallback(async () => {
    if (isVisitor || !user?.id || !isCloudHydrated) return 0
    if (enrichmentRequest.current) return 0

    const expectedUserId = user.id
    const controller = new AbortController()
    enrichmentRequest.current = { userId: expectedUserId, controller }
    const isCurrentAccount = () => (
      !controller.signal.aborted
      && activeEnrichmentUserId.current === expectedUserId
    )

    setLearningEnrichment((current) => ({ ...current, status: 'analyzing', error: undefined }))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token || session.user.id !== expectedUserId) {
        throw new Error('A sessão ativa mudou. Abra novamente o Guia nesta conta.')
      }

      const response = await fetch('/api/generateLearnings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      })
      const data = await response.json().catch(() => ({})) as {
        error?: string;
        outcome?: unknown;
        additions?: unknown;
        added?: number;
        analyzedWorks?: number;
        totalWorks?: number;
        source?: string;
      }
      if (!response.ok) throw new Error(data.error || `Falha ao analisar o acervo (${response.status}).`)
      if (!isCurrentAccount()) return 0

      if (!['added', 'already_complete', 'no_media'].includes(String(data.outcome))) {
        throw new Error('A análise retornou um resultado inesperado.')
      }
      if (!Array.isArray(data.additions)) throw new Error('A análise retornou um formato inesperado.')
      const additions = data.additions.filter((item): item is Aprendizado => Boolean(
        item
        && typeof item === 'object'
        && typeof item.id === 'string'
        && typeof item.mediaId === 'string'
        && typeof item.texto === 'string'
        && typeof item.data === 'string',
      ))
      if (additions.length !== data.additions.length) {
        throw new Error('Uma das lições retornadas é inválida.')
      }

      if (additions.length) {
        setAprendizados((current) => {
          const currentIds = new Set(current.map((item) => item.id))
          const uniqueAdditions = additions.filter((item) => !currentIds.has(item.id))
          return uniqueAdditions.length ? [...uniqueAdditions, ...current] : current
        })
        // A Function já persistiu essas inclusões com controle de concorrência.
        // A revisão evita que o efeito abaixo envie logo depois um snapshot antigo.
        setServerLearningRevision((current) => current + 1)
      }

      const added = additions.length
      const analyzedWorks = Number.isFinite(data.analyzedWorks)
        ? Number(data.analyzedWorks)
        : new Set(additions.map((item) => item.mediaId)).size
      const totalWorks = Number.isFinite(data.totalWorks) ? Number(data.totalWorks) : 0
      setLearningEnrichment({
        status: 'done',
        outcome: data.outcome as LearningEnrichmentState['outcome'],
        added,
        analyzedWorks,
        totalWorks,
        source: typeof data.source === 'string' ? data.source : undefined,
      })
      return added
    } catch (error) {
      if (controller.signal.aborted || !isCurrentAccount()) return 0
      const message = error instanceof Error ? error.message : 'Não foi possível analisar o acervo.'
      setLearningEnrichment((current) => ({ ...current, status: 'error', error: message }))
      return 0
    } finally {
      if (enrichmentRequest.current?.controller === controller) enrichmentRequest.current = null
    }
  }, [isCloudHydrated, isVisitor, user?.id])

  // EFEITOS DE PERSISTÊNCIA
  useEffect(() => {
    if (!isDataReady) return;
    writeBrowserValue(storagePrefix + 'media', mediaItems);
    syncToCloud('media', mediaItems);
  }, [mediaItems, storagePrefix, syncToCloud, isDataReady]);

  useEffect(() => {
    if (!isDataReady) return;
    writeBrowserValue(storagePrefix + 'learnings', aprendizados);
    if (serverLearningRevision !== handledServerLearningRevision.current) {
      handledServerLearningRevision.current = serverLearningRevision
      return
    }
    syncToCloud('learnings', aprendizados);
  }, [aprendizados, serverLearningRevision, storagePrefix, syncToCloud, isDataReady]);

  useEffect(() => {
    if (!isDataReady) return;
    writeBrowserValue(storagePrefix + 'chat', chatMessages);
    syncToCloud('chat', chatMessages);
  }, [chatMessages, storagePrefix, syncToCloud, isDataReady]);

  useEffect(() => {
    if (isDataReady && !isVisitor) {
      writeBrowserValue(storagePrefix + 'profile', userProfile);
      syncToCloud('profile', userProfile);
    }
  }, [userProfile, storagePrefix, isVisitor, syncToCloud, isDataReady]);

  useEffect(() => {
    if (!isDataReady) return;
    writeBrowserValue(storagePrefix + 'trails', customTrails);
    syncToCloud('trails', customTrails);
  }, [customTrails, storagePrefix, syncToCloud, isDataReady]);

  useEffect(() => {
    if (!isDataReady) return;
    writeBrowserValue(storagePrefix + 'has_completed_onboarding', hasCompletedOnboarding);
    syncToCloud('onboarding', hasCompletedOnboarding);
  }, [hasCompletedOnboarding, storagePrefix, syncToCloud, isDataReady]);

  useEffect(() => {
    if (!isDataReady) return
    writeBrowserValue(storagePrefix + 'media_trash', deletedMediaItems)
  }, [deletedMediaItems, isDataReady, storagePrefix])

  const completeOnboarding = useCallback((profileData?: Partial<UserProfile>) => {
    if (profileData) {
      setUserProfile((prev) => {
        const updated = { ...prev, ...profileData };
        if (profileData.avatar_url) {
          updated.avatar = profileData.avatar_url;
        }
        return updated;
      });
    }
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasCompletedOnboarding(false);
  }, []);

  const addMedia = useCallback((item: Omit<MediaItem, 'id' | 'criadoEm'>): MediaItem => {
    const normalizedTitle = item.titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '')
    const duplicate = mediaItems.find(existing => existing.titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '') === normalizedTitle)
    if (duplicate) return duplicate
    const newMediaItem: MediaItem = {
      ...item,
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: new Date().toISOString(),
      progresso_percentual: item.progresso_percentual ?? (item.status === 'Concluído' ? 100 : 35),
      capa_oficial: item.capa_oficial || item.url_capa_oficial || item.url_capa,
      url_capa_oficial: item.url_capa_oficial || item.capa_oficial || item.url_capa,
      data_lancamento_oficial: item.data_lancamento_oficial || (item.ano ? `${item.ano}-01-01` : '2024-01-01'),
    };
    setMediaItems((prev) => [newMediaItem, ...prev]);
    return newMediaItem;
  }, [mediaItems]);

  const updateMediaStatusAndRating = useCallback(
    (id: string, status: MediaStatus, avaliacao: number, progresso?: number) => {
      setMediaItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const newProg = progresso ?? (status === 'Concluído' ? 100 : item.progresso_percentual || 45);
          return { ...item, status, avaliacao_numerica: Math.max(0, Math.min(5, avaliacao)), progresso_percentual: newProg };
        })
      );
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia((prev) =>
          prev
            ? {
                ...prev,
                status,
                avaliacao_numerica: Math.max(0, Math.min(5, avaliacao)),
                progresso_percentual: progresso ?? (status === 'Concluído' ? 100 : prev.progresso_percentual || 45),
              }
            : null
        );
      }
    },
    [selectedMedia]
  );

  const addAprendizado = useCallback((mediaId: string, texto: string, topico?: string): Aprendizado => {
    const newAprendizado: Aprendizado = {
      id: `apr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      mediaId,
      texto: texto.trim(),
      topico: topico || 'Reflexão Pessoal',
      data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setAprendizados((prev) => [newAprendizado, ...prev]);
    return newAprendizado;
  }, []);

  const addCustomTrail = useCallback(
    (nome: string, descricao: string, mediaIds: string[], categoria?: string): CustomTrail => {
      const newTrail: CustomTrail = {
        id: `trail_${Date.now()}`,
        nome,
        descricao,
        mediaIds,
        categoria: categoria || 'Geral',
        dataCriacao: new Date().toISOString().slice(0, 10),
        progresso_percentual: mediaIds.length > 0 ? 50 : 0,
      };
      setCustomTrails((prev) => [newTrail, ...prev]);
      return newTrail;
    },
    []
  );

  const updateCustomTrail = useCallback(
    (id: string, updatedData: Partial<CustomTrail>) => {
      setCustomTrails((prev) =>
        prev.map((trail) => (trail.id === id ? { ...trail, ...updatedData } : trail))
      );
    },
    []
  );

  const deleteCustomTrail = useCallback((id: string) => {
    setCustomTrails((prev) => prev.filter((trail) => trail.id !== id));
  }, []);

  const addCategory = useCallback((label: string, tipo?: string) => {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      label,
      tipo: tipo || label,
      count: 0,
    };
    setCustomCategories((prev) => [...prev, newCat]);
  }, []);

  const deleteMediaItem = useCallback(
    (id: string) => {
      const media = mediaItems.find(item => item.id === id)
      if (media) setDeletedMediaItems(prev => [{ id: `deleted_${Date.now()}`, media, aprendizados: aprendizados.filter(item => item.mediaId === id), deletedAt: new Date().toISOString() }, ...prev])
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
      setAprendizados((prev) => prev.filter((a) => a.mediaId !== id));
      if (selectedMedia?.id === id) setSelectedMedia(null);
    },
    [aprendizados, mediaItems, selectedMedia]
  );

  const restoreMediaItem = useCallback((id: string) => {
    const deleted = deletedMediaItems.find(item => item.id === id)
    if (!deleted) return
    setMediaItems(prev => [deleted.media, ...prev.filter(item => item.id !== deleted.media.id)])
    setAprendizados(prev => [...deleted.aprendizados, ...prev.filter(item => item.mediaId !== deleted.media.id)])
    setDeletedMediaItems(prev => prev.filter(item => item.id !== id))
  }, [deletedMediaItems])

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, userMsg]);

      try {
        let replyText = '';
        
        try {
          const res = await fetch('/api/chatMentor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [...chatMessages, userMsg] }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.reply) {
              replyText = data.reply;
            }
          }
        } catch {
          // fallback
        }

        if (!replyText) {
          replyText = `Resposta do Oráculo Ágora para "${text}":\n\nSua biblioteca foi consultada. Para citações e bibliografia regulamentar, utilize o padrão ABNT NBR 6023.\n\nREFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT):\nÁGORA. *Manual do Segundo Cérebro*. Curadoria de ${userProfile.nome || 'Convidado'}. Rio de Janeiro: Edição Acadêmica, 2026.`;
        }

        const botMsg: ChatMessage = {
          id: `msg_b_${Date.now()}`,
          sender: 'mentor',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };

        setChatMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error('Error asking mentor chatbot', err);
      }
    },
    [chatMessages, userProfile.nome]
  );

  const updateMedia = useCallback(
    (id: string, updatedData: Partial<MediaItem>) => {
      setMediaItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const cover = updatedData.url_capa || updatedData.url_capa_oficial || updatedData.capa_oficial || item.url_capa;
          const updated: MediaItem = {
            ...item,
            ...updatedData,
            url_capa: cover,
            capa_oficial: cover,
            url_capa_oficial: cover,
          };
          return updated;
        })
      );
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia((prev) => {
          if (!prev) return null;
          const cover = updatedData.url_capa || updatedData.url_capa_oficial || updatedData.capa_oficial || prev.url_capa;
          return {
            ...prev,
            ...updatedData,
            url_capa: cover,
            capa_oficial: cover,
            url_capa_oficial: cover,
          };
        });
      }
    },
    [selectedMedia]
  );

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  }, []);

  const updateUserProfile = updateProfile;

  // Curadoria baseada no perfil e no acervo, com um repertório confiável como reserva.
  const fetchRecommendations = useCallback(async (): Promise<Recommendation[]> => {
    const interesses = [
      ...(userProfile.tags_interesses || []),
      userProfile.objetivo_descoberta || '',
      userProfile.ritmo_estudo || '',
      ...mediaItems.flatMap((item) => item.generos || []),
    ]
    const tags = [...new Set(interesses.map((tag) => tag.trim()).filter(Boolean))]
    const existingTitles = mediaItems.map((item) => item.titulo)
    // Enviamos somente os sinais que ajudam a curadoria. Obras bem avaliadas e
    // concluídas têm mais peso no servidor; itens pendentes não definem o gosto.
    const tasteSignals = mediaItems.map((item) => ({
      titulo: item.titulo,
      tipo: item.tipo,
      autor_criador: item.autor_criador || '',
      generos: item.generos || [],
      avaliacao_numerica: item.avaliacao_numerica || 0,
      status: item.status,
    }))

    try {
      const response = await fetch('/api/getRecommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, existingTitles, tasteSignals, preferredTypes: userProfile.formatos_preferidos || [] }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && Array.isArray(data.recommendations) && data.recommendations.length) {
        return data.recommendations as Recommendation[]
      }
    } catch (error) {
      console.error('Erro ao buscar a curadoria do perfil:', error)
    }

    const foco = userProfile.objetivo_descoberta || tags[0] || 'literatura clássica'
    const fallbackPool: Recommendation[] = [
      {
        id: `rec_fallback_${Date.now()}`,
        titulo: 'O Morro dos Ventos Uivantes',
        tipo: 'Livro',
        autor_criador: 'Emily Brontë',
        ano: 1847,
        sinopse: 'Um clássico da literatura que examina a paixão, a vingança e as fronteiras da moralidade na propriedade de Wuthering Heights.',
        generos: ['Literatura Clássica', 'Romance'],
        url_capa: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        fonte: 'Recomendação Curada Ágora',
        motivoRecomendacao: `Uma leitura de densidade emocional e moral para seu objetivo: ${foco}.`
      },
      {
        id: `rec_fallback_${Date.now() + 1}`,
        titulo: 'Confissões',
        tipo: 'Livro',
        autor_criador: 'Santo Agostinho',
        ano: 397,
        sinopse: 'Autobiografia espiritual e filosófica que investiga profundamente a natureza de Deus, a queda do homem e a redenção da alma.',
        generos: ['Filosofia Cristã', 'Teologia'],
        url_capa: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
        fonte: 'Recomendação Curada Ágora',
        motivoRecomendacao: `Uma obra de interioridade que conversa com seu percurso em ${foco}.`
      },
      {
        id: `rec_fallback_${Date.now() + 2}`, titulo: 'Stalker', tipo: 'Filme', autor_criador: 'Andrei Tarkóvski', ano: 1979,
        sinopse: 'Uma jornada contemplativa sobre desejo, fé e conhecimento.', generos: ['Cinema', 'Filosofia'], url_capa: '', fonte: 'Curadoria Ágora',
        motivoRecomendacao: `Cinema contemplativo para quem escolheu um ritmo ${userProfile.ritmo_estudo || 'equilibrado'}.`,
      },
      {
        id: `rec_fallback_${Date.now() + 3}`, titulo: 'The Good Place', tipo: 'Série', autor_criador: 'Michael Schur', ano: 2016,
        sinopse: 'Comédia que transforma dilemas éticos em narrativa acessível.', generos: ['Ética', 'Comédia'], url_capa: '', fonte: 'Curadoria Ágora',
        motivoRecomendacao: `Uma forma leve de explorar ética e virtudes dentro do objetivo ${foco}.`,
      },
      {
        id: `rec_fallback_${Date.now() + 4}`, titulo: 'Pentiment', tipo: 'Jogo', autor_criador: 'Obsidian Entertainment', ano: 2022,
        sinopse: 'Mistério histórico construído em manuscritos, escolhas e conflitos de consciência.', generos: ['História', 'Narrativa'], url_capa: '', fonte: 'Curadoria Ágora',
        motivoRecomendacao: `Uma experiência interativa alinhada aos seus interesses em história e grandes narrativas.`,
      },
    ]
    const preferred = userProfile.formatos_preferidos || []
    return (preferred.length ? fallbackPool.filter((item) => preferred.includes(item.tipo)) : fallbackPool).slice(0, 4)
  }, [userProfile.formatos_preferidos, userProfile.objetivo_descoberta, userProfile.ritmo_estudo, userProfile.tags_interesses, mediaItems]);

  const getEstatisticas = useCallback((): Statistics => {
    const totalItens = mediaItems.length;
    const totalAprendizados = aprendizados.length;
    const categoriesSet = new Set(mediaItems.map((i) => i.tipo));

    const totalLivros = mediaItems.filter((i) => i.tipo === 'Livro').length;
    const totalFilmes = mediaItems.filter((i) => i.tipo === 'Filme').length;
    const totalSeries = mediaItems.filter((i) => i.tipo === 'Série').length;
    const totalJogos = mediaItems.filter((i) => i.tipo === 'Jogo').length;
    const totalApps = mediaItems.filter((i) => i.tipo === 'App').length;
    const totalPodcasts = mediaItems.filter((i) => i.tipo === 'Podcast').length;
    const totalCursos = mediaItems.filter((i) => i.tipo === 'Curso').length;

    const rated = mediaItems.filter((i) => i.avaliacao_numerica > 0);
    const sum = rated.reduce((acc, curr) => acc + curr.avaliacao_numerica, 0);
    const mediaAvaliacao = rated.length > 0 ? Number((sum / rated.length).toFixed(1)) : 0;

    return {
      totalItens,
      totalAprendizados,
      categoriasExploradas: categoriesSet.size,
      totalLivros,
      totalFilmes,
      totalSeries,
      totalJogos,
      totalApps,
      totalPodcasts,
      totalCursos,
      mediaAvaliacao,
    };
  }, [mediaItems, aprendizados]);

  const getTrilha = useCallback((): TrilhaItem[] => {
    const activeMedia = mediaItems.filter((item) => item.status === 'Concluído' || item.status === 'Lendo' || item.status === 'Assistindo' || item.status === 'Jogando');
    return activeMedia.map((media) => {
      const mediaLearnings = aprendizados.filter((a) => a.mediaId === media.id);
      return {
        id: `trilha_${media.id}`,
        media,
        aprendizados: mediaLearnings,
        dataConclusao: media.data_lancamento_oficial || new Date(media.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      };
    });
  }, [mediaItems, aprendizados]);

  const fetchInteligente = useCallback(
    async (query: string, tipo: MediaType): Promise<Omit<MediaItem, 'id' | 'criadoEm' | 'status' | 'avaliacao_numerica'>> => {
      try {
        const res = await fetch('/api/searchMedia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, tipo }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Não foi possível pesquisar essa obra.');
        if (data?.titulo) {
          const coverUrl = data.url_capa_oficial || data.url_capa || '';
          return {
            titulo: data.titulo,
            tipo: data.tipo || tipo,
            url_capa: coverUrl,
            capa_oficial: coverUrl,
            url_capa_oficial: coverUrl,
            autor_criador: data.autor_criador || 'Autor ou criador não informado',
            ano: data.ano || new Date().getFullYear(),
            data_lancamento_oficial: data.data_lancamento_oficial || '',
            sinopse: data.sinopse || 'Sinopse não disponível na fonte consultada.',
            generos: data.generos || [tipo],
            fonte: data.fonte || 'Consulta pública',
          };
        }
        throw new Error('A fonte não retornou dados para essa obra.');
      } catch (error) {
        throw error instanceof Error ? error : new Error('Não foi possível pesquisar essa obra.');
      }
    },
    []
  );

  return (
    <AgoraStoreContext.Provider
      value={{
        mediaItems,
        aprendizados,
        chatMessages,
        userProfile,
        customTrails,
        customCategories,
        knowledgeNodes: KNOWLEDGE_NODES,
        activeTab,
        setActiveTab,
        selectedFilter,
        setSelectedFilter,
        selectedMedia,
        setSelectedMedia,
        isSearchOpen,
        setIsSearchOpen,
        isLeftDrawerOpen,
        setIsLeftDrawerOpen,
        isRightChatOpen,
        setIsRightChatOpen,
        addMedia,
        updateMedia,
        updateMediaStatusAndRating,
        addAprendizado,
        addCustomTrail,
        updateCustomTrail,
        deleteCustomTrail,
        addCategory,
        sendChatMessage,
        updateProfile,
        updateUserProfile,
        getEstatisticas,
        getTrilha,
        fetchInteligente,
        fetchRecommendations,
        deleteMediaItem,
        deletedMediaItems,
        restoreMediaItem,
        isVisitor,
        isDataReady,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
        syncStatus,
        learningEnrichment,
        enrichExistingWorks,
      }}
    >
      {children}
    </AgoraStoreContext.Provider>
  );
};

export const useAgoraStore = () => {
  const ctx = useContext(AgoraStoreContext);
  if (!ctx) throw new Error('useAgoraStore deve ser usado dentro de um AgoraProvider');
  return ctx;
};
