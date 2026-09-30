import React, { useMemo, useState } from 'react'
import { Check, ExternalLink, Plus, Search } from 'lucide-react'
import { classicBooks, classicBookInput, classicBookKey, classicBookSearch, normalizeBookText, type ClassicBook } from '../data/classicBooks'
import { useAgoraStore } from '../store/useAgoraStore'
import { CoverImage } from './CoverImage'

const PAGE_SIZE = 24
const categories = ['Literatura', 'Filosofia', 'Literatura cristã']
const themes = [...new Set(classicBooks.flatMap(book => book.themes).filter(theme => !categories.includes(theme)))].sort((a, b) => a.localeCompare(b, 'pt-BR'))

export function ClassicBooksCatalog() {
  const { mediaItems, addMedia, setSelectedMedia } = useAgoraStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [theme, setTheme] = useState('')
  const [language, setLanguage] = useState('')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')
  const term = normalizeBookText(query)
  const filtered = useMemo(() => classicBooks.filter(book =>
    (!category || book.category === category) && (!theme || book.themes.includes(theme)) &&
    (!language || book.language === language) && (!term || classicBookSearch.get(book.id)?.includes(term)),
  ), [term, category, theme, language])
  const savedBooks = useMemo(() => {
    const map = new Map<string, (typeof mediaItems)[number]>()
    for (const item of mediaItems) {
      if (item.tipo !== 'Livro') continue
      if (item.fonte) map.set(item.fonte, item)
      map.set(classicBookKey(item.titulo, item.autor_criador || ''), item)
    }
    return map
  }, [mediaItems])
  const existing = (book: ClassicBook) => savedBooks.get(`agora:classic:${book.id}`) || savedBooks.get(classicBookKey(book.title, book.author)) || savedBooks.get(classicBookKey(book.title, ''))
  const add = (book: ClassicBook) => {
    const saved = existing(book)
    if (saved) { setSelectedMedia(saved); return }
    addMedia(classicBookInput(book))
    setNotice(`${book.title} adicionado à sua biblioteca.`)
  }
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return <section aria-labelledby="classic-books-title" className="classic-books-catalog">
    <header>
      <p className="session-eyebrow">BIBLIOTECA DE CLÁSSICOS</p>
      <h2 id="classic-books-title">1.000 livros para ampliar seu mundo.</h2>
      <p>650 obras literárias · 200 de filosofia · 150 de literatura cristã. Explore autores, tradições e ideias; guarde suas escolhas na biblioteca.</p>
    </header>
    <div className="classic-books-filters">
      <label className="cinema-search"><Search size={18} /><span className="sr-only">Buscar nos 1.000 livros</span><input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="Título, autor ou assunto…" /></label>
      <label><span className="sr-only">Área dos livros</span><select value={category} onChange={event => { setCategory(event.target.value); setPage(1) }}><option value="">Todas as áreas</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label><span className="sr-only">Tema dos livros</span><select value={theme} onChange={event => { setTheme(event.target.value); setPage(1) }}><option value="">Todos os temas</option>{themes.map(value => <option key={value}>{value}</option>)}</select></label>
      <label><span className="sr-only">Idioma da edição</span><select value={language} onChange={event => { setLanguage(event.target.value); setPage(1) }}><option value="">Todos os idiomas</option><option value="pt">Português</option><option value="en">Inglês</option></select></label>
    </div>
    <p role="status" className="catalog-notice">{`${filtered.length} obras encontradas · página ${page} de ${pages}`}{notice ? ` · ${notice}` : ''}</p>
    <div className="catalog-grid">{visible.map(book => <article key={book.id} className="catalog-card">
      <CoverImage url={book.cover} title={book.title} tipo="Livro" />
      <div><small>{book.category} · {book.language === 'pt' ? 'Português' : 'Inglês'}</small><h3>{book.title}</h3><p>{book.author}</p><p>{book.themes.slice(1).join(' · ')}</p>
        <button type="button" onClick={() => add(book)} aria-label={`${existing(book) ? 'Abrir' : 'Adicionar'} ${book.title}`}>{existing(book) ? <Check size={15} /> : <Plus size={15} />}{existing(book) ? 'Na biblioteca · abrir' : 'Quero conhecer'}</button>
        <a href={book.sourceUrl} target="_blank" rel="noreferrer">Edição e referência <ExternalLink size={12} /></a>
      </div>
    </article>)}</div>
    {!visible.length ? <div className="session-empty"><p>Nenhum livro corresponde aos filtros.</p><button type="button" onClick={() => { setQuery(''); setCategory(''); setTheme(''); setLanguage(''); setPage(1); setNotice('') }}>Limpar filtros</button></div> : null}
    <nav className="classic-books-pagination" aria-label="Páginas da coleção de livros">
      <button type="button" disabled={page === 1} onClick={() => { setPage(value => value - 1); setNotice('') }}>Anterior</button>
      <span>Página {page} de {pages} · {filtered.length} livros</span>
      <button type="button" disabled={page >= pages} onClick={() => { setPage(value => value + 1); setNotice('') }}>Próxima</button>
    </nav>
    <details className="formations-sources"><summary>Sobre a seleção e as capas</summary><p>Seleção editorial de obras de autores clássicos, organizada por áreas e assuntos; não é um ranking universal. A fonte é o catálogo bibliográfico do Project Gutenberg. A disponibilidade dessa coleção favorece obras antigas e edições em inglês; há também obras em português.</p><p>Os títulos seguem a edição consultada. As capas pertencem às edições digitais, podendo ser tipográficas; não representam necessariamente a primeira edição. A data de digitalização não é apresentada como data de publicação da obra.</p><a href="https://www.gutenberg.org/ebooks/offline_catalogs.html" target="_blank" rel="noreferrer">Fonte e metodologia do catálogo ↗</a></details>
  </section>
}
