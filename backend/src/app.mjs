import { youtubeHandler, normalizeChannelUrl } from './modules/youtube/service.mjs';
import { youtubeConfig } from './config/youtube.js';

function json(req, res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify(data));
}

export function createApp({ corsOrigins = process.env.CORS_ORIGINS || '' } = {}) {
  const allowedOrigins = new Set(corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean));
  return async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(origin && allowedOrigins.has(origin) ? 204 : 403);
      return res.end();
    }
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/api/youtube') return await youtubeHandler(req, res);
      if (pathname === '/api/health' || pathname === '/api/config') {
        if (!['GET', 'HEAD'].includes(req.method)) {
          res.setHeader('Allow', 'GET, HEAD');
          return json(req, res, 405, { error: 'Método no permitido.' });
        }
        if (pathname === '/api/health') return json(req, res, 200, { status: 'ok' });
        let channelUrl = '';
        try { channelUrl = normalizeChannelUrl(youtubeConfig.channelUrl); } catch { /* Canal sin configurar. */ }
        return json(req, res, 200, { youtube: { channelUrl } });
      }
      return json(req, res, 404, { error: 'Ruta no encontrada.' });
    } catch (error) {
      console.error('[API]', error.message);
      if (res.headersSent) return res.destroy();
      return json(req, res, 500, { error: 'No se pudo procesar la solicitud.' });
    }
  };
}
