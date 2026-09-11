import { createYouTubeService, normalizeChannelUrl } from './youtube.mjs';
import { DEFAULT_CHANNEL_URL } from './config.js';

// Solo información pública. Las futuras operaciones de turnos deben tener
// funciones y autorización propias; no agregarlas a esta API anónima.
export function createPublicApi({ channelUrl = DEFAULT_CHANNEL_URL, getVideos = createYouTubeService({ getChannelUrl: () => channelUrl }) } = {}) {
  return async (request) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    };
    const reply = (status, body) => new Response(request.method === 'HEAD' ? null : JSON.stringify(body), { status, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'HEAD'].includes(request.method)) {
      headers.Allow = 'GET, HEAD, OPTIONS';
      return reply(405, { error: 'Método no permitido.' });
    }
    try {
      // La pasarela conserva /api/...; también aceptamos la URL completa para pruebas.
      const pathname = new URL(request.url).pathname.replace(/^\/functions\/v1/, '');
      if (pathname === '/api/health') return reply(200, { status: 'ok' });
      if (pathname === '/api/config') {
        let normalized = '';
        try { normalized = normalizeChannelUrl(channelUrl); } catch { /* Sin canal válido. */ }
        return reply(200, { youtube: { channelUrl: normalized } });
      }
      if (pathname === '/api/youtube') {
        const data = await getVideos();
        return reply(data.status === 'error' ? 503 : 200, data);
      }
      return reply(404, { error: 'Ruta no encontrada.' });
    } catch (error) {
      console.error('[Public API]', error.message);
      return reply(500, { error: 'No se pudo procesar la solicitud.' });
    }
  };
}
