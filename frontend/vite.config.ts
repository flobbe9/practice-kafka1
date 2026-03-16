import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  resolve: {
    alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '@styles', replacement: fileURLToPath(new URL('./src/assets/styles', import.meta.url)) },
    ]
  }
})
