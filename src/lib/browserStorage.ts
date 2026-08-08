const STORAGE_VERSION = 1

type StoredEnvelope<T> = {
  version: number
  value: T
}

export function readBrowserValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T | StoredEnvelope<T>
    if (parsed && typeof parsed === 'object' && 'version' in parsed && 'value' in parsed) {
      return (parsed as StoredEnvelope<T>).value
    }
    return parsed as T
  } catch {
    return fallback
  }
}

export function writeBrowserValue<T>(key: string, value: T): boolean {
  try {
    const envelope: StoredEnvelope<T> = { version: STORAGE_VERSION, value }
    localStorage.setItem(key, JSON.stringify(envelope))
    return true
  } catch {
    return false
  }
}

export function removeBrowserValue(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Storage may be unavailable in private or restricted browser contexts.
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
