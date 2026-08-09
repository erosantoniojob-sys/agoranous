# Project Guide

## Architecture

Ágora is a client-side single-page application built with Vite. Vercel serves the generated static assets, runs the `/api` Functions, and rewrites non-API paths to `index.html`.

## Key Paths

- `index.html`: application HTML entry point
- `src/main.tsx`: React/TypeScript entry point
- `src/styles.css`: global visual system and responsive layout
- `vercel.json`: Vercel build, Functions, and SPA rewrite configuration
- `dist/`: generated production output; never edit or commit it

## Conventions

- Use native ES modules.
- Keep reusable colors and typography tokens in CSS custom properties when the UI expands.
- Preserve the Dark Academia visual direction: warm off-black surfaces, muted brass accents, serif display typography, and restrained motion.
- Maintain accessible semantic HTML, keyboard focus states, and reduced-motion support.
- Keep browser-only persistence behind a small storage module rather than accessing `localStorage` throughout UI components.

## Deployment Decisions

- Node.js 24 is pinned in `package.json` to match the Vercel project runtime.
- TypeScript is pinned to a Vercel-compatible compiler release; upgrade it only after validating the Functions builder.
- Vite outputs production assets to `dist`, which is the Vercel output directory.
- The catch-all rewrite sends non-API application routes to `index.html` so the client-side router can resolve them.
- Cross-device data uses Supabase Postgres with RLS; never store durable user data in repository files or in-memory Function state.
