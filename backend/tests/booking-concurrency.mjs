// Integracion real, exclusivamente PostgreSQL local VACIO y descartable.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { bootstrap, migration, rateMigration, fixture, bookingSql, service } from './helpers/booking-db.mjs';

const url = new URL(process.env.BOOKING_TEST_DATABASE_URL || 'postgres://localhost/booking_audit_test');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'Solo PostgreSQL local');
assert.equal(url.pathname, '/booking_audit_test', 'Usar una base vacia llamada booking_audit_test');
const clients = [0, 1, 2].map(() => new pg.Client({ connectionString: url.href }));
const [setup, a, b] = clients;
try {
  await Promise.all(clients.map(c => c.connect()));
  assert.equal((await setup.query(`select count(*)::int as n from pg_tables
    where schemaname not in ('pg_catalog', 'information_schema')`)).rows[0].n, 0, 'La base debe estar vacia');
  await setup.query(bootstrap + migration + rateMigration + fixture);
  for (const scenario of [
    { name: 'ultimo cupo, sesiones en zonas distintas', capacity: 1, time: '09:00', same: false, ok: false },
    { name: 'horarios distintos superpuestos', capacity: 1, time: '09:30', same: false, ok: false },
    { name: 'capacidad dos: segundo cupo', capacity: 2, time: '09:00', same: false, ok: true },
    { name: 'capacidad dos: ultimo cupo simultaneo', capacity: 2, prefill: true, time: '09:00', same: false, ok: false },
    { name: 'retry simultaneo idempotente', capacity: 1, time: '09:00', same: true, ok: true },
  ]) {
    const svc = randomUUID();
    await setup.query(`insert into public.services(id, slug, name, duration_minutes, slot_interval_minutes, capacity)
      values ($1::uuid, $1::text, 'Concurrencia', 60, 30, $2)`, [svc, scenario.capacity]);
    await setup.query(`insert into public.service_schedules(service_id, weekday, start_time, end_time)
      select $1, d, '09:00', '14:00' from generate_series(0,6) d`, [svc]);
    const sql = (time) => bookingSql(time).replace(service, svc);
    if (scenario.prefill) await setup.query(sql('09:00'), [randomUUID()]);
    const key = randomUUID();
    await a.query("begin; set local timezone='UTC'; set local role service_role");
    const first = (await a.query(sql('09:00'), [key])).rows[0];
    await b.query("begin; set local timezone='Asia/Tokyo'; set local role service_role; set local statement_timeout='10s'");
    // Convertir rechazo en resultado inmediatamente para evitar unhandled rejection.
    const pending = b.query(sql(scenario.time), [scenario.same ? key : randomUUID()])
      .then(value => ({ value }), error => ({ error }));
    let waiting = false;
    for (let i = 0; i < 250; i++) {
      const r = await setup.query('select wait_event_type from pg_stat_activity where pid=$1', [b.processID]);
      if (r.rows[0]?.wait_event_type === 'Lock') { waiting = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.ok(waiting, 'La segunda conexion debe esperar el lock, no solo ejecutarse despues');
    await a.query('commit');
    const result = await pending;
    if (scenario.ok) {
      assert.ifError(result.error);
      if (scenario.same) assert.equal(result.value.rows[0].id, first.id);
      await b.query('commit');
    } else {
      assert.match(result.error?.message || '', /SLOT_UNAVAILABLE/);
      await b.query('rollback');
    }
    const expected = (scenario.prefill ? 1 : 0) + (scenario.ok && !scenario.same ? 2 : 1);
    assert.equal((await setup.query('select count(*)::int n from public.appointments where service_id=$1', [svc])).rows[0].n, expected);
    assert.equal((await setup.query(`select count(*)::int n from public.integration_outbox o
      join public.appointments a on a.id=o.appointment_id where a.service_id=$1`, [svc])).rows[0].n, expected * 3);
    console.log(`OK: ${scenario.name}`);
  }
  // Dos solicitudes intentan consumir simultaneamente la ultima unidad de cuota.
  const subject = randomUUID().replaceAll('-', '').repeat(2);
  const quotaSql = "select * from public.consume_booking_rate_limit('phone', $1)";
  await setup.query(quotaSql, [subject]); await setup.query(quotaSql, [subject]);
  await a.query('begin; set local role service_role');
  assert.equal((await a.query(quotaSql, [subject])).rows[0].allowed, true);
  await b.query("begin; set local role service_role; set local statement_timeout='10s'");
  const quotaPending = b.query(quotaSql, [subject]).then(value => ({ value }), error => ({ error }));
  let quotaWaiting = false;
  for (let i = 0; i < 250; i++) {
    const state = await setup.query('select wait_event_type from pg_stat_activity where pid=$1', [b.processID]);
    if (state.rows[0]?.wait_event_type === 'Lock') { quotaWaiting = true; break; }
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.ok(quotaWaiting);
  await a.query('commit');
  const quotaResult = await quotaPending;
  assert.ifError(quotaResult.error);
  assert.equal(quotaResult.value.rows[0].allowed, false);
  await b.query('commit');
  console.log('OK: cuota persistente concurrente');
} finally {
  await Promise.allSettled(clients.map(c => c.end()));
}
