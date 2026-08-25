import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type AuthenticatedClient = { client: SupabaseClient; userId: string }

export async function requireSupabaseUser(request: Request): Promise<AuthenticatedClient | Response> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    console.warn('[supabase-auth] request without bearer token')
    return Response.json({ error: 'Autenticação necessária.' }, { status: 401 })
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('[supabase-auth] Supabase environment is incomplete', { hasUrl: Boolean(url), hasPublishableKey: Boolean(key) })
    return Response.json({ error: 'Supabase não configurado na Vercel.' }, { status: 503 })
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) {
    console.warn('[supabase-auth] invalid or expired session', { message: error?.message || 'No user returned' })
    return Response.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
  }
  return { client, userId: data.user.id }
}
