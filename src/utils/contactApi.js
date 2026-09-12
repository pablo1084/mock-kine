import { apiUrl } from './api';

const base = (import.meta.env.VITE_BOOKING_API_BASE_URL?.trim() || new URL('../booking', apiUrl('')).href).replace(/\/+$/, '');
const messages = {
  INVALID_PHONE: 'Revisá el teléfono e incluí el código de área.',
  INVALID_INPUT: 'Revisá los datos del formulario e intentá nuevamente.',
  CONSENT_REQUIRED: 'Necesitamos tu autorización para gestionar la solicitud por WhatsApp.',
  SERVICE_NOT_FOUND: 'Ese servicio ya no está disponible. Elegí otro servicio.',
  VERIFICATION_FAILED: 'No pudimos verificar la solicitud. Volvé a intentar.',
  RATE_LIMITED: 'Recibimos varios intentos. Esperá unos minutos antes de volver a intentar.',
  BOOKING_NOT_CONFIGURED: 'Las solicitudes online no están disponibles por el momento. Contactanos por los medios del centro.',
};
async function read(response) {
  let data;
  try { data = await response.json(); } catch { throw new Error('El servicio de solicitudes no está disponible por el momento.'); }
  if (!response.ok) throw new Error(messages[data?.error?.code] || 'No pudimos comprobar el envío. Tus datos siguen aquí; volvé a intentar.');
  return data;
}
export async function getContactServices(signal) {
  const data = await read(await fetch(`${base}/services`, { signal, credentials: 'omit' }));
  if (!Array.isArray(data.services) || !data.services.every(s => typeof s.id === 'string' && typeof s.name === 'string')) throw new Error('No pudimos cargar los servicios.');
  return data.services;
}
export async function submitContactRequest(data, idempotencyKey, token) {
  const response = await fetch(`${base}/requests`, {
    method: 'POST', credentials: 'omit', signal: AbortSignal.timeout(45000),
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ ...data, turnstile_token: token }),
  });
  const result = await read(response);
  if (result.request?.status !== 'received' || typeof result.request.id !== 'string') throw new Error('No pudimos comprobar el envío. Volvé a intentar.');
  return result.request;
}
