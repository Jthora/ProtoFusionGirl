import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
  ],
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
  // Static assets configuration
  publicDir: 'public',
  // Do not include JSON here; Vite handles JSON imports via the JSON plugin
  assetsInclude: ['**/*.png', '**/*.ico', '**/*.svg'],
  optimizeDeps: {
    exclude: ['fs', 'path', 'fs/promises'],
    include: ['phaser']
  }
})
