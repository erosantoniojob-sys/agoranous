import { useState } from 'react'
import { Check, ExternalLink, GraduationCap, Plus } from 'lucide-react'
import { coursesCatalog } from '../data/courses'
import { useAgoraStore } from '../store/useAgoraStore'
import { normalizeCategoryText } from '../lib/knowledgeRealms'
import type { CatalogItem } from '../types/catalog'

export function CoursesView() {
  const { mediaItems, addMedia, setSelectedMedia } = useAgoraStore()
  const [notice, setNotice] = useState('')
  const existing = (course: CatalogItem) => mediaItems.find(item => item.tipo === 'Curso' && normalizeCategoryText(item.titulo) === normalizeCategoryText(course.titulo))
  const save = (course: CatalogItem) => {
    const saved = existing(course)
    if (saved) { setSelectedMedia(saved); return }
    const { catalogId, sourceUrl, ...media } = course
    addMedia({ ...media, status: 'Pendente', avaliacao_numerica: 0, progresso_percentual: 0 })
    setNotice(`${course.titulo} adicionado à sua biblioteca.`)
  }
  return <div className="catalog-page">
    <header><p className="session-eyebrow">SEU PERCURSO DE ESTUDOS</p><h1>Cursos</h1><p>Escolha um curso para acompanhar seus estudos e registrar aprendizados.</p></header>
    <p role="status" className="catalog-notice">{notice}</p>
    <div className="courses-grid">{coursesCatalog.map(course => <article key={course.catalogId} className="course-card">
      <GraduationCap size={32} aria-hidden="true" /><h2>{course.titulo}</h2><p className="course-author">{course.autor_criador}</p><p>{course.sinopse}</p>
      <a className="session-text-button" href={course.sourceUrl} target="_blank" rel="noreferrer">Página oficial <ExternalLink size={14} /></a>
      <button className="session-primary" onClick={() => save(course)}>{existing(course) ? <Check size={16} /> : <Plus size={16} />}{existing(course) ? 'Na biblioteca · abrir' : 'Adicionar aos meus estudos'}</button>
    </article>)}</div>
  </div>
}
