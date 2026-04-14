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
})
