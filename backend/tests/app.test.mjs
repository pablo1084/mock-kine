import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../src/app.mjs';

test('API independiente: salud, configuración pública, rutas, métodos y CORS', async () => {
  const server = createServer(createApp({ corsOrigins: 'https://centro.example' }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { status: 'ok' });
    const config = await (await fetch(`${base}/api/config`)).json();
    assert.deepEqual(Object.keys(config), ['youtube']);
    assert.equal(typeof config.youtube.channelUrl, 'string');
    assert.equal((await fetch(`${base}/`)).status, 404);
    assert.equal((await fetch(`${base}/api/config`, { method: 'POST' })).status, 405);
    const allowed = await fetch(`${base}/api/config`, { headers: { Origin: 'https://centro.example' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://centro.example');
    const denied = await fetch(`${base}/api/config`, { headers: { Origin: 'https://otro.example' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    assert.equal((await fetch(`${base}/api/config`, { method: 'OPTIONS', headers: { Origin: 'https://centro.example' } })).status, 204);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
