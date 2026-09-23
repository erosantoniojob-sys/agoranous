import React, { useState } from 'react'
import { BookOpen, Check, ChevronRight, Film, GraduationCap, Music, Palette, Search, Theater, X } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useModalAccessibility } from '../lib/useModalAccessibility'
import { classicalFormations, classicalWorks, classicalMediaInput, findClassicalMedia, formationCategory, type ClassicalWork, type FormationArea } from '../data/classicalFormations'

const icons = { musica: Music, artes: Palette, teatro: Theater, literatura: BookOpen }
const modules = ['Primeiros encontros', 'Ampliar o repertório', 'Conectar e interpretar']
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')

function WorkDialog({ work, onClose }: { work: ClassicalWork; onClose: () => void }) {
  const { mediaItems, aprendizados, addMedia, addAprendizado } = useAgoraStore()
  const ref = useModalAccessibility<HTMLDivElement>(true, onClose)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const media = findClassicalMedia(work, mediaItems)
  const notes = aprendizados.filter(entry => entry.mediaId === media?.id)
  const Icon = icons[work.area as FormationArea]
  const save = () => {
    if (!note.trim()) return
    const item = media || addMedia(classicalMediaInput(work))
    addAprendizado(item.id, note.trim(), 'Formação clássica')
    setNote(''); setSaved(true)
  }
  return <div className="cinema-modal-backdrop" onClick={onClose}>
    <section ref={ref} className="cinema-modal formation-dialog" role="dialog" aria-modal="true" aria-labelledby="classical-work-title" onClick={event => event.stopPropagation()}>
      <button type="button" className="cinema-close" onClick={onClose} aria-label="Fechar obra"><X size={22} /></button>
      <p className="cinema-eyebrow"><Icon size={18} /> {work.era} · {work.period}</p>
      <h2 id="classical-work-title">{work.title}</h2><p className="cinema-muted">{work.author}</p>
      <p className="cinema-synopsis">{work.context}</p>
      <section className="cinema-study"><h3>Uma proposta de estudo</h3><p>{work.activity}</p></section>
      <a href={work.source || `https://en.wikipedia.org/wiki/${encodeURIComponent(work.wiki)}`} target="_blank" rel="noreferrer">Consultar referência da obra (em inglês) ↗</a>
      {work.area === 'musica' ? <p className="cinema-footnote">Procure o título e o compositor no serviço de áudio de sua preferência. Interpretações e gravações podem variar.</p> : null}
      <label className="formation-note">Minha reflexão<textarea value={note} maxLength={8000} onChange={event => { setNote(event.target.value); setSaved(false) }} placeholder="O que você percebeu? Que pergunta ficou?" rows={4} /></label>
      <button type="button" className="cinema-primary" disabled={!note.trim()} onClick={save}>Salvar reflexão no acervo</button>
      <p role="status" className="cinema-footnote">{saved ? 'Reflexão salva no acervo desta obra.' : 'Registrar uma reflexão não marca a etapa como concluída.'}</p>
      {notes.length ? <section className="formation-notes"><h3>Reflexões anteriores</h3>{notes.map(entry => <p key={entry.id}>{entry.texto}</p>)}</section> : null}
    </section>
  </div>
}

