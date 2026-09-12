import { BookingError } from './booking-validation.mjs';

const knownErrors = {
  IDEMPOTENCY_CONFLICT: [409, 'IDEMPOTENCY_CONFLICT'],
  SERVICE_NOT_FOUND: [404, 'SERVICE_NOT_FOUND'],
  INVALID_REQUEST: [400, 'INVALID_INPUT'], INVALID_NAME: [400, 'INVALID_INPUT'],
  INVALID_PHONE: [400, 'INVALID_PHONE'], INVALID_INPUT: [400, 'INVALID_INPUT'],
};

export function bookingConfig(env) {
  try {
    const origins = (env('BOOKING_ALLOWED_ORIGINS') || '').split(',').map(x => x.trim()).filter(Boolean);
    if (!origins.length || origins.some(value => {
      const url = new URL(value);
      return url.origin !== value || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)));
    })) return null;
    const url = new URL(env('SUPABASE_URL'));
    if (url.protocol !== 'https:' || url.origin !== env('SUPABASE_URL')?.replace(/\/$/, '')) return null;
    const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
    const turnstileSecret = env('TURNSTILE_SECRET_KEY');
    const hashSecret = env('BOOKING_RATE_LIMIT_SECRET');
    if (!serviceKey || !turnstileSecret || !hashSecret || hashSecret.length < 32) return null;
    return { origins, supabaseUrl: url.origin, serviceKey, turnstileSecret, hashSecret };
  } catch { return null; }
}

export function createBookingBackend(config, fetchImpl = fetch) {
  async function call(path, args) {
    let response;
    try {
      response = await fetchImpl(`${config.supabaseUrl}/rest/v1/${path}`, {
        method: args === undefined ? 'GET' : 'POST',
        headers: { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json' },
        ...(args === undefined ? {} : { body: JSON.stringify(args) }),
        signal: AbortSignal.timeout(10000), redirect: 'error',
      });
    } catch { throw new BookingError('BACKEND_UNAVAILABLE', 503); }
    let data;
    try { data = await response.json(); } catch { throw new BookingError('BACKEND_UNAVAILABLE', 503); }
    if (!response.ok) {
      const mapped = Object.hasOwn(knownErrors, data?.message) ? knownErrors[data.message] : null;
      if (mapped) throw new BookingError(mapped[1], mapped[0]);
      throw new BookingError('BACKEND_UNAVAILABLE', 503);
    }
    return data;
  }
  return {
    claim: (id = null) => call('rpc/claim_contact_notifications', { p_contact_id: id }),
    finish: (args) => call('rpc/finish_contact_notification', args),
    services: () => call('services?select=id,slug,name&active=eq.true&order=name.asc&limit=100'),
    create: (args) => call('rpc/create_contact_request', args),
    consume: async (scope, subject = 'global') => {
      const rows = await call('rpc/consume_booking_rate_limit', { p_scope: scope, p_subject: subject });
      const limit = rows?.[0];
      if (!limit || typeof limit.allowed !== 'boolean' || !Number.isInteger(limit.retry_after) || limit.retry_after < 0) throw new BookingError('BACKEND_UNAVAILABLE', 503);
      if (!limit.allowed) throw new BookingError('RATE_LIMITED', 429, Math.max(1, limit.retry_after));
    },
  };
}

export function createTurnstileVerifier(config, fetchImpl = fetch) {
  return async (token, hostname, requestId) => {
    let response; let data;
    try {
      response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: config.turnstileSecret, response: token }),
        signal: AbortSignal.timeout(8000), redirect: 'error',
      });
      if (!response.ok) throw new Error('Unavailable');
      data = await response.json();
    } catch { throw new BookingError('VERIFICATION_UNAVAILABLE', 503); }
    if (!data || typeof data.success !== 'boolean') throw new BookingError('VERIFICATION_UNAVAILABLE', 503);
    if (data.success !== true || data.hostname !== hostname || data.action !== 'booking' || data.cdata !== requestId) throw new BookingError('VERIFICATION_FAILED', 403);
  };
}

export function createPhoneHasher(secret) {
  const key = crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return async (phone) => {
    const bytes = await crypto.subtle.sign('HMAC', await key, new TextEncoder().encode(phone));
    return [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, '0')).join('');
  };
}
