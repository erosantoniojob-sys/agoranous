import { createClient } from '@supabase/supabase-js';

// Conecta ao Supabase usando as chaves que já estão na Vercel
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const body = await req.json();
    const { userId, collection, data } = body;

    if (!userId || !collection) {
      return new Response(JSON.stringify({ error: 'Faltam parâmetros' }), { status: 400 });
    }

    // Salva ou atualiza os dados do usuário (ex: a lista de Mídias dele)
    const { error } = await supabase
      .from('user_data')
      .upsert({ user_id: userId, collection: collection, data: data }, { onConflict: 'user_id, collection' });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    console.error("Erro no syncUserData:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};