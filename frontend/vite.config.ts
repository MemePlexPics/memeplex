import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  build: {
      outDir: './dist',
  },
  publicDir: './src/public',
  plugins: [
    react(),
  ],
})
