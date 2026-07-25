import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Na Vercel os dados chegam pelo req.body
    const { userId, collection, data } = req.body;

    if (!userId || !collection) {
      return res.status(400).json({ error: 'Faltam parâmetros' });
    }

    const { error } = await supabase
      .from('user_data')
      .upsert({ user_id: userId, collection: collection, data: data }, { onConflict: 'user_id, collection' });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Erro no syncUserData:", error);
    return res.status(500).json({ error: error.message });
  }
}