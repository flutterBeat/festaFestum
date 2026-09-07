import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Backend Express di 4000. Frontend cukup panggil /api/v1/... tanpa
    // memikirkan CORS atau base URL saat dev.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
