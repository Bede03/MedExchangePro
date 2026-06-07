import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const NGROK_HOST = process.env.NGROK_HOST || process.env.VITE_NGROK_HOST || '';
const ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.ngrok-free.dev'];

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ALLOWED_HOSTS,
    hmr: NGROK_HOST
      ? {
          host: NGROK_HOST,
        }
      : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
