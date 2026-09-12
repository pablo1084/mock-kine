import test from 'node:test';
import assert from 'node:assert/strict';
import { createWhatsAppSender, createContactDispatcher, createContactWorker, whatsappConfig } from '../supabase/functions/_shared/contact-whatsapp.mjs';

const config = { token: 'test-server-secret', phoneId: '123456', version: 'v23.0', centerPhone: '+5493834999999', patientTemplate: 'solicitud_recibida', centerTemplate: 'solicitud_centro', language: 'es_AR', workerSecret: 'test-secret-at-least-thirty-two-characters' };
const job = { id: 'notification-id', claim_token: 'token', recipient: 'patient', full_name: 'Paciente Prueba', phone: '+5493834123456', service_name: 'Kinesiología', description: 'Consulta inicial' };
test('WhatsApp: dos plantillas; paciente sin datos clinicos y centro con todos los campos', async () => {
  const bodies = [];
  const send = createWhatsAppSender(config, async (url, options) => {
    assert.equal(url, 'https://graph.facebook.com/v23.0/123456/messages');
    assert.equal(options.headers.Authorization, `Bearer ${config.token}`);
    bodies.push(JSON.parse(options.body)); return Response.json({ messages: [{ id: `wamid.${bodies.length}` }] });
  });
  assert.equal((await send(job)).result, 'accepted'); await send({ ...job, recipient: 'center' });
  assert.equal(bodies[0].to, '5493834123456'); assert.equal(bodies[0].template.name, 'solicitud_recibida');
  assert.equal(bodies[0].template.components, undefined);
  assert.equal(bodies[1].to, '5493834999999');
  assert.deepEqual(bodies[1].template.components[0].parameters.map(x => x.text), [job.full_name, job.phone, job.service_name, job.description]);
  assert.ok(!JSON.stringify(bodies).includes(config.token));
});
test('WhatsApp: rechazo, rate limit y resultado ambiguo no se reenvian ciegamente', async () => {
  for (const [status, result] of [[400, 'failed'], [401, 'failed'], [429, 'retry'], [500, 'unknown']])
    assert.equal((await createWhatsAppSender(config, async () => Response.json({}, { status }))(job)).result, result);
  assert.equal((await createWhatsAppSender(config, async () => { throw new Error('timeout'); })(job)).result, 'unknown');
  assert.equal((await createWhatsAppSender(config, async () => Response.json({}))(job)).result, 'unknown');
});
test('WhatsApp: fallo independiente por destinatario y worker privado', async () => {
  const finished = [];
  const dispatch = createContactDispatcher({ claim: async () => [job, { ...job, id: 'other', recipient: 'center' }], finish: async args => finished.push(args) },
    async task => task.recipient === 'patient' ? { result: 'failed', error: 'PROVIDER_REJECTED' } : { result: 'accepted', messageId: 'wamid.center' });
  assert.equal((await dispatch()).processed, 2); assert.equal(finished.length, 2);
  let calls = 0;
  const handler = createContactWorker({ config, dispatch: async () => { calls++; return { processed: 0 }; } });
  const req = (auth) => new Request('https://example.com/contact-notifications', { method: 'POST', headers: { Authorization: auth } });
  assert.equal((await handler(req('Bearer bad'))).status, 403); assert.equal(calls, 0);
  assert.equal((await handler(req(`Bearer ${config.workerSecret}`))).status, 200); assert.equal(calls, 1);
  assert.equal((await createContactWorker({ config: null })(req(''))).status, 503);
});
test('WhatsApp: configuracion obligatoria sin valores por defecto ni credenciales frontend', () => {
  assert.equal(whatsappConfig(() => undefined), null);
  const env = { WHATSAPP_ACCESS_TOKEN: config.token, WHATSAPP_PHONE_NUMBER_ID: config.phoneId, WHATSAPP_GRAPH_VERSION: config.version,
    WHATSAPP_CENTER_PHONE: config.centerPhone, WHATSAPP_PATIENT_TEMPLATE: config.patientTemplate, WHATSAPP_CENTER_TEMPLATE: config.centerTemplate,
    WHATSAPP_TEMPLATE_LANGUAGE: config.language, CONTACT_WORKER_SECRET: config.workerSecret };
  assert.ok(whatsappConfig(key => env[key]));
  assert.equal(whatsappConfig(key => key === 'CONTACT_WORKER_SECRET' ? 'short' : env[key]), null);
});
