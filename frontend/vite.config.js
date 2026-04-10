import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const host = process.env.VITE_HOST || '0.0.0.0'
const port = process.env.VITE_PORT ? Number(process.env.VITE_PORT) : 5173

export default defineConfig({
  plugins: [react({
    include: /\.(jsx|js)$/,
  })],
  server: {
    host,
    port,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})

