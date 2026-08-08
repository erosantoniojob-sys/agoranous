import { createClient } from '@supabase/supabase-js'

export async function requireUser(request: Request): Promise<string | Response> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return Response.json({ error: 'Autenticação necessária.' }, { status: 401 })

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return Response.json({ error: 'Autenticação não configurada no servidor.' }, { status: 503 })

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return Response.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
  return data.user.id
}
