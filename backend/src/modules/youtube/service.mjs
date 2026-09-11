import { createYouTubeService as createService } from '../../../supabase/functions/_shared/youtube.mjs';
import { youtubeConfig } from '../../config/youtube.js';
export { normalizeChannelUrl, channelIdFromHtml, parseVideos } from '../../../supabase/functions/_shared/youtube.mjs';

export function createYouTubeService(options = {}) {
  return createService({ getChannelUrl: () => youtubeConfig.channelUrl, ...options });
}

const getVideos = createYouTubeService();

export async function youtubeHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  const data = await getVideos();
  res.writeHead(data.status === 'error' ? 503 : 200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify(data));
}
