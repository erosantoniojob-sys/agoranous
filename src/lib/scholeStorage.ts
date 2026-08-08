import { readBrowserValue, writeBrowserValue } from './browserStorage'

const SCHOLE_PREFIX = 'agora.schole.'

export function readScholeValue<T>(key: string, fallback: T): T {
  return readBrowserValue(SCHOLE_PREFIX + key, fallback)
}

export function writeScholeValue<T>(key: string, value: T) {
  writeBrowserValue(SCHOLE_PREFIX + key, value)
}
