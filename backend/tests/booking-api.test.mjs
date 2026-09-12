import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createBookingApi } from '../supabase/functions/_shared/booking-api.mjs';
import { createBookingBackend, createTurnstileVerifier, createPhoneHasher, bookingConfig } from '../supabase/functions/_shared/booking-backend.mjs';
import { BookingError } from '../supabase/functions/_shared/booking-validation.mjs';

const origin = 'https://consultorio.example';
const config = { origins: [origin], supabaseUrl: 'https://project.supabase.co', serviceKey: 'server-only-secret', turnstileSecret: 'test-secret', hashSecret: 'test-secret-at-least-thirty-two-characters' };
const service = '00000000-0000-4000-8000-000000000001';
const input = () => ({ service_id: service, full_name: 'Paciente Prueba', phone: '+54 9 383 4123456', description: 'Quisiera consultar', privacy_consent: true, turnstile_token: 'test-token' });
function req(path = '/requests', data = input(), method = 'POST', headers = {}) {
  return new Request(`https://project.supabase.co/functions/v1/booking${path}`, { method,
    headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID(), ...headers },
    ...(method === 'POST' ? { body: typeof data === 'string' ? data : JSON.stringify(data) } : {}) });
}
function harness(overrides = {}) {
  const calls = []; const logs = [];
  const backend = {
    consume: async (...args) => calls.push(['consume', ...args]),
    services: async () => [{ id: service, name: 'Kinesiología', slug: 'kinesiologia', duration_minutes: 60, secret: 'hidden' }],
    create: async args => { calls.push(['create', args]); return [{ id: service, status: 'received', phone: 'hidden', full_name: 'hidden' }]; },
    ...overrides.backend,
  };
  const handler = createBookingApi({ config, backend, verifyTurnstile: async (...args) => calls.push(['verify', ...args]),
    hashPhone: createPhoneHasher(config.hashSecret), afterCreate: id => calls.push(['dispatch', id]), log: data => logs.push(data), ...overrides, backend });
  return { handler, calls, logs };
}

