import { requireSupabaseUser } from './supabaseAuth.js'

export async function handleGetUserData(request: Request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Método não permitido.' }, { status: 405 })
  }

  const auth = await requireSupabaseUser(request)
  if (auth instanceof Response) return auth

  const { data, error } = await auth.client
    .from('user_data')
    .select('collection,data')
    .eq('user_id', auth.userId)

  if (error) {
    return Response.json(
      { error: 'Não foi possível recuperar seus dados.', detail: error.message },
      { status: 500 },
    )
  }

  return Response.json(Object.fromEntries((data || []).map((row) => [row.collection, row.data])))
}
