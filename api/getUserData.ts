import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Na Vercel os parâmetros da URL chegam pelo req.query
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: 'ID não fornecido' });

    const { data: rows, error } = await supabase
      .from('user_data')
      .select('collection, data')
      .eq('user_id', userId);

    if (error) throw error;

    const cloudData: Record<string, any> = {};
    if (rows) {
      rows.forEach((row: any) => {
        cloudData[row.collection] = row.data;
      });
    }

    return res.status(200).json(cloudData);
  } catch (error: any) {
    console.error("Erro no getUserData:", error);
    return res.status(500).json({ error: error.message });
  }
}