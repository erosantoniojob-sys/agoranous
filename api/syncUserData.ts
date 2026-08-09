import { requireSupabaseUser } from '../server/supabaseAuth.js'

const COLLECTIONS = new Set(['media', 'learnings', 'chat', 'profile', 'trails', 'onboarding', 'studium'])

export async function POST(request: Request) {
  const auth = await requireSupabaseUser(request)
  if (auth instanceof Response) return auth
  const body = await request.json().catch(() => ({})) as { collection?: unknown; data?: unknown }
  if (typeof body.collection !== 'string' || !COLLECTIONS.has(body.collection) || body.data === undefined) {
    return Response.json({ error: 'Dados de sincronização inválidos.' }, { status: 400 })
  }
  const { error } = await auth.client.from('user_data').upsert({ user_id: auth.userId, collection: body.collection, data: body.data, updated_at: new Date().toISOString() }, { onConflict: 'user_id,collection' })
  if (error) return Response.json({ error: 'Não foi possível sincronizar seus dados.', detail: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
