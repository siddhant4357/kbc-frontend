import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': '{}',
    'process.browser': true,
    'process.version': '"0.0.0"',
    'process.platform': '"browser"',
    global: 'globalThis'
  },
  resolve: {
    alias: {
      '@': '/src',
      'process': 'process/browser'
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    watch: {
      usePolling: true
    }
  }
});
