# Ágora

Ágora é uma aplicação web para catalogar livros, filmes, séries e jogos, concebida com uma estética Dark Academia. A busca inteligente consulta fontes públicas, normaliza os metadados encontrados e permite guardar cada obra em uma biblioteca pessoal.

## Finalidade e instruções de uso

A Ágora transforma repertório cultural em uma jornada de formação: reúne obras, registra progresso e aprendizados, conecta temas em trilhas e apoia práticas de foco, memória e produção intelectual.

Consulte o [Guia de uso da Ágora](GUIA_DE_USO.md) para conhecer o início rápido, cada área da interface, os fluxos principais, a sincronização e os limites das buscas inteligentes.

## Tecnologias

- Vite para desenvolvimento e empacotamento do frontend
- React, TypeScript e Tailwind CSS
- Vercel Functions para busca, recomendações, análise do acervo e sincronização
- Supabase Auth e Postgres com RLS para persistência por usuário
- Google Books, Open Library e iTunes Search como fontes públicas de metadados

## Executar localmente

Requer Node.js 22 e npm.

```bash
npm install
npx vercel dev
```

O Vercel Dev disponibiliza o frontend e as Functions em `/api/*` no mesmo ambiente local.

## Publicação na Vercel

O arquivo `vercel.json` define:

- comando de build: `npm run build`
- diretório publicado: `dist`
- redirecionamento de todas as rotas para `index.html`, permitindo navegação client-side sem erro 404

Ao conectar o repositório à Vercel, essas opções são aplicadas automaticamente.

### Contas e dados em vários dispositivos

Os dados são associados à conta Supabase autenticada e persistidos no Postgres do Supabase com RLS. Execute uma vez [supabase/user_data.sql](supabase/user_data.sql) no SQL Editor do Supabase e configure no ambiente da Vercel:

- `VITE_SUPABASE_URL`: URL do projeto Supabase;
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chave pública do Supabase;
- `SUPABASE_URL`: a mesma URL, usada somente pelas funções do servidor;
- `SUPABASE_PUBLISHABLE_KEY`: chave pública usada pelas Functions para validar a sessão e respeitar RLS.

Para ativar o enriquecimento de capas e sinopses e a análise inteligente das obras com Gemini, configure também no ambiente das Functions:

- `GEMINI_API_KEY`: chave criada no Google AI Studio, mantida somente no servidor;
- `GEMINI_MODEL` (opcional): modelo utilizado na busca; o padrão é `gemini-2.5-flash-lite`;
- `GEMINI_DAILY_LIMIT` (opcional): máximo diário de enriquecimentos por IP; o padrão é `3`;
- `GEMINI_LEARNING_DAILY_LIMIT` (opcional): máximo diário de análises de acervo por conta e IP; o padrão é `2`.

Depois, basta entrar com o mesmo e-mail e senha em cada dispositivo. Contas de visitante permanecem locais por definição.

## Verificação de qualidade

```bash
npm run typecheck
npm run check
```

`typecheck` valida o frontend e as Functions. `check` também produz o build de produção.
