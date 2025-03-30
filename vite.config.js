import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import purgecss from '@fullhuman/postcss-purgecss';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: false
          }]
        }),
        purgecss({
          content: ['./src/**/*.{jsx,tsx,html}'],
          safelist: [/^kbc-/, /^animate-/] // Safelist your important classes
        })
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['@firebase/app', '@firebase/database'],
          styles: [
            './src/styles/base.css',
            './src/styles/animations.css',
            './src/styles/components.css',
            './src/styles/game.css',
            './src/styles/responsive.css'
          ]
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@firebase/app', '@firebase/database']
  },
  resolve: {
    alias: {
      'firebase/app': '@firebase/app',
      'firebase/database': '@firebase/database'
    }
  }
});
