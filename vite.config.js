import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const RAILWAY = 'https://salesforce-resume-pdf-server-production.up.railway.app'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: RAILWAY,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Strip Origin and Referer — makes Railway see this as a server-to-server
        // request which bypasses its browser CORS checks
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('referer')
          })
        }
      }
    }
  }
})
