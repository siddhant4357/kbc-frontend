import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['@firebase/app', '@firebase/database'],
          socket: ['socket.io-client']
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
