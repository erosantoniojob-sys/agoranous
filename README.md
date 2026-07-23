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
