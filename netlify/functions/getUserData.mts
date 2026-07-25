import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: Request) => {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) return new Response(JSON.stringify({ error: 'ID não fornecido' }), { status: 400 });

    // Busca todas as coleções do usuário ao mesmo tempo
    const { data: rows, error } = await supabase
      .from('user_data')
      .select('collection, data')
      .eq('user_id', userId);

    if (error) throw error;

    // Constrói o objeto que o React (AgoraProvider) está esperando
    const cloudData: Record<string, any> = {};
    if (rows) {
      rows.forEach((row) => {
        cloudData[row.collection] = row.data;
      });
    }

    return new Response(JSON.stringify(cloudData), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Erro no getUserData:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};