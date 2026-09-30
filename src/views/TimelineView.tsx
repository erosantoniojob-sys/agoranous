import React, { useMemo, useState } from 'react'
import { ArrowUpRight, BookOpen, Download, PenLine, Plus, Search } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { escapeHtml } from '../lib/escapeHtml'

export const TimelineView: React.FC = () => {
  const { mediaItems, aprendizados, addAprendizado, setSelectedMedia, setIsSearchOpen, userProfile } = useAgoraStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [mediaId, setMediaId] = useState('')
  const [topic, setTopic] = useState('')
  const [text, setText] = useState('')
  const [notice, setNotice] = useState('')
  const selectedMedia = mediaItems.find(item => item.id === mediaId) || mediaItems[0]
  const mediaById = useMemo(() => new Map(mediaItems.map(item => [item.id, item])), [mediaItems])
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  const notes = aprendizados.filter(note => (!filter || note.mediaId === filter) && normalize(`${note.texto} ${note.topico || ''} ${mediaById.get(note.mediaId)?.titulo || ''}`).includes(normalize(query.trim())))

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!text.trim() || !selectedMedia) return
    addAprendizado(selectedMedia.id, text.trim(), topic.trim() || 'Minha impressão')
    setText(''); setTopic(''); setNotice('Nota salva. Você pode reencontrá-la neste caderno.')
  }
  const exportNotes = () => {
    const target = window.open('', '_blank')
    if (!target) { setNotice('O navegador bloqueou a janela de impressão. Permita pop-ups para exportar.'); return }
    const content = notes.map(note => {
      const media = mediaById.get(note.mediaId)
      return `<article><p class="meta">${escapeHtml(media?.titulo || 'Obra não disponível')} · ${escapeHtml(note.data)}</p><h2>${escapeHtml(note.topico || 'Minha impressão')}</h2><p class="note">${escapeHtml(note.texto)}</p>${media?.autor_criador ? `<p class="meta">${escapeHtml(media.autor_criador)}${media.ano ? ` · ${escapeHtml(media.ano)}` : ''}</p>` : ''}</article>`
    }).join('')
    target.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Notas — Ágora</title><style>@page{size:A4;margin:22mm}body{font:12pt/1.6 Georgia,serif;color:#222;max-width:760px;margin:32px auto;padding:20px}h1{font-size:28pt}h2{font-size:16pt}article{border-top:1px solid #ccc;padding:20px 0;break-inside:avoid}.meta{font:10pt/1.6 sans-serif;color:#666}.note{white-space:pre-wrap;overflow-wrap:anywhere}button{padding:12px 18px;cursor:pointer}@media print{button{display:none}body{margin:0;padding:0}}</style></head><body><button onclick="window.print()">Imprimir / salvar como PDF</button><h1>Meu caderno de notas</h1><p class="meta">${escapeHtml(userProfile.nome || 'Ágora')} · ${notes.length} notas · ${escapeHtml(new Date().toLocaleDateString('pt-BR'))}</p>${content}</body></html>`)
    target.document.close()
    setNotice('Caderno aberto em uma nova aba. Use “Imprimir / salvar como PDF”.')
  }

  return <div className="notes-page">
    <header className="session-heading"><div><p className="session-eyebrow">O QUE VALE GUARDAR</p><h1>Seu caderno de notas.</h1><p>Impressões, passagens e ideias das obras que fazem parte da sua vida.</p></div><button type="button" className="session-secondary" disabled={!notes.length} onClick={exportNotes}><Download size={17} /> Exportar notas</button></header>
    <div className="notes-layout">
      <section className="notes-editor" aria-labelledby="new-note-title"><p className="session-eyebrow"><PenLine size={15} /> UMA IDEIA DE CADA VEZ</p><h2 id="new-note-title">O que ficou com você?</h2>
        {!mediaItems.length ? <div className="notes-empty"><BookOpen size={25} /><p>Adicione uma obra para começar seu caderno.</p><button type="button" className="session-primary" onClick={() => setIsSearchOpen(true)}><Plus size={16} /> Adicionar obra</button></div> : <form onSubmit={save}>
          <label htmlFor="note-work">Sobre qual obra?</label><select id="note-work" value={selectedMedia?.id || ''} onChange={event => setMediaId(event.target.value)}>{mediaItems.map(item => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select>
          <label htmlFor="note-title">Título <span>opcional</span></label><input id="note-title" value={topic} onChange={event => setTopic(event.target.value)} maxLength={160} placeholder="Uma cena que me marcou" />
          <label htmlFor="note-content">Sua nota</label><textarea id="note-content" rows={7} value={text} onChange={event => setText(event.target.value)} maxLength={10000} placeholder="Escreva do seu jeito. Uma frase já é um começo." required />
          <button className="session-primary" disabled={!text.trim()}><PenLine size={16} /> Salvar nota</button>
        </form>}
        <p role="status" className="notes-notice">{notice}</p>
      </section>
      <section className="notes-collection" aria-labelledby="saved-notes-title"><div className="session-section-title"><h2 id="saved-notes-title">Notas guardadas <span>{notes.length}</span></h2></div>
        <div className="notes-filters"><label className="notes-search"><Search size={17} /><span className="sr-only">Buscar notas</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar uma ideia ou obra…" /></label><label className="sr-only" htmlFor="notes-filter">Filtrar notas por obra</label><select id="notes-filter" value={filter} onChange={event => setFilter(event.target.value)}><option value="">Todas as obras</option>{mediaItems.map(item => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></div>
        {filter || query ? <p className="notes-filter-hint">A exportação inclui as {notes.length} notas deste filtro. <button type="button" onClick={() => { setFilter(''); setQuery('') }}>Limpar filtros</button></p> : null}
        {!notes.length ? <div className="session-empty"><BookOpen size={24} /><p>{aprendizados.length ? 'Nenhuma nota corresponde à busca.' : 'Suas ideias têm lugar aqui.'}</p><span>{aprendizados.length ? 'Experimente outra palavra ou limpe os filtros.' : 'Quando algo chamar sua atenção, registre. Suas notas aparecerão aqui, ligadas a cada obra.'}</span></div> : <div className="notes-list">{notes.map(note => {
          const media = mediaById.get(note.mediaId)
          return <article key={note.id} className="notes-card"><div className="notes-card__meta"><span>{media?.tipo || 'Nota'}</span><span>{note.data}</span></div><h3>{note.topico || 'Minha impressão'}</h3><p>{note.texto}</p>{media ? <button type="button" className="notes-work-link" onClick={() => setSelectedMedia(media)}><BookOpen size={15} /><span>{media.titulo}</span><ArrowUpRight size={15} /></button> : <small>Obra não disponível no acervo</small>}</article>
        })}</div>}
      </section>
    </div>
  </div>
}
