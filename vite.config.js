import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = { '/api': { target: env.BACKEND_URL || 'http://127.0.0.1:3000', changeOrigin: true } };
  return { server: { proxy }, preview: { proxy } };
});
