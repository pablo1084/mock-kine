import { BookingError, bookingInput, readBookingBody } from './booking-validation.mjs';

function pick(value, fields) {
  return Object.fromEntries(fields.map(key => [key, value[key]]));
}

export function createBookingApi({ config, backend, verifyTurnstile, hashPhone, afterCreate = (_id = '') => {}, log = console.warn }) {
  return async (request) => {
    const traceId = crypto.randomUUID();
    const emit = (event, details = {}) => log(JSON.stringify({ event, request_id: traceId, ...details }));
    const consume = async (scope, subject) => {
      try { await backend.consume(scope, subject); emit('rate_limit_allowed', { scope }); }
      catch (error) {
        if (error instanceof BookingError && error.code === 'RATE_LIMITED') emit('rate_limit_rejected', { scope, retry_after: error.retryAfter, created: false });
        throw error;
      }
    };
    const headers = {
      'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff', Vary: 'Origin', 'X-Request-Id': traceId,
    };
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });
    try {
      if (!config) throw new BookingError('BOOKING_NOT_CONFIGURED', 503);
      const origin = request.headers.get('origin');
      if (!origin || !config.origins.includes(origin)) throw new BookingError('ORIGIN_NOT_ALLOWED', 403);
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Expose-Headers'] = 'Retry-After, X-Request-Id';
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/functions\/v1(?=\/)/, '');
      const methods = { '/booking/services': 'GET', '/booking/requests': 'POST' };
      const method = methods[path];
      if (!method) throw new BookingError('NOT_FOUND', 404);
      if (request.method === 'OPTIONS') {
        if (request.headers.get('access-control-request-method') !== method) throw new BookingError('METHOD_NOT_ALLOWED', 405);
        const requested = (request.headers.get('access-control-request-headers') || '').toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
        if (requested.some(x => !['content-type', 'idempotency-key'].includes(x))) throw new BookingError('HEADERS_NOT_ALLOWED', 403);
        headers['Access-Control-Allow-Methods'] = method;
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Idempotency-Key';
        return new Response(null, { status: 204, headers });
      }
      if (request.method !== method) { headers.Allow = `${method}, OPTIONS`; throw new BookingError('METHOD_NOT_ALLOWED', 405); }
      if (path === '/booking/services') {
        if (url.search) throw new BookingError('INVALID_INPUT');
        await consume('read');
        const data = await backend.services();
        if (!Array.isArray(data)) throw new BookingError('BACKEND_UNAVAILABLE', 503);
        return reply(200, { services: data.map(row => pick(row, ['id', 'slug', 'name', 'contact_mode', 'contact_phone', 'parent_id', 'display_order', 'price_ars'])) });
      }
      if (url.search) throw new BookingError('INVALID_INPUT');
      emit('booking_request_received');
      await consume('create');
      const { rpc, token } = bookingInput(await readBookingBody(request), request.headers.get('idempotency-key'));
      await verifyTurnstile(token, new URL(origin).hostname, rpc.p_request_id);
      emit('turnstile_verified');
      await consume('phone', await hashPhone(rpc.p_phone_normalized));
      const result = await backend.create(rpc);
      const row = Array.isArray(result) && result.length === 1 ? result[0] : result;
      if (!row?.id || row.status !== 'received') throw new BookingError('BACKEND_UNAVAILABLE', 503);
      emit('contact_request_recorded', { contact_id: row.id });
      try { afterCreate(row.id); } catch { log(JSON.stringify({ event: 'contact_dispatch_deferred', request_id: traceId })); }
      return reply(200, { request: pick(row, ['id', 'status']) });
    } catch (error) {
      const safe = error instanceof BookingError ? error : new BookingError('INTERNAL_ERROR', 500);
      if (safe.retryAfter) headers['Retry-After'] = String(safe.retryAfter);
      if (safe.status >= 500) log(JSON.stringify({ event: 'booking_error', request_id: traceId, code: safe.code }));
      return reply(safe.status, { error: { code: safe.code }, request_id: traceId });
    }
  };
}
