import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
} from '../types/agora';
import { supabase, useAuth } from '../context/AuthContext';

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

const MOCK_MAIN_PROFILE: UserProfile = {
  nome: 'Visitante',
  biografia: 'Tradutor e músico (Banda Pioneiros)',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  capa_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop',
  tags_interesses: [
    'Perfumaria Árabe/Turca',
    'Dieta de Hipertrofia (Aveia, Batata Doce, Whey)',
    'Literatura Russa',
    'Filosofia Grega & Existencial',
    'Teologia & Cosmovisão',
    'Música Clássica',
  ],
  eventos_regressivos: [
    { id: 'ev1', titulo: 'RDNE CUP (Maio/Junho)', dataAlvo: '2026-05-25' },
    { id: 'ev2', titulo: 'Grande Dia: 28 de Novembro', dataAlvo: '2026-11-28' },
  ],
};

const VISITOR_PROFILE: UserProfile = {
  nome: '',
  biografia: '',
  avatar_url: '',
  capa_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
  tags_interesses: [],
  eventos_regressivos: [],
};

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
  activeTab: 'inicio' | 'explorar' | 'memoria' | 'trilhas' | 'perfil' | 'schole' | 'rotina';
  setActiveTab: (tab: 'inicio' | 'explorar' | 'memoria' | 'trilhas' | 'perfil' | 'schole' | 'rotina') => void;
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
  isVisitor: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (profileData?: Partial<UserProfile>) => void;
  resetOnboarding: () => void;
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

  // LIMPEZA RÍGOROSA PARA CONVIDADOS
  useEffect(() => {
    if (isVisitor) {
      localStorage.removeItem(storagePrefix + 'profile');
      localStorage.removeItem(storagePrefix + 'media');
      localStorage.removeItem(storagePrefix + 'learnings');
      localStorage.removeItem(storagePrefix + 'trails');
      localStorage.removeItem(storagePrefix + 'chat');
    }
  }, [isVisitor, storagePrefix]);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    try {
      const stored = localStorage.getItem(storagePrefix + 'media');
      if (stored) return JSON.parse(stored);
      return [];
    } catch { return []; }
  });

  const [aprendizados, setAprendizados] = useState<Aprendizado[]>(() => {
    try {
      const stored = localStorage.getItem(storagePrefix + 'learnings');
      if (stored) return JSON.parse(stored);
      return [];
    } catch { return []; }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(storagePrefix + 'chat');
      if (stored) return JSON.parse(stored);
      return isVisitor ? VISITOR_CHAT : SEED_CHAT;
    } catch {
      return isVisitor ? VISITOR_CHAT : SEED_CHAT;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(storagePrefix + 'profile');
      if (stored) return JSON.parse(stored);
      return isVisitor ? VISITOR_PROFILE : MOCK_MAIN_PROFILE;
    } catch {
      return isVisitor ? VISITOR_PROFILE : MOCK_MAIN_PROFILE;
    }
  });

  const [customTrails, setCustomTrails] = useState<CustomTrail[]>(() => {
    try {
      const stored = localStorage.getItem(storagePrefix + 'trails');
      if (stored) return JSON.parse(stored);
      return [];
    } catch { return []; }
  });

  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(storagePrefix + 'has_completed_onboarding');
      if (stored !== null) return JSON.parse(stored);
      return false;
    } catch { return false; }
  });

  // BUSCA DA NUVEM AO LOGAR (Re-sync inteligente usando API da Vercel)
  useEffect(() => {
    const keyPrefix = storagePrefix;

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

            // Uma conta criada antes da sincronização pode não ter nenhuma
            // coleção na nuvem ainda. Nesse caso, preservamos o cache local
            // para enviá-lo depois, em vez de substituí-lo por valores vazios.
            if (Object.keys(cloudData).length === 0) {
              throw new Error('Nenhum dado sincronizado encontrado ainda.');
            }

            const hasCloudValue = (collection: string) => Object.hasOwn(cloudData, collection);
            setMediaItems(hasCloudValue('media') ? cloudData.media : []);
            setAprendizados(hasCloudValue('learnings') ? cloudData.learnings : []);
            setUserProfile(hasCloudValue('profile') ? cloudData.profile : MOCK_MAIN_PROFILE);
            setCustomTrails(hasCloudValue('trails') ? cloudData.trails : []);
            setChatMessages(hasCloudValue('chat') ? cloudData.chat : SEED_CHAT);
            setHasCompletedOnboarding(hasCloudValue('onboarding') ? Boolean(cloudData.onboarding) : false);
            setHydratedUserId(user.id);
            return; 
          }
          throw new Error(`Falha ao buscar dados sincronizados (${res.status}).`);
        } catch (error) {
          console.error("Erro ao buscar da nuvem. Usando cache local.", error);
        }
      }

      // Fallback local se for visitante ou falha de rede
      const hasCurrentUserCache = ['media', 'learnings', 'chat', 'profile', 'trails', 'has_completed_onboarding']
        .some((key) => localStorage.getItem(keyPrefix + key) !== null);
      const fallbackPrefix = !isVisitor && !hasCurrentUserCache ? 'agora_user_v5_' : keyPrefix;
      const storedMedia = localStorage.getItem(fallbackPrefix + 'media');
      setMediaItems(storedMedia ? JSON.parse(storedMedia) : []);

      const storedLearnings = localStorage.getItem(fallbackPrefix + 'learnings');
      setAprendizados(storedLearnings ? JSON.parse(storedLearnings) : []);

      const storedChat = localStorage.getItem(fallbackPrefix + 'chat');
      setChatMessages(storedChat ? JSON.parse(storedChat) : isVisitor ? VISITOR_CHAT : SEED_CHAT);

      const storedProfile = isVisitor ? null : localStorage.getItem(fallbackPrefix + 'profile');
      setUserProfile(storedProfile ? JSON.parse(storedProfile) : isVisitor ? VISITOR_PROFILE : MOCK_MAIN_PROFILE);

      const storedTrails = localStorage.getItem(fallbackPrefix + 'trails');
      setCustomTrails(storedTrails ? JSON.parse(storedTrails) : []);

      const storedOnboarding = localStorage.getItem(fallbackPrefix + 'has_completed_onboarding');
      setHasCompletedOnboarding(storedOnboarding !== null ? JSON.parse(storedOnboarding) : false);
      setHydratedUserId(user?.id || null);
    }

    loadCloudData();
  }, [isVisitor, storagePrefix, user?.id]);

  const [activeTab, setActiveTab] = useState<'inicio' | 'explorar' | 'memoria' | 'trilhas' | 'perfil' | 'schole' | 'rotina'>('inicio');
  const [selectedFilter, setSelectedFilter] = useState<string>('Todos');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isRightChatOpen, setIsRightChatOpen] = useState<boolean>(false);

  // FUNÇÃO UTILITÁRIA PARA SALVAR NA NUVEM (Usando API da Vercel)
  const syncToCloud = useCallback(async (collection: string, data: any) => {
    if (!isVisitor && user?.id && isCloudHydrated) {
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
      } catch (err) {
        console.error(`Erro ao sincronizar ${collection}:`, err);
      }
    }
  }, [isCloudHydrated, isVisitor, user?.id]);

  // EFEITOS DE PERSISTÊNCIA
  useEffect(() => {
    localStorage.setItem(storagePrefix + 'media', JSON.stringify(mediaItems));
    syncToCloud('media', mediaItems);
  }, [mediaItems, storagePrefix, syncToCloud]);

  useEffect(() => {
    localStorage.setItem(storagePrefix + 'learnings', JSON.stringify(aprendizados));
    syncToCloud('learnings', aprendizados);
  }, [aprendizados, storagePrefix, syncToCloud]);

  useEffect(() => {
    localStorage.setItem(storagePrefix + 'chat', JSON.stringify(chatMessages));
    syncToCloud('chat', chatMessages);
  }, [chatMessages, storagePrefix, syncToCloud]);

  useEffect(() => {
    if (!isVisitor) {
      localStorage.setItem(storagePrefix + 'profile', JSON.stringify(userProfile));
      syncToCloud('profile', userProfile);
    }
  }, [userProfile, storagePrefix, isVisitor, syncToCloud]);

  useEffect(() => {
    localStorage.setItem(storagePrefix + 'trails', JSON.stringify(customTrails));
    syncToCloud('trails', customTrails);
  }, [customTrails, storagePrefix, syncToCloud]);

  useEffect(() => {
    localStorage.setItem(storagePrefix + 'has_completed_onboarding', JSON.stringify(hasCompletedOnboarding));
    syncToCloud('onboarding', hasCompletedOnboarding);
  }, [hasCompletedOnboarding, storagePrefix, syncToCloud]);

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
  }, []);

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
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
      setAprendizados((prev) => prev.filter((a) => a.mediaId !== id));
      if (selectedMedia?.id === id) setSelectedMedia(null);
    },
    [selectedMedia]
  );

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

  // NOVA FUNÇÃO INTELIGENTE DE RECOMENDAÇÕES
  const fetchRecommendations = useCallback(async (): Promise<Recommendation[]> => {
    const interesses = userProfile.tags_interesses && userProfile.tags_interesses.length > 0 
      ? userProfile.tags_interesses 
      : ['Filosofia', 'Ficção Clássica']; 

    const termosBusca = interesses.sort(() => 0.5 - Math.random()).slice(0, 2);
    const recomendacoesDinamicas: Recommendation[] = [];

    try {
      for (const termo of termosBusca) {
        const queryLimpa = termo.split(' ')[0].toLowerCase();
        
        const res = await fetch(`https://openlibrary.org/search.json?q=${queryLimpa}&limit=2&language=por`);
        if (res.ok) {
          const data = await res.json();
          
          if (data.docs && data.docs.length > 0) {
            data.docs.forEach((doc: any) => {
              const jaTem = mediaItems.some(m => m.titulo.toLowerCase() === doc.title?.toLowerCase());
              
              if (!jaTem && doc.title) {
                const coverUrl = doc.cover_i 
                  ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                  : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop'; 

                recomendacoesDinamicas.push({
                  id: `rec_dinamico_${doc.key || Date.now()}_${Math.random()}`,
                  titulo: doc.title,
                  tipo: 'Livro',
                  autor_criador: doc.author_name ? doc.author_name.join(', ') : 'Autor Desconhecido',
                  ano: doc.first_publish_year || new Date().getFullYear(),
                  sinopse: `Obra recomendada com base no seu interesse em: ${termo}. (Dados via OpenLibrary).`,
                  generos: [termo, 'Recomendação Dinâmica'],
                  url_capa: coverUrl,
                  url_capa_oficial: coverUrl,
                  fonte: 'OpenLibrary API',
                  motivoRecomendacao: `Selecionado pelo Algoritmo Ágora por sua afinidade com ${termo}.`
                });
              }
            });
          }
        }
      }

      if (recomendacoesDinamicas.length > 0) {
        return recomendacoesDinamicas.slice(0, 3);
      }

    } catch (error) {
      console.error("Erro ao buscar recomendações na internet:", error);
    }

    // Fallback Inteligente baseado em literatura clássica e filosofia reformada
    return [
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
        motivoRecomendacao: 'Selecionado em função do seu foco recorrente em literatura clássica.'
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
        motivoRecomendacao: 'Uma leitura fundamental que dialoga com seu aprofundamento em teologia e na tradição filosófica.'
      }
    ];
  }, [userProfile.tags_interesses, mediaItems]);

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
        if (res.ok) {
          const data = await res.json();
          if (data?.titulo) {
            const coverUrl = data.url_capa_oficial || data.url_capa || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop';
            return {
              titulo: data.titulo,
              tipo: data.tipo || tipo,
              url_capa: coverUrl,
              capa_oficial: coverUrl,
              url_capa_oficial: coverUrl,
              autor_criador: data.autor_criador || 'Criador Oficial',
              ano: data.ano || new Date().getFullYear(),
              data_lancamento_oficial: data.data_lancamento_oficial || `${data.ano || new Date().getFullYear()}-01-01`,
              sinopse: data.sinopse || 'Detalhes oficiais da obra.',
              generos: data.generos || [tipo],
              fonte: data.fonte || 'Vercel Serverless API',
            };
          }
        }
      } catch {
        // try next
      }

      await new Promise((r) => setTimeout(r, 600));
      return {
        titulo: query.charAt(0).toUpperCase() + query.slice(1),
        tipo,
        url_capa: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
        capa_oficial: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
        url_capa_oficial: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
        autor_criador: 'Autor / Desenvolvedor Oficial',
        ano: new Date().getFullYear(),
        data_lancamento_oficial: `${new Date().getFullYear()}-05-10`,
        sinopse: `Obra "${query}" catalogada oficialmente na Ágora com data de lançamento e capa oficial.`,
        generos: [tipo, 'Acervo Ágora'],
        fonte: 'Oráculo Ágora',
      };
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
        isVisitor,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
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
