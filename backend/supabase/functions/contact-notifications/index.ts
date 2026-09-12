import { bookingConfig, createBookingBackend } from '../_shared/booking-backend.mjs';
import { whatsappConfig, createWhatsAppSender, createContactDispatcher, createContactWorker } from '../_shared/contact-whatsapp.mjs';

const base = bookingConfig((name: string) => Deno.env.get(name));
const whatsapp = whatsappConfig((name: string) => Deno.env.get(name));
Deno.serve(createContactWorker({
  config: base && whatsapp ? whatsapp : null,
  dispatch: base && whatsapp ? createContactDispatcher(createBookingBackend(base), createWhatsAppSender(whatsapp)) : null,
}));
