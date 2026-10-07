import path from 'path'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import type { Connect, Plugin } from 'vite'

// En local, `/sumate` (sin barra) caería en el fallback de la app. Lo llevamos a
// `/sumate/` para que abra la landing igual que en producción (vercel.json).
const sumateSinBarra: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url === '/sumate' || req.url?.startsWith('/sumate?')) {
    req.url = '/sumate/' + req.url.slice('/sumate'.length)
  }
  next()
}
const landingRoute = (): Plugin => ({
  name: 'clubplaza-landing-route',
  configureServer: (server) => void server.middlewares.use(sumateSinBarra),
  configurePreviewServer: (server) => void server.middlewares.use(sumateSinBarra),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    landingRoute(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Multi-página: la app (index.html) + la landing de pauta (/sumate). La landing
  // es una entrada aparte para que cargue liviana, sin el bundle de la app.
  build: {
    rolldownOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sumate: path.resolve(__dirname, 'sumate/index.html'),
      },
    },
  },
})
