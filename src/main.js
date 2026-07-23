import './styles.css'
import { listLibrary, saveLibraryItem, searchTitle } from './lib/api.js'
import { getLibraryId } from './lib/storage.js'
import { calculateLibraryStats } from './lib/statistics.js'

const categoryLabels = {
  livro: 'Livro',
  filme: 'Filme',
  serie: 'Série',
  app: 'App',
  aprendizado: 'Aprendizado',
  jogo: 'Jogo',
}

const libraryId = getLibraryId()
let searchResult = null
let currentCategoryFilter = 'all'
let allLibraryItems = []

// Favorites persistence in localStorage
function getFavorites() {
  try {
    const raw = localStorage.getItem('agora_favorites')
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveFavorites(favoritesSet) {
  try {
    localStorage.setItem('agora_favorites', JSON.stringify([...favoritesSet]))
  } catch (error) {
    console.error('Failed to save favorites', error)
  }
}

const favoritesSet = getFavorites()

const elements = {
  dialog: document.querySelector('#search-dialog'),
  form: document.querySelector('#search-form'),
  titleInput: document.querySelector('#search-title'),
  categoryInput: document.querySelector('#search-category'),
  searchButton: document.querySelector('#search-button'),
  formMessage: document.querySelector('#form-message'),
  previewEmpty: document.querySelector('#preview-empty'),
  previewLoading: document.querySelector('#preview-loading'),
  previewResult: document.querySelector('#preview-result'),
  confirmButton: document.querySelector('#confirm-item'),
  libraryGrid: document.querySelector('#library-grid'),
  collectionCount: document.querySelector('#collection-count'),
  statsTotal: document.querySelector('#stats-total'),
  statsBooks: document.querySelector('#stats-books'),
  statsMovies: document.querySelector('#stats-movies'),
  statsSeries: document.querySelector('#stats-series'),
  statsApps: document.querySelector('#stats-apps'),
  statsLearnings: document.querySelector('#stats-learnings'),
  statsFavorites: document.querySelector('#stats-favorites'),
  navTabs: document.querySelectorAll('.nav-tab'),
}

function setSearchState(state) {
  elements.previewEmpty.hidden = state !== 'empty'
  elements.previewLoading.hidden = state !== 'loading'
  elements.previewResult.hidden = state !== 'result'
  elements.searchButton.disabled = state === 'loading'
  elements.searchButton.querySelector('span').textContent = state === 'loading' ? 'Consultando…' : 'Buscar'
}

function setMessage(message, type = '') {
  elements.formMessage.textContent = message
  elements.formMessage.dataset.type = type
}

function openDialog() {
  elements.dialog.showModal()
  requestAnimationFrame(() => elements.titleInput.focus())
}

function closeDialog() {
  elements.dialog.close()
  elements.form.reset()
  searchResult = null
  elements.confirmButton.disabled = true
  setMessage('')
  setSearchState('empty')
}

function createGenre(name) {
  const genre = document.createElement('span')
  genre.textContent = name
  return genre
}

function showPreview(item) {
  document.querySelector('#preview-category').textContent = categoryLabels[item.categoria] || item.categoria
  document.querySelector('#preview-year').textContent = item.ano ? ` · ${item.ano}` : ''
  document.querySelector('#preview-title').textContent = item.titulo
  document.querySelector('#preview-creator').textContent = item.autor_criador
  document.querySelector('#preview-synopsis').textContent = item.sinopse
  document.querySelector('#preview-source').textContent = `Fonte: ${item.fonte}`

  const genres = document.querySelector('#preview-genres')
  genres.replaceChildren(...(item.generos && item.generos.length ? item.generos.slice(0, 4).map(createGenre) : [createGenre('Gênero não informado')]))

  const cover = document.querySelector('#preview-cover')
  const fallback = document.querySelector('#cover-fallback')
  cover.hidden = !item.url_capa
  fallback.hidden = Boolean(item.url_capa)
  cover.src = item.url_capa || ''
  cover.alt = item.url_capa ? `Capa de ${item.titulo}` : ''
  cover.onerror = () => {
    cover.hidden = true
    fallback.hidden = false
  }

  setSearchState('result')
}

function createLibraryCard(item) {
  const article = document.createElement('article')
  article.className = 'library-card'

  // Cover frame
  const cover = document.createElement('div')
  cover.className = 'card-cover'

  if (item.coverUrl) {
    const image = document.createElement('img')
    image.src = item.coverUrl
    image.alt = `Capa de ${item.title}`
    image.loading = 'lazy'
    image.onerror = () => {
      image.remove()
      monogram.style.display = 'block'
    }
    cover.append(image)
  }

  const monogram = document.createElement('span')
  monogram.className = 'card-monogram'
  monogram.textContent = item.title.charAt(0).toUpperCase()
  monogram.setAttribute('aria-hidden', 'true')
  if (item.coverUrl) monogram.style.display = 'none'
  cover.append(monogram)

  // Favorite button
  const isFav = favoritesSet.has(item.id)
  const favBtn = document.createElement('button')
  favBtn.type = 'button'
  favBtn.className = `card-favorite-btn ${isFav ? 'active' : ''}`
  favBtn.setAttribute('aria-label', isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos')
  favBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="${isFav ? '#D4AF37' : 'none'}">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  `

  favBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (favoritesSet.has(item.id)) {
      favoritesSet.delete(item.id)
    } else {
      favoritesSet.add(item.id)
    }
    saveFavorites(favoritesSet)
    renderLibrary(allLibraryItems)
  })

  cover.append(favBtn)

  // Card Body
  const body = document.createElement('div')
  body.className = 'card-body'

  const meta = document.createElement('p')
  meta.className = 'card-meta'
  meta.textContent = `${categoryLabels[item.category] || item.category}${item.year ? ` · ${item.year}` : ''}`

  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = item.title

  const creator = document.createElement('p')
  creator.className = 'card-creator'
  creator.textContent = item.creator

  const synopsis = document.createElement('p')
  synopsis.className = 'card-synopsis'
  synopsis.textContent = item.synopsis || 'Sem descrição.'

  body.append(meta, title, creator, synopsis)
  article.append(cover, body)

  return article
}

function renderStatistics(items) {
  const statistics = calculateLibraryStats(items, favoritesSet)
  if (elements.statsTotal) elements.statsTotal.textContent = statistics.totalObras
  if (elements.statsBooks) elements.statsBooks.textContent = statistics.totalLivros
  if (elements.statsMovies) elements.statsMovies.textContent = statistics.totalFilmes
  if (elements.statsSeries) elements.statsSeries.textContent = statistics.totalSeries
  if (elements.statsApps) elements.statsApps.textContent = statistics.totalApps
  if (elements.statsLearnings) elements.statsLearnings.textContent = statistics.totalAprendizados
  if (elements.statsFavorites) elements.statsFavorites.textContent = statistics.totalFavoritos
}

function renderLibrary(items) {
  allLibraryItems = items
  renderStatistics(items)
  elements.libraryGrid.setAttribute('aria-busy', 'false')

  // Filter items based on current category tab
  let filteredItems = items
  if (currentCategoryFilter === 'favorito') {
    filteredItems = items.filter((item) => favoritesSet.has(item.id))
  } else if (currentCategoryFilter !== 'all') {
    filteredItems = items.filter((item) => item.category === currentCategoryFilter)
  }

  const countText = filteredItems.length === 1 ? '1 obra exibida' : `${filteredItems.length} obras exibidas`
  elements.collectionCount.textContent = countText

  if (!filteredItems.length) {
    elements.libraryGrid.replaceChildren(createEmptyState())
    return
  }

  elements.libraryGrid.replaceChildren(...filteredItems.map(createLibraryCard))
}

function createEmptyState() {
  const article = document.createElement('article')
  article.className = 'empty-library'

  const mono = document.createElement('span')
  mono.className = 'empty-monogram'
  mono.textContent = '✦'

  const title = document.createElement('h3')
  title.textContent = currentCategoryFilter === 'all'
    ? 'As estantes da Ágora aguardam'
    : `Nenhuma obra em ${categoryLabels[currentCategoryFilter] || currentCategoryFilter}`

  const desc = document.createElement('p')
  desc.textContent = 'Utilize a busca inteligente para catalogar novos livros, filmes, séries, aplicativos e aprendizados.'

  const btn = document.createElement('button')
  btn.className = 'text-button'
  btn.type = 'button'
  btn.textContent = 'Adicionar obra'
  btn.addEventListener('click', openDialog)

  article.append(mono, title, desc, btn)
  return article
}

async function loadLibrary() {
  try {
    const items = await listLibrary(libraryId)
    renderLibrary(items)
  } catch (error) {
    elements.libraryGrid.setAttribute('aria-busy', 'false')
    elements.collectionCount.textContent = 'Catálogo temporariamente indisponível'
    console.error(error)
  }
}

// Navigation Tabs Event Listeners
elements.navTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    elements.navTabs.forEach((t) => t.classList.remove('active'))
    tab.classList.add('active')
    currentCategoryFilter = tab.dataset.category
    renderLibrary(allLibraryItems)
  })
})

// UI Action Listeners
document.querySelector('#open-search')?.addEventListener('click', openDialog)
document.querySelector('#empty-search')?.addEventListener('click', openDialog)
document.querySelector('#close-dialog')?.addEventListener('click', closeDialog)
document.querySelector('#cancel-dialog')?.addEventListener('click', closeDialog)

elements.dialog.addEventListener('click', (event) => {
  if (event.target === elements.dialog) closeDialog()
})

elements.dialog.addEventListener('cancel', (event) => {
  event.preventDefault()
  closeDialog()
})

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault()
  searchResult = null
  elements.confirmButton.disabled = true
  setMessage('')
  setSearchState('loading')

  try {
    searchResult = await searchTitle(elements.titleInput.value.trim(), elements.categoryInput.value)
    showPreview(searchResult)
    elements.confirmButton.disabled = false
  } catch (error) {
    setSearchState('empty')
    setMessage(error.message, 'error')
  }
})

elements.confirmButton.addEventListener('click', async () => {
  if (!searchResult) return

  elements.confirmButton.disabled = true
  elements.confirmButton.textContent = 'Guardando…'
  setMessage('')

  try {
    await saveLibraryItem(libraryId, searchResult)
    closeDialog()
    await loadLibrary()
  } catch (error) {
    setMessage(error.message, 'error')
    elements.confirmButton.disabled = false
  } finally {
    elements.confirmButton.textContent = 'Confirmar inclusão'
  }
})

loadLibrary()
