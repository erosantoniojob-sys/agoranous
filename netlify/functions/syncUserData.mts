import type { Config } from '@netlify/functions'
import { db } from '../../db/index.js'
import { userData } from '../../db/schema.js'
import { requireUser } from './_auth.mjs'

const COLLECTIONS = new Set(['media', 'learnings', 'chat', 'profile', 'trails', 'onboarding', 'studium'])

export default async (request: Request) => {
  if (request.method !== 'POST') return Response.json({ error: 'Método não permitido.' }, { status: 405 })
  const identity = await requireUser(request)
  if (identity instanceof Response) return identity

  try {
    const body = await request.json().catch(() => ({})) as { collection?: unknown; data?: unknown }
    if (typeof body.collection !== 'string' || !COLLECTIONS.has(body.collection)) {
      return Response.json({ error: 'Coleção inválida.' }, { status: 400 })
    }
    if (body.data === undefined) return Response.json({ error: 'Dados ausentes.' }, { status: 400 })

    await db.insert(userData).values({
      userId: identity,
      collection: body.collection,
      data: body.data,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: [userData.userId, userData.collection],
      set: { data: body.data, updatedAt: new Date() },
    })
    return Response.json({ ok: true })
  } catch (error) {
    console.error('syncUserData failed', error instanceof Error ? error.message : 'Unknown error')
    return Response.json({ error: 'Não foi possível sincronizar seus dados agora.' }, { status: 500 })
  }
}

export const config: Config = { path: '/api/syncUserData', method: 'POST' }
