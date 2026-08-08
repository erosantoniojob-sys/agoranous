import type { Config } from '@netlify/functions'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { userData } from '../../db/schema.js'
import { requireUser } from './_auth.mjs'

export default async (request: Request) => {
  if (request.method !== 'GET') return Response.json({ error: 'Método não permitido.' }, { status: 405 })
  const identity = await requireUser(request)
  if (identity instanceof Response) return identity

  try {
    const rows = await db.select().from(userData).where(eq(userData.userId, identity))
    const result = Object.fromEntries(rows.map((row) => [row.collection, row.data]))
    return Response.json(result)
  } catch (error) {
    console.error('getUserData failed', error instanceof Error ? error.message : 'Unknown error')
    return Response.json({ error: 'Não foi possível recuperar seus dados agora.' }, { status: 500 })
  }
}

export const config: Config = { path: '/api/getUserData', method: 'GET' }
