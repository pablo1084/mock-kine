import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicApi } from '../supabase/functions/_shared/public-api.mjs';

test('Edge API: rutas, preflight público, métodos y aislamiento de turnos', async () => {
  const handler = createPublicApi({ channelUrl: 'https://youtube.com/@centro/videos', getVideos: async () => ({ status: 'ready', videos: [{ id: 'abcdefghijk' }] }) });
  const call = (path, options) => handler(new Request(`https://example.com${path}`, options));
  assert.deepEqual(await (await call('/api/health')).json(), { status: 'ok' });
  assert.deepEqual(await (await call('/functions/v1/api/config')).json(), { youtube: { channelUrl: 'https://www.youtube.com/@centro' } });
  assert.equal((await (await call('/api/youtube')).json()).videos.length, 1);
  const preflight = await call('/api/config', { method: 'OPTIONS' });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), '*');
  assert.equal((await call('/api/youtube', { method: 'POST' })).status, 405);
  assert.equal(await (await call('/api/health', { method: 'HEAD' })).text(), '');
  assert.equal((await call('/api/turnos')).status, 404);
});

test('Edge API: error de YouTube conserva el contrato del frontend', async () => {
  const handler = createPublicApi({ getVideos: async () => ({ status: 'error', videos: [] }) });
  const response = await handler(new Request('https://example.com/api/youtube'));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).status, 'error');
});
