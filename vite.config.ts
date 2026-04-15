import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredBase = process.env.VITE_PUBLIC_BASE_PATH?.trim() || env.VITE_PUBLIC_BASE_PATH?.trim()
  const base = configuredBase
    ? configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`
    : '/'

  return {
    base,
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react'
              if (id.includes('lucide-react')) return 'vendor-icons'
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
