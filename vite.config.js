import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  optimizeDeps: {
    include: ['mm-design/icons/react/MoonIcons.jsx'],
  },
  ssr: {
    noExternal: ['mm-design'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Manual vendor splitting for better cache efficiency.
    // Vendor libraries change rarely; splitting them means browsers re-download
    // only the app chunks when Cèrcol ships a new version.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — changes only on React upgrades.
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          // Routing — changes rarely.
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // i18n stack — relatively large, changes rarely.
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n'
          }
          // All other node_modules go into a single vendor chunk.
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        },
      },
    },
    // Raise warning threshold — individual lazy chunks are legitimately large
    // (instrument pages carry full item data).
    chunkSizeWarningLimit: 600,
  },
})
