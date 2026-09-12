import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { bootstrap, migration, rateMigration, contactMigration, fixture, service } from './helpers/booking-db.mjs';
import { createBookingApi } from '../supabase/functions/_shared/booking-api.mjs';
import { createBookingBackend, createPhoneHasher } from '../supabase/functions/_shared/booking-backend.mjs';
import { createContactDispatcher } from '../supabase/functions/_shared/contact-whatsapp.mjs';

test('Contacto HTTP → PostgreSQL → dos WhatsApp, sin agenda; retries y ACL', async t => {
  const db = new PGlite(); t.after(() => db.close());
  await db.exec(bootstrap + migration + rateMigration + contactMigration + fixture);
  await db.exec('set role service_role');
  const config = { origins: ['https://consultorio.example'], supabaseUrl: 'https://project.supabase.co', serviceKey: 'server-test-key', hashSecret: 'test-secret-with-at-least-thirty-two-chars' };
  const rest = async (url, options) => {
    assert.equal(options.headers.apikey, config.serviceKey);
    const name = new URL(url).pathname.split('/').at(-1);
    assert.ok(['create_contact_request', 'consume_booking_rate_limit', 'claim_contact_notifications', 'finish_contact_notification'].includes(name));
    const args = JSON.parse(options.body); const keys = Object.keys(args);
    assert.ok(keys.every(x => /^p_[a-z_]+$/.test(x)));
    try {
      const result = await db.query(`select * from public.${name}(${keys.map((key, i) => `${key} => $${i + 1}`).join(',')})`, Object.values(args));
      return Response.json(result.rows);
    } catch (error) { return Response.json({ message: error.message }, { status: 400 }); }
  };
  const backend = createBookingBackend(config, rest); const sends = [];
  const dispatch = createContactDispatcher(backend, async job => { sends.push(job); return { result: 'accepted', messageId: `wamid.${job.id}` }; });
  const handler = createBookingApi({ config, backend, hashPhone: createPhoneHasher(config.hashSecret), verifyTurnstile: async () => {}, log: () => {} });
  const key = randomUUID();
  const request = (id = key, description = 'Consulta inicial', phone = '+54 9 383 4123456') => new Request(`${config.supabaseUrl}/functions/v1/booking/requests`, {
    method: 'POST', headers: { Origin: config.origins[0], 'Content-Type': 'application/json', 'Idempotency-Key': id },
    body: JSON.stringify({ service_id: service, full_name: 'Paciente Prueba', phone, description, privacy_consent: true, turnstile_token: 'test' }),
  });
  const response = await handler(request()); assert.equal(response.status, 200);
  const first = await response.json(); assert.equal(first.request.status, 'received');
  // No depende de horarios ni cupos; primer envio reclama exactamente dos mensajes.
  assert.equal((await dispatch(first.request.id)).processed, 2);
  const retry = await handler(request(key, 'Consulta inicial', '0383 15 4123456'));
  assert.equal(retry.status, 200); assert.deepEqual(await retry.json(), first);
  assert.equal((await dispatch(first.request.id)).processed, 0);
  assert.deepEqual(sends.map(x => x.recipient).sort(), ['center', 'patient']);
  assert.equal(sends[0].description, 'Consulta inicial');
  assert.equal((await handler(request(key, 'Otra consulta'))).status, 409);
  await db.exec('reset role');
  for (const table of ['appointments', 'integration_outbox', 'patients']) assert.equal((await db.query(`select count(*)::int n from public.${table}`)).rows[0].n, 0);
  assert.equal((await db.query('select count(*)::int n from public.contact_requests')).rows[0].n, 1);
  assert.equal((await db.query("select count(*)::int n from public.contact_notifications where status='accepted'")).rows[0].n, 2);
  for (const role of ['anon', 'authenticated', 'service_role']) {
    for (const table of ['contact_requests', 'contact_notifications']) {
      for (const permission of ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) assert.equal((await db.query('select has_table_privilege($1,$2,$3) as ok', [role, `public.${table}`, permission])).rows[0].ok, false);
    }
    assert.equal((await db.query("select has_function_privilege($1, 'public.available_slots(uuid,date)', 'EXECUTE') as ok", [role])).rows[0].ok, false);
  }
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.contact_requests'), /permission denied/);
});

test('Notificaciones: claims, lease, backoff, limites y respuestas viejas', async t => {
  const db = new PGlite(); t.after(() => db.close());
  await db.exec(bootstrap + migration + rateMigration + contactMigration + fixture);
  const make = async (id = randomUUID()) => (await db.query(`select * from public.create_contact_request($1, '${service}', 'Paciente Prueba', '+5493834123456', 'Consulta', true)`, [id])).rows[0];
  const contact = await make();
  const claim = async () => (await db.query('select * from public.claim_contact_notifications($1)', [contact.id])).rows;
  const jobs = await claim(); assert.equal(jobs.length, 2); assert.equal((await claim()).length, 0);
  const finish = (job, result, id = null) => db.query('select public.finish_contact_notification($1,$2,$3,$4,$5)', [job.id, job.claim_token, result, id, result === 'accepted' ? null : 'HTTP_429']);
  await finish({ ...jobs[0], claim_token: randomUUID() }, 'accepted', 'wrong');
  assert.equal((await db.query('select status from public.contact_notifications where id=$1', [jobs[0].id])).rows[0].status, 'processing');
  await finish(jobs[0], 'retry'); assert.equal((await claim()).length, 0);
  await db.exec("update public.contact_notifications set available_at=now()-interval '1 second', claimed_at=now()-interval '3 minutes'");
  const retried = await claim(); assert.equal(retried.length, 1);
  assert.equal((await db.query('select status from public.contact_notifications where id=$1', [jobs[1].id])).rows[0].status, 'unknown');
  await db.query('update public.contact_notifications set attempts=5 where id=$1', [retried[0].id]);
  await finish(retried[0], 'retry'); assert.equal((await claim()).length, 0);
  await finish(jobs[1], 'accepted', 'late-valid-ack');
  assert.equal((await db.query('select status from public.contact_notifications where id=$1', [jobs[1].id])).rows[0].status, 'accepted');
  await db.query(`update public.services set active=false where id='${service}'`);
  await assert.rejects(make(), /SERVICE_NOT_FOUND/);
});
