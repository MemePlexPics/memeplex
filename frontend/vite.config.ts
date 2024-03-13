import { defineConfig } from 'vite'
// import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'
import styleX from 'vite-plugin-stylex'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  build: {
    outDir: './dist'
  },
  publicDir: './src/public',
  plugins: [react(), styleX()],
  resolve: {
    alias: {
      '@': './src/' // resolve(__dirname, 'src'),
    }
  }
})
