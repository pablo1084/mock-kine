import test from 'node:test';
import assert from 'node:assert/strict';
import { channelIdFromHtml, createYouTubeService, normalizeChannelUrl, parseVideos } from '../src/modules/youtube/service.mjs';

const channelId = `UC${'a'.repeat(22)}`;
const channelUrl = `https://www.youtube.com/channel/${channelId}`;
const atom = (entries = '') => `<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015"><title>Centro</title>${entries}</feed>`;
const entry = (id, day, title = 'Movimiento &amp; salud') => `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>2026-09-${day}T12:00:00Z</published></entry>`;
const logger = { warn() {} };

test('normaliza enlaces del canal y rechaza videos y otros servidores', () => {
  assert.equal(normalizeChannelUrl('https://youtube.com/@centro/videos?view=0'), 'https://www.youtube.com/@centro');
  assert.equal(normalizeChannelUrl(channelUrl), channelUrl);
  assert.equal(normalizeChannelUrl('http://www.youtube.com/@INFERNOMUSIC-nm8uq'), 'https://www.youtube.com/@INFERNOMUSIC-nm8uq');
  for (const url of ['https://example.com/@centro', 'ftp://youtube.com/@centro', 'https://youtube.com/watch?v=abcdefghijk', 'https://youtube.com/@centro/unexpected', 'https://youtube.com:8443/@centro']) {
    assert.throws(() => normalizeChannelUrl(url));
  }
});

test('resuelve el ID desde metadatos del canal, no desde recomendaciones', () => {
  assert.equal(channelIdFromHtml(`<meta content="${channelId}" itemprop="identifier">`), channelId);
  assert.equal(channelIdFromHtml(`<link rel="canonical" href="${channelUrl}">`), channelId);
  assert.equal(channelIdFromHtml(`<link rel="alternate" type="application/rss+xml" href="https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}">`), channelId);
  assert.throws(() => channelIdFromHtml(`{"recommendedChannelId":"${channelId}"}`));
});

test('devuelve los tres más recientes, decodifica títulos y descarta duplicados e inválidos', () => {
  const result = parseVideos(atom(entry('aaaaaaaaaaa', '01') + entry('bbbbbbbbbbb', '04') + entry('ccccccccccc', '03') + entry('ddddddddddd', '02') + entry('bbbbbbbbbbb', '04') + entry('invalid', '05')));
  assert.deepEqual(result.map((video) => video.id), ['bbbbbbbbbbb', 'ccccccccccc', 'ddddddddddd']);
  assert.equal(result[0].title, 'Movimiento & salud');
});

test('distingue un canal sin publicaciones de una respuesta inválida', () => {
  assert.deepEqual(parseVideos(atom()), []);
  assert.throws(() => parseVideos('<html>Not a feed</html>'));
  assert.throws(() => parseVideos('<feed><entry>'));
});

test('no consulta YouTube hasta configurar un canal', async () => {
  const service = createYouTubeService({ getChannelUrl: () => '', fetchImpl: () => assert.fail('No debe consultar') });
  assert.deepEqual(await service(), { status: 'unconfigured', channelUrl: '', videos: [] });
});

test('cachea consultas simultáneas y actualiza al vencer cinco minutos', async () => {
  let clock = 0;
  let calls = 0;
  const service = createYouTubeService({
    getChannelUrl: () => channelUrl,
    now: () => clock,
    fetchImpl: async () => { calls++; return new Response(atom(entry(calls === 1 ? 'aaaaaaaaaaa' : 'bbbbbbbbbbb', '05'))); },
  });
  await Promise.all([service(), service(), service()]);
  assert.equal(calls, 1);
  clock = 299999;
  assert.equal((await service()).videos[0].id, 'aaaaaaaaaaa');
  clock = 300001;
  assert.equal((await service()).videos[0].id, 'bbbbbbbbbbb');
  assert.equal(calls, 2);
});

test('resuelve handles una vez y conserva videos ante una caída temporal', async () => {
  let clock = 0;
  let fail = false;
  let htmlCalls = 0;
  const service = createYouTubeService({
    getChannelUrl: () => 'https://www.youtube.com/@centro', now: () => clock, logger,
    fetchImpl: async (url) => {
      if (fail) throw new Error('Network failure');
      if (url.includes('/@')) { htmlCalls++; return new Response(`<meta itemprop="identifier" content="${channelId}">`); }
      return new Response(atom(entry('aaaaaaaaaaa', '05')));
    },
  });
  assert.equal((await service()).status, 'ready');
  clock = 300001;
  fail = true;
  const stale = await service();
  assert.equal(stale.status, 'stale');
  assert.equal(stale.videos.length, 1);
  clock += 60001;
  fail = false;
  assert.equal((await service()).status, 'ready');
  assert.equal(htmlCalls, 1);
});

test('expone error recuperable con enlace al canal y reconoce feed vacío', async () => {
  const failed = createYouTubeService({ getChannelUrl: () => channelUrl, fetchImpl: async () => new Response('', { status: 404 }), logger });
  assert.deepEqual(await failed(), { status: 'error', channelUrl, videos: [] });
  const empty = createYouTubeService({ getChannelUrl: () => channelUrl, fetchImpl: async () => new Response(atom()) });
  assert.equal((await empty()).status, 'empty');
});
