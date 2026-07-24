const SCHOLE_PREFIX = 'agora.schole.'

export function readScholeValue<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(SCHOLE_PREFIX + key)
    return saved ? JSON.parse(saved) as T : fallback
  } catch {
    return fallback
  }
}

export function writeScholeValue<T>(key: string, value: T) {
  try {
    localStorage.setItem(SCHOLE_PREFIX + key, JSON.stringify(value))
  } catch {
    // The Scholé remains usable when browser storage is unavailable.
  }
}
