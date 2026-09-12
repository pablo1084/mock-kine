import { createBookingApi } from '../_shared/booking-api.mjs';
import { bookingConfig, createBookingBackend, createTurnstileVerifier, createPhoneHasher } from '../_shared/booking-backend.mjs';
import { whatsappConfig, createWhatsAppSender, createContactDispatcher } from '../_shared/contact-whatsapp.mjs';

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

// Nunca reutilizar headers Authorization/apikey recibidos del navegador.
const config = bookingConfig((name: string) => Deno.env.get(name));
const whatsapp = whatsappConfig((name: string) => Deno.env.get(name));
const backend = config ? createBookingBackend(config) : null;
const dispatch = config && whatsapp ? createContactDispatcher(backend, createWhatsAppSender(whatsapp)) : null;
Deno.serve(createBookingApi({
  config: config && whatsapp ? config : null,
  backend,
  verifyTurnstile: config ? createTurnstileVerifier(config) : null,
  hashPhone: config ? createPhoneHasher(config.hashSecret) : null,
  afterCreate: (id = '') => {
    if (!id) return;
    EdgeRuntime.waitUntil(dispatch!(id).catch(() => {
      console.warn(JSON.stringify({ event: 'contact_dispatch_deferred' }));
    }));
  },
}));
