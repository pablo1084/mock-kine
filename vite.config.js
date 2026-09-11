import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiBase = env.VITE_API_BASE_URL?.trim();
  let url;
  try { url = new URL(apiBase); } catch { /* Mensaje de configuracion abajo. */ }
  if (!url || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Configurá VITE_API_BASE_URL con la URL HTTPS de Supabase Edge Functions en .env.local (ver .env.supabase.example).');
  }
  // El navegador consulta Supabase directamente, igual que en Cloudflare.
  return {};
});
