import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['horse-racing-frontend-production.up.railway.app', '.up.railway.app', '.railway.app', 'localhost'],
    open: process.env.DOCKER_ENV === 'true' ? false : true
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['horse-racing-frontend-production.up.railway.app', '.up.railway.app', '.railway.app', 'localhost']
  }
})
