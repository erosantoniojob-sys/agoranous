async function request(path, options) {
  const response = await fetch(path, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Ocorreu um erro inesperado.')
  }

  return data
}

export function searchTitle(title, category) {
  return request('/api/intelligent-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, category }),
  })
}

export function listLibrary(libraryId) {
  return request(`/api/library?libraryId=${encodeURIComponent(libraryId)}`)
}

export function saveLibraryItem(libraryId, item) {
  return request('/api/library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ libraryId, ...item }),
  })
}
