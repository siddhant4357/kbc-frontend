import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        pure_funcs: ['console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/database']
        }
      }
    }
  },
  define: {
    // Allow proper development vs. production detection
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'firebase/app',
      'firebase/database'
    ]
  }
});
