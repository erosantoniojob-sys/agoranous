import type { Config } from '@netlify/functions'
import { desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { libraryItems } from '../../db/schema.js'

const categories = new Set(['livro', 'filme', 'serie', 'jogo', 'app', 'aprendizado'])

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

function validLibraryId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9-]{16,80}$/.test(value)
}

export default async (request: Request) => {
  try {
    if (request.method === 'GET') {
      const libraryId = new URL(request.url).searchParams.get('libraryId')
      if (!validLibraryId(libraryId)) return jsonError('Biblioteca inválida.', 400)

      const items = await db
        .select()
        .from(libraryItems)
        .where(eq(libraryItems.libraryId, libraryId))
        .orderBy(desc(libraryItems.createdAt))

      return Response.json(items)
    }

    if (request.method === 'POST') {
      const body = await request.json()
      if (!validLibraryId(body.libraryId)) return jsonError('Biblioteca inválida.', 400)
      if (!categories.has(body.categoria)) return jsonError('Categoria inválida.', 400)
      if (typeof body.titulo !== 'string' || !body.titulo.trim()) return jsonError('Título inválido.', 400)

      const [createdItem] = await db.insert(libraryItems).values({
        libraryId: body.libraryId,
        category: body.categoria,
        title: body.titulo.trim(),
        creator: typeof body.autor_criador === 'string' ? body.autor_criador : 'Criador não informado',
        year: Number.isInteger(body.ano) ? body.ano : null,
        synopsis: typeof body.sinopse === 'string' ? body.sinopse : 'Sinopse não disponível.',
        genres: Array.isArray(body.generos) ? body.generos.filter((genre: unknown) => typeof genre === 'string') : [],
        coverUrl: typeof body.url_capa === 'string' ? body.url_capa : null,
        source: typeof body.fonte === 'string' ? body.fonte : 'Busca inteligente',
      }).returning()

      return Response.json(createdItem, { status: 201 })
    }

    return jsonError('Método não permitido.', 405)
  } catch (error) {
    console.error('Library operation failed', error instanceof Error ? error.message : 'Unknown error')
    return jsonError('Não foi possível acessar a biblioteca agora.', 500)
  }
}

export const config: Config = {
  path: '/api/library',
  method: ['GET', 'POST'],
}
