# Ágora

Ágora é uma aplicação web para catalogar livros, filmes, séries e jogos, concebida com uma estética Dark Academia. A busca inteligente consulta fontes públicas, normaliza os metadados encontrados e permite guardar cada obra em uma biblioteca pessoal.

## Tecnologias

- Vite para desenvolvimento e empacotamento do frontend
- HTML, CSS e JavaScript em módulos
- Netlify Functions para busca e operações da biblioteca
- Netlify Database com Drizzle ORM para persistência
- Google Books, Wikidata e Wikipédia como fontes públicas de metadados

## Executar localmente

Requer Node.js 22 e npm.

```bash
npm install
netlify dev --port 8889
```

O Netlify Dev disponibiliza o frontend, as funções em `/api/*` e a conexão com o banco no mesmo ambiente local.

## Publicação no Netlify

O arquivo `netlify.toml` define:

- comando de build: `npm run build`
- diretório publicado: `dist`
- versão principal do Node.js: `22`
- redirecionamento de todas as rotas para `index.html`, permitindo navegação client-side sem erro 404
- migrações automáticas do Netlify Database em `netlify/database/migrations`

Ao conectar o repositório ao Netlify, essas opções são aplicadas automaticamente.

### Contas e dados em vários dispositivos

Os dados do acervo são associados à conta Supabase autenticada. Para ativar a sincronização entre dispositivos, execute uma vez o script [supabase/user_data.sql](supabase/user_data.sql) no SQL Editor do Supabase e configure na Vercel as variáveis de ambiente abaixo:

- `VITE_SUPABASE_URL`: URL do projeto Supabase;
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chave pública do Supabase;
- `SUPABASE_URL`: a mesma URL, usada somente pelas funções do servidor;
- `SUPABASE_SECRET_KEY`: chave secreta do Supabase, mantida somente na Vercel e nunca exposta no frontend.

Para ativar o enriquecimento de capas e sinopses com Gemini, configure também no ambiente das Functions:

- `GEMINI_API_KEY`: chave criada no Google AI Studio, mantida somente no servidor;
- `GEMINI_MODEL` (opcional): modelo utilizado na busca; o padrão é `gemini-2.5-flash-lite`;
- `GEMINI_DAILY_LIMIT` (opcional): máximo diário de enriquecimentos por IP; o padrão é `3`.

Depois, basta entrar com o mesmo e-mail e senha em cada dispositivo. Contas de visitante permanecem locais por definição.
