const LIBRARY_ID_KEY = 'agora.library-id'

function createId() {
  return globalThis.crypto?.randomUUID?.() || `agora-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getLibraryId() {
  try {
    const storedId = localStorage.getItem(LIBRARY_ID_KEY)
    if (storedId) return storedId

    const libraryId = createId()
    localStorage.setItem(LIBRARY_ID_KEY, libraryId)
    return libraryId
  } catch {
    return createId()
  }
}
