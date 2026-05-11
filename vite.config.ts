import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor code into separate chunks so a route change doesn't
    // re-download React / Supabase / Recharts — they're cached across
    // navigations and the route chunks stay small.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/.test(id))
            return 'vendor-react'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-recharts'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return 'vendor-misc'
        },
      },
    },
  },
})
