import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
  // Use the automatic JSX runtime so component tests can render JSX without an
  // explicit React import (matching the app's @vitejs/plugin-react setup).
  esbuild: {
    jsx: 'automatic',
  },
})
