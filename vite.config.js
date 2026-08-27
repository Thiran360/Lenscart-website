import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://reformist-egotism-backlash.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

