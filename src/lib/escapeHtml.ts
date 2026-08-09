const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapes an arbitrary value before it is interpolated into an HTML document. */
export const escapeHtml = (value: unknown): string =>
  String(value).replace(/[&<>"']/g, (character) => HTML_ENTITIES[character] ?? character)
