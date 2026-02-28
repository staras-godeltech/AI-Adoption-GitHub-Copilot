import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts'],
    },
  },
})
