import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [path.resolve(__dirname, 'src')],
        loadPaths: [path.resolve(__dirname, 'src')],
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/socket.io': { target: 'ws://localhost:3001', ws: true },
    },
  },
  build: { outDir: 'build' },
});
