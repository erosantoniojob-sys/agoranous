import type { MediaItem } from '../types/agora'
import type { MediaType } from '../types/agora'

export function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = filename; anchor.click()
  URL.revokeObjectURL(url)
}

const escapeCsv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`

export function mediaToCsv(items: MediaItem[]) {
  const header = ['titulo', 'tipo', 'autor', 'ano', 'status', 'nota', 'progresso', 'motivo']
  return [header.join(','), ...items.map(item => [item.titulo, item.tipo, item.autor_criador, item.ano, item.status, item.avaliacao_numerica, item.progresso_percentual, item.motivo_leitura].map(escapeCsv).join(','))].join('\n')
}

export function mediaToMarkdown(item: MediaItem) {
  return `---\ntipo: ${item.tipo}\nautor: ${item.autor_criador || ''}\nstatus: ${item.status}\nnota: ${item.avaliacao_numerica}\n---\n\n# ${item.titulo}\n\n> ${item.motivo_leitura || 'Motivação ainda não registrada.'}\n\n## Sinopse\n\n${item.sinopse || ''}\n\n## Citações\n\n## Aprendizados\n\n## Perguntas\n\n## Conexões\n`
}

export function mediaToBibtex(items: MediaItem[]) {
  return items.map((item, index) => `@misc{agora${item.ano || 'sd'}_${index + 1},\n  author = {${item.autor_criador || 'Autor não informado'}},\n  title = {${item.titulo}},\n  year = {${item.ano || 's.d.'}},\n  note = {${item.fonte || 'Acervo Ágora'}}\n}`).join('\n\n')
}

export function mediaCitation(item: MediaItem, style: 'ABNT' | 'APA' | 'Chicago') {
  const author = item.autor_criador || 'Autor não informado'
  const year = item.ano || 's.d.'
  if (style === 'APA') return `${author}. (${year}). ${item.titulo}. ${item.fonte || 'Ágora'}.`
  if (style === 'Chicago') return `${author}. ${item.titulo}. ${item.fonte || 'Ágora'}, ${year}.`
  return `${author.toUpperCase()}. ${item.titulo}. ${item.fonte || 'Ágora'}, ${year}.`
}

export function parseImportedMedia(content: string, filename: string): Array<Omit<MediaItem, 'id' | 'criadoEm'>> {
  const make = (titulo: string, autor = '', ano?: number, tipo: MediaType = 'Livro'): Omit<MediaItem, 'id' | 'criadoEm'> => ({ titulo: titulo.trim(), tipo, autor_criador: autor.trim(), ano: ano || null, sinopse: '', status: 'Pendente', avaliacao_numerica: 0, generos: [], fonte: `Importado de ${filename}` })
  if (/\.ris$/i.test(filename)) {
    return content.split(/\r?\nER\s*-\s*/).map(record => make(record.match(/(?:^|\n)TI\s*-\s*(.+)/)?.[1] || '', record.match(/(?:^|\n)AU\s*-\s*(.+)/)?.[1] || '', Number(record.match(/(?:^|\n)PY\s*-\s*(\d{4})/)?.[1]) || undefined)).filter(item => item.titulo)
  }
  if (/\.bib$/i.test(filename)) {
    return content.split(/(?=@\w+\s*\{)/).map(record => make(record.match(/title\s*=\s*[\{"']([^\}"']+)/i)?.[1] || '', record.match(/author\s*=\s*[\{"']([^\}"']+)/i)?.[1] || '', Number(record.match(/year\s*=\s*[\{"']?(\d{4})/i)?.[1]) || undefined)).filter(item => item.titulo)
  }
  if (/\.csv$/i.test(filename)) {
    const lines = content.split(/\r?\n/).filter(Boolean); const headers = lines.shift()?.split(',').map(value => value.replaceAll('"', '').trim().toLowerCase()) || []
    const index = (...names: string[]) => headers.findIndex(header => names.includes(header))
    const titleAt = index('title','titulo','name'); const authorAt = index('author','autor','autor_criador'); const yearAt = index('year','ano'); const typeAt = index('type','tipo')
    return lines.map(line => { const values = line.match(/("(?:[^"]|"")*"|[^,]+)/g)?.map(value => value.replace(/^"|"$/g, '').replaceAll('""', '"')) || []; const rawType = values[typeAt] as MediaType; return make(values[titleAt] || '', values[authorAt] || '', Number(values[yearAt]) || undefined, ['Livro','Filme','Série','Jogo','App','Podcast','Curso'].includes(rawType) ? rawType : 'Livro') }).filter(item => item.titulo)
  }
  return []
}
