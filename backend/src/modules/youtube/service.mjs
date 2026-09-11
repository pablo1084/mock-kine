import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { youtubeConfig } from '../../config/youtube.js';

const CHANNEL_ID = /^UC[\w-]{22}$/;
const VIDEO_ID = /^[\w-]{11}$/;
const CACHE_MS = 5 * 60 * 1000;

export function normalizeChannelUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || !['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname) || url.port || url.username || url.password) {
    throw new Error('Usá un enlace HTTPS de un canal de YouTube.');
  }
  const parts = url.pathname.split('/').filter(Boolean);
  const baseLength = parts[0]?.startsWith('@') ? 1 : 2;
  if (!(parts[0]?.startsWith('@') && parts[0].length > 1) &&
      !(parts[0] === 'channel' && CHANNEL_ID.test(parts[1] || '')) &&
      !(['c', 'user'].includes(parts[0]) && parts[1])) {
    throw new Error('El enlace debe corresponder a un canal, no a un video.');
  }
  if (parts.length > baseLength + 1 || (parts[baseLength] && !['videos', 'shorts', 'streams', 'featured', 'about', 'playlists', 'community'].includes(parts[baseLength]))) {
    throw new Error('El enlace del canal no es válido.');
  }
  return `https://www.youtube.com/${parts.slice(0, baseLength).join('/')}`;
}

export function channelIdFromHtml(html) {
  // Solo metadatos del canal: no usar IDs de videos o canales recomendados.
  for (const tag of html.match(/<(?:link|meta)\b[^>]*>/gi) || []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1].toLowerCase(), match[2]]));
    if (attrs.itemprop === 'identifier' && CHANNEL_ID.test(attrs.content || '')) return attrs.content;
    if (attrs.rel === 'canonical' || attrs.property === 'og:url') {
      const match = (attrs.href || attrs.content || '').match(/youtube\.com\/channel\/(UC[\w-]{22})(?:[/?#]|$)/);
      if (match) return match[1];
    }
    if (attrs.type === 'application/rss+xml') {
      const match = (attrs.href || '').match(/[?&]channel_id=(UC[\w-]{22})(?:[&#]|$)/);
      if (match) return match[1];
    }
  }
  throw new Error('No se pudo resolver el canal. Probá su enlace /channel/UC…');
}

export function parseVideos(xml) {
  if (XMLValidator.validate(xml) !== true) throw new Error('Feed de YouTube inválido.');
  const { feed } = new XMLParser({ parseTagValue: false, processEntities: true }).parse(xml);
  if (!feed || typeof feed !== 'object') throw new Error('Respuesta de YouTube inesperada.');
  const entries = feed.entry ? (Array.isArray(feed.entry) ? feed.entry : [feed.entry]) : [];
  const seen = new Set();
  return entries.map((entry) => ({
    id: entry['yt:videoId'],
    title: typeof entry.title === 'string' ? entry.title : '',
    publishedAt: entry.published,
  })).filter((video) => {
    if (!VIDEO_ID.test(video.id || '') || !video.title || !Number.isFinite(Date.parse(video.publishedAt)) || seen.has(video.id)) return false;
    seen.add(video.id);
    return true;
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3);
}

export function createYouTubeService({ getChannelUrl = () => youtubeConfig.channelUrl, fetchImpl = fetch, now = Date.now, logger = console } = {}) {
  let cached;
  let expiresAt = 0;
  let currentUrl;
  let channelId;
  let pending;

  async function read(url, accept) {
    const response = await fetchImpl(url, { headers: { Accept: accept }, signal: AbortSignal.timeout(10000), redirect: 'error' });
    if (!response.ok) throw new Error(`YouTube respondió ${response.status}.`);
    return response.text();
  }

  return async function getVideos() {
    const configuredUrl = getChannelUrl().trim();
    if (!configuredUrl) return { status: 'unconfigured', channelUrl: '', videos: [] };
    let url;
    try {
      url = normalizeChannelUrl(configuredUrl);
    } catch (error) {
      logger.warn('[YouTube]', error.message);
      return { status: 'error', channelUrl: '', videos: [] };
    }
    if (currentUrl !== url) {
      currentUrl = url;
      channelId = undefined;
      cached = undefined;
      expiresAt = 0;
    }
    if (cached && now() < expiresAt) return cached;
    if (pending) return pending;
    pending = (async () => {
      try {
        channelId ||= url.split('/channel/')[1] || channelIdFromHtml(await read(url, 'text/html'));
        const videos = parseVideos(await read(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, 'application/atom+xml'));
        cached = { status: videos.length ? 'ready' : 'empty', channelUrl: url, videos };
        expiresAt = now() + CACHE_MS;
      } catch (error) {
        logger.warn('[YouTube]', error.message);
        cached = { status: cached?.videos.length ? 'stale' : 'error', channelUrl: url, videos: cached?.videos || [] };
        expiresAt = now() + 60000;
      }
      return cached;
    })();
    try { return await pending; } finally { pending = undefined; }
  };
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
