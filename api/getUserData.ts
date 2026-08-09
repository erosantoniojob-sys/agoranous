import { requireSupabaseUser } from '../server/supabaseAuth.js'

export async function GET(request: Request) {
  const auth = await requireSupabaseUser(request)
  if (auth instanceof Response) return auth
  const { data, error } = await auth.client.from('user_data').select('collection,data').eq('user_id', auth.userId)
  if (error) return Response.json({ error: 'Não foi possível recuperar seus dados.', detail: error.message }, { status: 500 })
  return Response.json(Object.fromEntries((data || []).map(row => [row.collection, row.data])))
}
