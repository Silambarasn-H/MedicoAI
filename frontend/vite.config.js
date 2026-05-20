import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // ── Dev server ──────────────────────────────────────────────────
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL
            ? env.VITE_API_BASE_URL.replace('/api', '')
            : 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // ── Path aliases ────────────────────────────────────────────────
    resolve: {
      alias: { '@': '/src' },
    },

    // ── Production build optimizations ─────────────────────────────
    build: {
      outDir: 'dist',
      sourcemap: false,          // disable in prod for security
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split large vendor chunks for better caching
          manualChunks: {
            'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
            'redux-vendor':  ['@reduxjs/toolkit', 'react-redux'],
            'chart-vendor':  ['chart.js', 'react-chartjs-2'],
            'axios-vendor':  ['axios'],
          },
        },
      },
    },

    // ── Preview server (after build) ────────────────────────────────
    preview: {
      port: 4173,
    },
  }
})
