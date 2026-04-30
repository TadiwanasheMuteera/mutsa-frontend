import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load all env vars so the proxy target always matches the configured backend.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL
    ? env.VITE_API_URL.replace(/\/api\/?$/, '')   // strip trailing /api from full URL
    : (env.VITE_API_BASE_URL || 'http://localhost:5000')

  return {
    plugins: [react()],

    // ── Dev server ────────────────────────────────────────────────────────────
    server: {
      port: 3000,
      open: true,
      // Forward /api/* to the backend so the browser never makes cross-origin
      // requests during development (eliminates CORS in dev).
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // ── Production build ──────────────────────────────────────────────────────
    build: {
      outDir: 'dist',
      // Disable sourcemaps in production — keeps bundle small and hides source.
      sourcemap: false,
      rollupOptions: {
        output: {
          // Split large libraries into separate cached chunks so repeat visits
          // only re-download changed code, not the entire bundle.
          manualChunks: {
            vendor:  ['react', 'react-dom', 'react-router-dom'],
            query:   ['@tanstack/react-query'],
            ui:      ['lucide-react'],
            charts:  ['xlsx', 'jspdf', 'jspdf-autotable'],
          },
        },
      },
    },
  }
})
