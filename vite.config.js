import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'agora-catalog-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/searchMedia', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          const chunks = []
          let size = 0
          for await (const chunk of req) {
            size += chunk.length
            if (size > 16384) { res.statusCode = 413; res.end(); return }
            chunks.push(Buffer.from(chunk))
          }
          const { handleSearchMedia } = await server.ssrLoadModule('/server/searchMedia.ts')
          const result = await handleSearchMedia(new Request('http://localhost/api/searchMedia', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: Buffer.concat(chunks).toString(),
          }))
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(await result.text())
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Não foi possível consultar o catálogo.' }))
        }
      })
    },
  }],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
  }
})
