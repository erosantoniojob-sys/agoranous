# Project Guide

## Architecture

Ágora is a client-side single-page application built with Vite. Netlify serves the generated static assets and rewrites unknown paths to `index.html` so a client-side router can resolve them.

## Key Paths

- `index.html`: application HTML entry point
- `src/main.tsx`: React/TypeScript entry point
- `src/styles.css`: global visual system and responsive layout
- `netlify.toml`: Netlify build, publish, runtime, and SPA redirect configuration
- `dist/`: generated production output; never edit or commit it

## Conventions

- Use native ES modules.
- Keep reusable colors and typography tokens in CSS custom properties when the UI expands.
- Preserve the Dark Academia visual direction: warm off-black surfaces, muted brass accents, serif display typography, and restrained motion.
- Maintain accessible semantic HTML, keyboard focus states, and reduced-motion support.
- Keep browser-only persistence behind a small storage module rather than accessing `localStorage` throughout UI components.

## Deployment Decisions

- Node.js 22 is pinned in both `package.json` and `netlify.toml` to keep local and hosted builds aligned.
- Vite outputs production assets to `dist`, which is the Netlify publish directory.
- The catch-all redirect uses status 200 because this is an SPA rewrite, not a browser redirect.
- No server-side persistence is configured. If shared or cross-device data is introduced, use Netlify platform storage rather than repository files or in-memory state.
