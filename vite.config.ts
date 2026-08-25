/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Parser-only tests: they run in Node against fixtures/, no DOM needed.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
