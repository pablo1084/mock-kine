import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class BookingError extends Error {
  constructor(code, status = 400, retryAfter = 0) { super(code); this.code = code; this.status = status; this.retryAfter = retryAfter; }
}
export function validUuid(value) {
  if (typeof value !== 'string' || !uuid.test(value)) throw new BookingError('INVALID_INPUT');
  return value.toLowerCase();
}
function text(value, min, max, optional = false) {
  if (optional && (value === undefined || value === null)) return '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/u.test(value)) throw new BookingError('INVALID_INPUT');
  value = value.trim();
  if (value.length < min) throw new BookingError('INVALID_INPUT');
  return value;
}
export function bookingInput(body, requestId) {
  const fields = ['service_id', 'full_name', 'phone', 'description', 'privacy_consent', 'turnstile_token'];
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !fields.includes(key))) throw new BookingError('INVALID_INPUT');
  const id = validUuid(requestId);
  const phoneText = text(body.phone, 8, 40);
  if (!/^[+\d\s().-]+$/.test(phoneText)) throw new BookingError('INVALID_PHONE');
  const phone = parsePhoneNumberFromString(phoneText, { defaultCountry: 'AR', extract: false });
  if (!phone?.isValid() || phone.ext) throw new BookingError('INVALID_PHONE');
  if (body.privacy_consent !== true) throw new BookingError('CONSENT_REQUIRED');
  return {
    token: text(body.turnstile_token, 1, 2048),
    rpc: {
      p_service_id: validUuid(body.service_id),
      p_full_name: text(body.full_name, 3, 160),
      // Guardar la misma representacion normalizada permite reintentar con otro formato visual.
      p_phone_normalized: phone.number,
      p_description: text(typeof body.description === 'string' ? body.description.replace(/[\r\n\t]+/g, ' ') : body.description, 1, 500),
      p_request_id: id, p_privacy_consent: true,
    },
  };
}

export async function readBookingBody(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new BookingError('UNSUPPORTED_MEDIA_TYPE', 415);
  if (request.headers.has('content-encoding')) throw new BookingError('UNSUPPORTED_MEDIA_TYPE', 415);
  const limit = 8192;
  if (Number(request.headers.get('content-length')) > limit) throw new BookingError('BODY_TOO_LARGE', 413);
  if (!request.body) throw new BookingError('INVALID_INPUT');
  const reader = request.body.getReader();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; reader.cancel().catch(() => {}); }, 5000);
  try {
    const chunks = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (timedOut) throw new BookingError('REQUEST_TIMEOUT', 408);
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new BookingError('BODY_TOO_LARGE', 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
    catch { throw new BookingError('INVALID_JSON'); }
  } finally { clearTimeout(timer); reader.releaseLock(); }
}
