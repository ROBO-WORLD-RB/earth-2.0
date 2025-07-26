import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth'],
          gemini: ['@google/genai']
        }
      }
    }
  },
  define: {
    // Enable PWA features in production
    __PWA_ENABLED__: JSON.stringify(true)
  }
});
