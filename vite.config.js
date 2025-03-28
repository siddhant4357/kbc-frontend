import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: true, // Enable in production
      },
      '/socket.io': {
        target: process.env.VITE_SOCKET_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: true, // Enable in production
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    target: 'es2015', // Ensures compatibility with older browsers
    polyfillDynamicImport: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'socket-vendor': ['socket.io-client'],
          'audio-assets': ['**/*.wav', '**/*.mp3', '**/*.mp4'] // Add audio chunk
        }
      }
    },
    minify: 'terser', // Add minification
    terserOptions: {
      compress: {
        drop_console: true // Remove console logs in production
      }
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // 4KB
    chunkSizeWarningLimit: 1000,
    // Add this section if you're using audio files
    assetsInclude: ['**/*.wav', '**/*.mp3', '**/*.mp4'] // Updated syntax
  },
  // Add compression for production
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'socket.io-client']
  }
})
