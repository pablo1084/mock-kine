import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { bootstrap, migration, rateMigration, contactMigration } from './helpers/booking-db.mjs';

test('Catalogo: especialidades directas no crean solicitudes ni mensajes; planes mensuales validos', async t => {
  const db = new PGlite(); t.after(() => db.close());
  const policy = await readFile(new URL('../supabase/migrations/20260914160000_contact_duplicate_policy.sql', import.meta.url), 'utf8');
  const catalog = await readFile(new URL('../supabase/migrations/20260914180000_service_contact_modes.sql', import.meta.url), 'utf8');
  await db.exec(bootstrap + migration + rateMigration + contactMigration + policy + catalog);
  const rows = (await db.query('select * from public.services where active order by display_order')).rows;
  assert.equal(rows.filter(x => !x.parent_id).length, 8);
  assert.equal(rows.filter(x => x.parent_id).length, 2);
  await db.exec('set role service_role');
  const create = id => db.query('select * from public.create_contact_request($1,$2,$3,$4,$5,true)', [randomUUID(),id,'Paciente Test','+543834320138','Consulta']);
  for (const s of rows.filter(x => x.contact_mode !== 'request')) await assert.rejects(create(s.id), /SERVICE_DIRECT_CONTACT/);
  await db.exec('reset role');
  assert.equal((await db.query('select count(*)::int n from public.contact_notifications')).rows[0].n, 0);
  for (const s of rows.filter(x => x.parent_id)) await create(s.id);
  assert.equal((await db.query('select count(*)::int n from public.contact_notifications')).rows[0].n, 4);
  const names = (await db.query('select service_name from public.contact_requests')).rows.map(x => x.service_name);
  assert.ok(names.some(x => x.includes('2 veces'))); assert.ok(names.some(x => x.includes('3 veces')));
  assert.equal((await db.query('select block_duplicates from public.contact_request_policy')).rows[0].block_duplicates, false);
});
