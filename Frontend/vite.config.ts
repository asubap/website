import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command !== 'serve' || mode !== 'development') {
    return { plugins: [react()] }
  }

  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const backendUrl = process.env.VITE_BACKEND_URL ?? env.VITE_BACKEND_URL ?? ''

  return {
    plugins: [react()],
    define: {
      // Local API callers add their own leading slash to each route.
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl.trim().replace(/\/+$/, '')),
    },
  }
})
