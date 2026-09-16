import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { bootstrap, migration, rateMigration, contactMigration, fixture, service } from './helpers/booking-db.mjs';

test('Politica 24h: desactivada en pruebas, bloqueo transaccional y ACL', async t => {
  const db = new PGlite(); t.after(() => db.close());
  const policy = await readFile(new URL('../supabase/migrations/20260914160000_contact_duplicate_policy.sql', import.meta.url), 'utf8');
  const descriptionLimit = await readFile(new URL('../supabase/migrations/20260916120000_contact_description_limit.sql', import.meta.url), 'utf8');
  await db.exec(bootstrap + migration + rateMigration + contactMigration + fixture + policy + descriptionLimit);
  const make = (id = randomUUID(), phone = '+543834320138', svc = service, description = 'Consulta') => db.query(
    'select * from public.create_contact_request($1,$2,$3,$4,$5,true)', [id, svc, 'Paciente Prueba', phone, description]);
  await make(); await make(); // testing unchanged
  assert.equal((await db.query('select count(*)::int n from public.contact_notifications')).rows[0].n, 4);
  await db.exec('update public.contact_request_policy set block_duplicates=true');
  await assert.rejects(make(), /CONTACT_ALREADY_REQUESTED/);
  assert.equal((await db.query('select count(*)::int n from public.contact_notifications')).rows[0].n, 4);
  const key = randomUUID();
  await make(key, '+543834123456');
  await make(key, '+543834123456'); // transport retry still idempotent
  await assert.rejects(make(randomUUID(), '+543834123456'), /CONTACT_ALREADY_REQUESTED/);
  const other = (await db.query("select id from public.services where id <> $1 limit 1", [service])).rows[0].id;
  await make(randomUUID(), '+543834320138', other);
  await db.exec("update public.contact_requests set created_at=now()-interval '24 hours 1 second'");
  await make(); // releases after rolling 24h
  await make(randomUUID(), '+543834123450', service, 'a'.repeat(400));
  await assert.rejects(make(randomUUID(), '+543834123451', service, 'a'.repeat(401)), /INVALID_INPUT/);
  for (const role of ['anon', 'authenticated', 'service_role']) {
    assert.equal((await db.query("select has_table_privilege($1,'public.contact_request_policy','UPDATE') ok", [role])).rows[0].ok, false);
  }
  await db.exec('set role service_role');
  await assert.rejects(make(), /CONTACT_ALREADY_REQUESTED/);
});
