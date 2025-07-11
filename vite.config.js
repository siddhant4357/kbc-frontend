import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'socket.io-client'],
          firebase: ['@firebase/app', '@firebase/database']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@firebase/app', 
      '@firebase/database',
      'socket.io-client'
    ]
  },
  resolve: {
    alias: {
      'firebase/app': '@firebase/app',
      'firebase/database': '@firebase/database'
    }
  }
});