export function ClassicalFormationsView() {
  const { mediaItems, customTrails, addMedia, updateMedia, addCustomTrail, updateCustomTrail, setActiveTab, isVisitor, syncStatus, retryCloudSync } = useAgoraStore()
  const [areaId, setAreaId] = useState<FormationArea>('musica')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<ClassicalWork | null>(null)
  const [notice, setNotice] = useState('')
  const area = classicalFormations.find(value => value.id === areaId)!
  const areaWorks = classicalWorks.filter(work => work.area === areaId)
  const trail = customTrails.find(value => value.categoria === formationCategory(areaId))
  const completed = areaWorks.filter(work => findClassicalMedia(work, mediaItems)?.status === 'Concluído').length
  const missing = areaWorks.some(work => { const item = findClassicalMedia(work, mediaItems); return !item || !trail?.mediaIds.includes(item.id) })
  const Icon = icons[areaId]
  const term = normalize(query.trim())
  const visible = areaWorks.filter(work => {
    const done = findClassicalMedia(work, mediaItems)?.status === 'Concluído'
    return (!term || normalize(`${work.title} ${work.author} ${work.era} ${work.period}`).includes(term)) && (filter === 'all' || (filter === 'done' ? done : !done))
  })
  const start = () => {
    const items = areaWorks.map(work => findClassicalMedia(work, mediaItems) || addMedia(classicalMediaInput(work)))
    const progress = Math.round(items.filter(item => item.status === 'Concluído').length / areaWorks.length * 100)
    const fields = { mediaIds: items.map(item => item.id), progresso_percentual: progress, etapas: modules, objetivo: area.method, projeto_final: area.project, criterio_conclusao: 'Concluir as 12 obras e registrar sua síntese pessoal.' }
    if (trail) updateCustomTrail(trail.id, fields)
    else {
      const created = addCustomTrail(`Formação clássica: ${area.title}`, `${area.subtitle}. ${area.method}`, items.map(item => item.id), formationCategory(areaId))
      updateCustomTrail(created.id, fields)
    }
    setNotice(trail ? 'Etapas restauradas. Suas reflexões e conclusões foram preservadas.' : 'Formação iniciada! As 12 obras foram adicionadas ao seu acervo e o percurso está em Trilhas.')
  }
  const toggle = (work: ClassicalWork) => {
    const item = findClassicalMedia(work, mediaItems) || addMedia(classicalMediaInput(work))
    const done = item.status !== 'Concluído'
    updateMedia(item.id, { status: done ? 'Concluído' : 'Pendente', progresso_percentual: done ? 100 : 0 })
    if (trail) updateCustomTrail(trail.id, { progresso_percentual: Math.round((completed + (done ? 1 : -1)) / areaWorks.length * 100) })
    setNotice(`${work.title}: ${done ? 'etapa concluída' : 'etapa reaberta'}.`)
  }

  return <div className="cinema-page formations-page">
    <header className="formations-hero">
      <p className="cinema-eyebrow"><GraduationCap size={18} /> Formação do repertório</p>
      <h1>Outras artes.<br /><em>Novas formas de ver o mundo.</em></h1>
      <p>Música, imagem, palco e palavra. Quatro percursos para conhecer obras que atravessam gerações — com tempo para escutar, observar e pensar.</p>
      <div className="formations-hero-footer"><span>4 percursos · 48 obras · no seu ritmo</span><button type="button" onClick={() => setActiveTab('cinema')}><Film size={16} /> Explorar também o cinema <ChevronRight size={16} /></button></div>
    </header>
    <p className="formations-intro">Uma curadoria introdutória, não um cânone completo: clássicos históricos e modernos, com presença brasileira e diferentes tradições. Cada percurso tem três etapas de quatro obras. A ordem orienta, mas você pode seguir seu próprio ritmo.</p>
    <div className="formation-areas" role="group" aria-label="Escolha uma formação clássica">
      {classicalFormations.map(value => {
        const AreaIcon = icons[value.id]
        const done = classicalWorks.filter(work => work.area === value.id && findClassicalMedia(work, mediaItems)?.status === 'Concluído').length
        return <button type="button" key={value.id} aria-pressed={areaId === value.id} onClick={() => { setAreaId(value.id); setQuery(''); setFilter('all'); setNotice('') }}><AreaIcon size={28} /><strong>{value.title}</strong><span>{value.subtitle}</span><small>{done}/12 concluídas</small></button>
      })}
    </div>
    <section className="cinema-formation formation-current" aria-labelledby="formation-area-title">
      <div><p className="cinema-eyebrow"><Icon size={16} /> {area.subtitle}</p><h2 id="formation-area-title">Formação em {area.title.toLocaleLowerCase('pt-BR')}</h2><p>{area.method}</p></div>
      <div className="formation-start"><strong>{completed}/12 <span>obras concluídas</span></strong><progress aria-label={`Progresso em ${area.title}`} max={12} value={completed} />{!trail || missing ? <button type="button" className="cinema-primary" onClick={start}>{trail ? 'Restaurar etapas ausentes' : 'Iniciar esta formação'}</button> : <span className="formation-started"><Check size={17} /> Formação adicionada às suas trilhas</span>}</div>
      <p className="cinema-footnote">{isVisitor ? 'Modo visitante: progresso e reflexões são salvos neste navegador.' : syncStatus === 'error' ? 'Falha na sincronização. A cópia deste navegador está preservada.' : syncStatus === 'syncing' ? 'Sincronizando com sua conta…' : 'Progresso e reflexões acompanham a sincronização do seu acervo.'}</p>
      {!isVisitor && syncStatus === 'error' ? <button type="button" onClick={retryCloudSync}>Tentar sincronizar novamente</button> : null}
    </section>
    <div className="cinema-toolbar"><label className="cinema-search"><Search size={18} /><span className="sr-only">Buscar obras ou autores</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Obra, autor ou período…" /></label><label><span className="sr-only">Filtrar etapas</span><select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todas as etapas</option><option value="pending">Ainda não concluídas</option><option value="done">Concluídas</option></select></label></div>
    <p role="status" className="formation-notice">{notice || `${visible.length} obras neste percurso`}</p>
    {modules.map((title, index) => {
      const works = areaWorks.slice(index * 4, index * 4 + 4).filter(work => visible.includes(work))
      return works.length ? <section key={title} className="formation-module" aria-labelledby={`formation-module-${index}`}><div className="formation-module-heading"><span>0{index + 1}</span><h2 id={`formation-module-${index}`}>{title}</h2></div><div className="formation-works">{works.map(work => {
        const done = findClassicalMedia(work, mediaItems)?.status === 'Concluído'
        return <article key={work.id} className={`formation-work ${done ? 'is-complete' : ''}`}>
          <div className="formation-work-top"><span>{work.id.split('-')[1]} / 12</span><Icon size={25} /><span>{work.period}</span></div>
          <p className="cinema-eyebrow">{work.era}</p><h3>{work.title}</h3><p className="formation-author">{work.author}</p><p>{work.context}</p>
          <div className="formation-work-actions"><button type="button" onClick={() => setSelected(work)} aria-label={`Estudar ${work.title}`}>{area.verb} e refletir <ChevronRight size={15} /></button><button type="button" aria-pressed={done} aria-label={`${done ? 'Reabrir' : 'Concluir'} ${work.title}`} onClick={() => toggle(work)}><Check size={15} /> {done ? 'Concluída' : 'Concluir etapa'}</button></div>
        </article>
      })}</div></section> : null
    })}
    {!visible.length ? <div className="cinema-empty"><Search size={28} /><h2>Nenhuma obra encontrada</h2><button type="button" onClick={() => { setQuery(''); setFilter('all') }}>Limpar filtros</button></div> : null}
    <section className="formation-project"><p className="cinema-eyebrow">Ao final do percurso</p><h2>Transforme repertório em criação</h2><p>{area.project}</p><p className="cinema-footnote">Use as reflexões salvas para construir sua síntese. A barra de progresso conta as obras concluídas; o projeto final é uma proposta livre.</p><button className="cinema-secondary" type="button" onClick={() => setActiveTab('poiesis')}>Abrir meu espaço de escrita</button></section>
    <details className="formations-sources"><summary>Referências e critérios da curadoria</summary><p>As fichas trazem referências individuais para contextualização. As datas indicam composição, publicação, estreia ou um período aproximado, conforme a obra. Os links não garantem acesso gratuito a gravações, traduções ou montagens. Esta seleção não inclui pornografia; algumas obras abordam sexualidade, violência ou nudez artística.</p><p>Recursos de estudo: <a href="https://www.carnegiehall.org/Education/Programs/All-Together-A-Global-Ode-to-Joy" target="_blank" rel="noreferrer">Carnegie Hall: Beethoven</a> · <a href="https://www.metmuseum.org/art/collection/search/45434" target="_blank" rel="noreferrer">The Met: Hokusai</a>.</p></details>
    {selected ? <WorkDialog key={selected.id} work={selected} onClose={() => setSelected(null)} /> : null}
  </div>
}
