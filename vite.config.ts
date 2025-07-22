import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      external: ['fs', 'fs/promises', 'path'],
      output: {
        globals: {
          'fs': 'undefined',
          'fs/promises': 'undefined',
          'path': 'undefined'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  server: {
    port: 3000,
    open: true
  },
  // PWA and favicon configuration
  publicDir: 'public',
  assetsInclude: ['**/*.png', '**/*.ico', '**/*.svg', '**/*.json'],
  optimizeDeps: {
    exclude: ['fs', 'path', 'fs/promises'],
    include: ['phaser']
  }
})
