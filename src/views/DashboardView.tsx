import React, { useState } from 'react'
import { ArrowUpRight, Check, Film, Play, Plus, Shuffle, Sparkles, Bookmark, PenLine } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { CoverImage } from '../components/CoverImage'
import type { MediaItem } from '../types/agora'

export const DashboardView: React.FC = () => {
  const { mediaItems, userProfile, setIsSearchOpen, setSelectedMedia, setActiveTab, updateMediaStatusAndRating, addAprendizado } = useAgoraStore()
  const [filter, setFilter] = useState('Todos')
  const [note, setNote] = useState('')
  const [noteId, setNoteId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [pickedId, setPickedId] = useState('')
  const matches = (item: MediaItem) => filter === 'Todos' || item.tipo === filter
  const watching = mediaItems.filter(item => ['Assistindo', 'Lendo', 'Jogando'].includes(item.status) && matches(item))
  const queue = mediaItems.filter(item => item.status === 'Pendente' && matches(item))
  const featured = watching[0] || queue.find(item => item.id === pickedId) || queue[0]
  const name = userProfile.nome?.trim().split(' ')[0]
  const noteMedia = mediaItems.find(item => item.id === noteId) || featured || mediaItems[0]
  const begin = (item: MediaItem) => {
    updateMediaStatusAndRating(item.id, item.tipo === 'Livro' ? 'Lendo' : item.tipo === 'Jogo' ? 'Jogando' : 'Assistindo', item.avaliacao_numerica, item.progresso_percentual || 0)
    setFeedback(`${item.titulo} está em andamento.`)
  }
  const saveNote = (event: React.FormEvent) => {
    event.preventDefault()
    if (!note.trim() || !noteMedia) return
    addAprendizado(noteMedia.id, note.trim())
    setNote('')
    setFeedback('Impressão salva nas suas notas.')
  }

  return <div className="session-home">
    <div className="session-heading">
      <div><p className="session-eyebrow">SEU TEMPO, BEM VIVIDO</p><h1>O que vamos descobrir hoje{name ? `, ${name}` : ''}?</h1><p>Uma boa história. Uma ideia que fica. Um momento seu.</p></div>
      <button className="session-secondary" onClick={() => setIsSearchOpen(true)}><Plus size={17} /> Adicionar obra</button>
    </div>

    <div className="session-filters" aria-label="Filtrar obras por formato">{['Todos', 'Filme', 'Série', 'Livro', 'Curso', 'Podcast'].map(type => <button key={type} aria-pressed={filter === type} onClick={() => { setFilter(type); setPickedId('') }}>{({ Todos: 'Tudo', Filme: 'Filmes', Série: 'Séries', Livro: 'Livros', Curso: 'Cursos', Podcast: 'Podcasts' } as Record<string, string>)[type]}</button>)}</div>

    <section className="session-feature" aria-labelledby="session-title">
      <div className="session-feature__art" aria-hidden="true"><div className="session-orbit" /><span>Á</span><p>ARS LONGA · VITA BREVIS</p></div>
      <div className="session-feature__copy">
        <p className="session-eyebrow"><span className="session-live" /> {watching.length ? 'CONTINUE A SUA HISTÓRIA' : featured ? 'NA SUA LISTA' : 'SUA PRÓXIMA DESCOBERTA'}</p>
        <h2 id="session-title">{featured?.titulo || 'Dê espaço para uma boa história.'}</h2>
        <p>{featured ? [featured.tipo, featured.autor_criador, featured.ano].filter(Boolean).join(' · ') : 'Guarde o que quer assistir ou ler. Quando voltar, sua próxima escolha estará aqui.'}</p>
        {featured?.sinopse ? <p className="session-synopsis">{featured.sinopse}</p> : null}
        {featured && watching.length ? <div className="session-progress"><progress aria-label={`Progresso de ${featured.titulo}`} max={100} value={featured.progresso_percentual || 0} /><span>{featured.progresso_detalhado ? `${featured.progresso_detalhado.atual} ${featured.progresso_detalhado.unidade}` : `${featured.progresso_percentual || 0}% registrado`}</span></div> : null}
        <div className="session-actions"><button className="session-primary" onClick={() => featured ? watching.length ? setSelectedMedia(featured) : begin(featured) : setIsSearchOpen(true)}><Play size={16} />{featured ? watching.length ? 'Retomar obra' : 'Começar agora' : 'Escolher minha primeira obra'}</button><button className="session-text-button" onClick={() => setActiveTab('cinema')}>Descobrir filmes <ArrowUpRight size={16} /></button></div>
        <small className="session-feature__hint">Seu ponto de encontro antes e depois de assistir.</small>
      </div>
    </section>

    <div className="session-columns"><div>
      <section className="session-section" aria-labelledby="watching-title"><div className="session-section-title"><h2 id="watching-title">Em andamento <span>{watching.length}</span></h2><span>Um passo de cada vez</span></div>
        {watching.length ? <div className="session-current-list">{watching.map(item => <article className="session-current" key={item.id}><button className="session-current__open" onClick={() => setSelectedMedia(item)}><CoverImage url={item.url_capa || item.capa_oficial} title={item.titulo} tipo={item.tipo} /><span><small>{item.tipo}</small><strong>{item.titulo}</strong><span>{item.progresso_detalhado ? `${item.progresso_detalhado.atual} ${item.progresso_detalhado.unidade}` : `${item.progresso_percentual || 0}% concluído`}</span></span><ArrowUpRight size={17} /></button><button className="session-finish" aria-label={`Concluir ${item.titulo}`} onClick={() => { updateMediaStatusAndRating(item.id, 'Concluído', item.avaliacao_numerica, 100); setFeedback(`${item.titulo} concluído. Que tal guardar uma impressão?`); setNoteId(item.id) }}><Check size={15} /> Concluir</button></article>)}</div> : <div className="session-empty"><Play size={22} /><p>Nenhuma obra em andamento.</p><span>Comece uma obra da sua lista e encontre-a aqui na próxima visita.</span></div>}
      </section>
      <section className="session-section" aria-labelledby="queue-title"><div className="session-section-title"><h2 id="queue-title">Para depois <span>{queue.length}</span></h2><button className="session-text-button" disabled={!queue.length} onClick={() => { const item = queue[Math.floor(Math.random() * queue.length)]; if (item) { setPickedId(item.id); setSelectedMedia(item) } }}><Shuffle size={15} /> Escolha por mim</button></div>
        {queue.length ? <div className="session-shelf">{queue.map(item => <button key={item.id} onClick={() => setSelectedMedia(item)}><CoverImage url={item.url_capa || item.capa_oficial} title={item.titulo} tipo={item.tipo} /><strong>{item.titulo}</strong><small>{item.tipo}</small></button>)}</div> : <button className="session-add-empty" onClick={() => setIsSearchOpen(true)}><Plus size={22} /><span>Viu algo interessante?<small>Guarde aqui para não esquecer.</small></span><ArrowUpRight size={18} /></button>}
      </section>
    </div><aside className="session-aside">
      <section className="session-note"><p className="session-eyebrow"><PenLine size={15} /> DEPOIS DOS CRÉDITOS</p><h2>O que ficou com você?</h2><p>Uma frase, uma sensação ou uma ideia. Não precisa ser uma resenha.</p><form onSubmit={saveNote}><label htmlFor="session-note-work">Sobre qual obra?</label><select id="session-note-work" value={noteMedia?.id || ''} disabled={!mediaItems.length} onChange={event => setNoteId(event.target.value)}>{!mediaItems.length ? <option value="">Adicione uma obra primeiro</option> : mediaItems.map(item => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select><label className="sr-only" htmlFor="session-note-text">Sua impressão</label><textarea id="session-note-text" placeholder="Ainda estou pensando naquela cena…" value={note} onChange={event => setNote(event.target.value)} rows={5} maxLength={10000} /><button className="session-primary" disabled={!note.trim() || !noteMedia}><Bookmark size={15} /> Guardar impressão</button></form><button className="session-text-button" onClick={() => setActiveTab('memoria')}>Revisitar minhas notas <ArrowUpRight size={14} /></button></section>
      <button className="session-discovery" onClick={() => setActiveTab('cinema')}><Film size={25} /><span><small>FORA DO ÓBVIO</small><strong>Seu próximo filme favorito pode estar aqui.</strong><em>Explorar a seleção <ArrowUpRight size={15} /></em></span><Sparkles size={18} /></button>
    </aside></div>
    <p className="session-feedback" role="status">{feedback}</p>
  </div>
}