test('Contacto: solo servicios y solicitudes, sin disponibilidad ni reservas con fecha', async () => {
  const { handler } = harness();
  const response = await handler(req('/services', null, 'GET'));
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys((await response.json()).services[0]), ['id', 'slug', 'name']);
  for (const path of ['/availability', '/appointments', '/admin']) assert.equal((await handler(req(path, null, 'GET'))).status, 404);
  assert.equal((await handler(req('/services?extra=x', null, 'GET'))).status, 400);
});
test('Contacto: validacion, telefono normalizado, idempotencia y respuesta minima', async () => {
  const { handler, calls } = harness(); const key = randomUUID();
  const response = await handler(req('/requests', { ...input(), description: 'Consulta\nsin urgencia' }, 'POST', { 'Idempotency-Key': key }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { request: { id: service, status: 'received' } });
  assert.deepEqual(calls.map(x => x[0]), ['consume', 'verify', 'consume', 'create', 'dispatch']);
  assert.deepEqual(calls[1], ['verify', 'test-token', 'consultorio.example', key]);
  assert.match(calls[2][2], /^[a-f0-9]{64}$/);
  const args = calls[3][1];
  assert.equal(args.p_phone_normalized, '+5493834123456'); assert.equal(args.p_description, 'Consulta sin urgencia');
  assert.equal(args.p_request_id, key); assert.equal(args.p_privacy_consent, true);
  assert.ok(!('p_starts_at' in args));
});
test('Contacto: CORS, preflight, metodos y consentimiento', async () => {
  const { handler, calls } = harness();
  const options = await handler(req('/requests', null, 'OPTIONS', { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,idempotency-key' }));
  assert.equal(options.status, 204); assert.equal(options.headers.get('access-control-allow-origin'), origin); assert.equal(calls.length, 0);
  for (const other of ['https://evil.example', 'null', origin + '.evil.example']) {
    const response = await handler(req('/requests', input(), 'POST', { Origin: other }));
    assert.equal(response.status, 403); assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  const missing = req(); missing.headers.delete('origin'); assert.equal((await handler(missing)).status, 403);
  assert.equal((await handler(req('/requests', null, 'GET'))).status, 405);
  assert.equal((await handler(req('/requests', { ...input(), privacy_consent: false }))).status, 400);
});
test('Contacto: entradas invalidas no llegan a Turnstile ni PostgreSQL', async () => {
  for (const change of [{ starts_at: '2026-09-14T12:00:00Z' }, { email: 'a@example.com' }, { status: 'confirmed' },
    { phone_normalized: '+12345' }, { full_name: 'x' }, { phone: '12345678' }, { phone: 'llamar al +5493834123456' },
    { description: '' }, { description: 'a'.repeat(501) }, { description: 'a\u0000b' }, { privacy_consent: 'true' },
    { service_id: 'invalid' }, { turnstile_token: '' }]) {
    const { handler, calls } = harness();
    assert.equal((await handler(req('/requests', { ...input(), ...change }))).status, 400);
    assert.ok(!calls.some(x => ['verify', 'create', 'dispatch'].includes(x[0])));
  }
  const { handler } = harness();
  assert.equal((await handler(req('/requests', '{'))).status, 400);
  assert.equal((await handler(req('/requests', 'a'.repeat(8193)))).status, 413);
  assert.equal((await handler(req('/requests', input(), 'POST', { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await handler(req('/requests', input(), 'POST', { 'Idempotency-Key': 'bad' }))).status, 400);
});
test('Contacto: fail closed, cuotas, errores seguros y fallos de despacho no pierden solicitud', async () => {
  assert.equal((await harness({ config: null }).handler(req())).status, 503);
  for (const [override, status] of [
    [{ verifyTurnstile: async () => { throw new BookingError('VERIFICATION_FAILED', 403); } }, 403],
    [{ backend: { consume: async () => { throw new BookingError('RATE_LIMITED', 429, 30); } } }, 429],
    [{ backend: { create: async () => { throw new BookingError('IDEMPOTENCY_CONFLICT', 409); } } }, 409],
    [{ backend: { create: async () => { throw new Error('secret patient info'); } } }, 500],
  ]) {
    const { handler, logs, calls } = harness(override); const response = await handler(req());
    assert.equal(response.status, status); if (status === 429) assert.equal(response.headers.get('retry-after'), '30');
    assert.ok(!(await response.text()).includes('secret')); assert.ok(!logs.join('').includes('secret'));
    assert.ok(!calls.some(x => x[0] === 'dispatch'));
  }
  assert.equal((await harness({ afterCreate: () => { throw new Error('worker down'); } }).handler(req())).status, 200);
});
test('Turnstile: hostname, action, cdata, token usado y proveedor caido', async () => {
  const key = randomUUID(); const good = { success: true, hostname: 'consultorio.example', action: 'booking', cdata: key };
  await createTurnstileVerifier(config, async () => Response.json(good))('token', 'consultorio.example', key);
  for (const change of [{ success: false }, { hostname: 'evil.example' }, { action: 'other' }, { cdata: randomUUID() }])
    await assert.rejects(createTurnstileVerifier(config, async () => Response.json({ ...good, ...change }))('token', 'consultorio.example', key), e => e.status === 403);
  await assert.rejects(createTurnstileVerifier(config, async () => { throw new Error('secret'); })('token', 'consultorio.example', key), e => e.status === 503);
});
test('REST: solo RPC de contacto, credenciales backend y errores mapeados', async () => {
  const backend = createBookingBackend(config, async (url, options) => {
    assert.equal(url, `${config.supabaseUrl}/rest/v1/rpc/create_contact_request`);
    assert.equal(options.headers.Authorization, `Bearer ${config.serviceKey}`);
    return Response.json({ message: 'IDEMPOTENCY_CONFLICT', details: 'private' }, { status: 400 });
  });
  await assert.rejects(backend.create({}), e => e.status === 409);
  const failed = createBookingBackend(config, async () => Response.json({ message: 'secret' }, { status: 500 }));
  await assert.rejects(failed.services(), e => e.message === 'BACKEND_UNAVAILABLE');
  const env = { BOOKING_ALLOWED_ORIGINS: origin, SUPABASE_URL: config.supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: config.serviceKey, TURNSTILE_SECRET_KEY: config.turnstileSecret, BOOKING_RATE_LIMIT_SECRET: config.hashSecret };
  assert.ok(bookingConfig(key => env[key])); assert.equal(bookingConfig(key => ({ ...env, BOOKING_ALLOWED_ORIGINS: '*' })[key]), null);
});
