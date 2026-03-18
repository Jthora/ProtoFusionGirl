import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  server: {
    port: 4567,
    proxy: {
      '/public': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      },
      '/scripts': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, '../../dist/sprite-factory'),
  },
});
