import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('A sincronização não está configurada no servidor.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
}

async function getAuthenticatedUser(req, supabase) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return null

  const { data, error } = await supabase.auth.getUser(token)
  return error ? null : data.user
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const supabase = getSupabase()
    const user = await getAuthenticatedUser(req, supabase)
    if (!user) return res.status(401).json({ error: 'Sessão inválida ou expirada.' })

    const { data: rows, error } = await supabase
      .from('user_data')
      .select('collection, data')
      .eq('user_id', user.id)

    if (error) throw error

    const cloudData = Object.fromEntries((rows || []).map((row) => [row.collection, row.data]))
    return res.status(200).json(cloudData)
  } catch (error) {
    console.error('Erro ao obter dados sincronizados:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao obter os dados.' })
  }
}
