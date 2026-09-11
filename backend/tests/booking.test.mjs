import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { migration, bootstrap, fixture, service, admin, superadmin, user, daySql, startSql, bookingSql } from './helpers/booking-db.mjs';

test('Migracion de turnos: PostgreSQL, ACL y reglas de negocio', async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(bootstrap + migration + fixture);
  async function scenario(name, run) {
    await t.test(name, async () => {
      await db.exec('begin');
      try { await run(); } finally { await db.exec('rollback'); }
    });
  }
  const scalar = async (sql, params = []) => Object.values((await db.query(sql, params)).rows[0])[0];
  const book = async (time = '09:00', key = randomUUID()) => (await db.query(bookingSql(time), [key])).rows[0];
  const login = async (id) => {
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [id]);
    await db.exec('set local role authenticated');
  };
  const status = (id, value) => db.query('select * from public.set_appointment_status($1, $2)', [id, value]);
  await scenario('ultimo cupo y horarios superpuestos; extremos adyacentes permitidos', async () => {
    await book();
    await assert.rejects(book('09:30'), /SLOT_UNAVAILABLE/);
    // Un error aborta la transaccion: cada caso fallido termina aqui.
  });
  await scenario('horario adyacente disponible', async () => { await book(); await book('10:00'); });
  await scenario('capacidad > 1 usa pico simultaneo, no total de intersecciones', async () => {
    await db.exec(`update public.services set capacity=2 where id='${service}'`);
    await book('09:00'); await book('10:00'); await book('09:30');
    assert.equal(await scalar('select count(*)::int from public.appointments'), 3);
    await assert.rejects(book('09:30'), /SLOT_UNAVAILABLE/);
  });
  await scenario('horarios configurados superpuestos no duplican slots ni ocupacion', async () => {
    await db.exec(`insert into public.service_schedules(service_id, weekday, start_time, end_time)
      select '${service}', d, '09:00', '12:00' from generate_series(0,6) d`);
    const rows = (await db.query(`select * from public.available_slots('${service}', ${daySql})`)).rows;
    assert.equal(rows.length, 9);
    assert.ok(rows.every(r => r.available_capacity === 1));
  });
  for (const [name, from, to, svc] of [
    ['bloqueo parcial', '09:15', '09:45', `'${service}'`],
    ['bloqueo global de dia', '00:00', '24:00', 'null'],
  ]) await scenario(name, async () => {
    await db.exec(`insert into public.blocked_periods(service_id, starts_at, ends_at)
      values (${svc}, ${startSql(from)}, ${startSql(to)})`);
    await assert.rejects(book(), /SLOT_UNAVAILABLE/);
  });
  await scenario('servicio inactivo', async () => {
    await db.exec(`update public.services set active=false where id='${service}'`);
    await assert.rejects(book(), /SERVICE_NOT_FOUND/);
  });
  await scenario('idempotencia de reserva y outbox', async () => {
    const key = randomUUID(); const first = await book('09:00', key);
    assert.equal((await book('09:00', key)).id, first.id);
    assert.equal(await scalar('select count(*)::int from public.patients'), 1);
    assert.equal(await scalar('select count(*)::int from public.integration_outbox'), 3);
    await assert.rejects(book('10:00', key), /IDEMPOTENCY_CONFLICT/);
  });
  await scenario('telefono compartido no modifica identidad previa', async () => {
    const a = await book(); const b = await book('10:00'); assert.notEqual(a.patient_id, b.patient_id);
  });
  await scenario('timezone de sesion no altera disponibilidad ni idempotencia', async () => {
    const key = randomUUID(); const a = await book('09:00', key);
    const before = await scalar(`select count(*) from public.available_slots('${service}', ${daySql})`);
    await db.exec("set local timezone='Asia/Tokyo'");
    assert.equal((await book('09:00', key)).id, a.id);
    assert.equal(await scalar(`select count(*) from public.available_slots('${service}', ${daySql})`), before);
  });
  await scenario('admin confirma/cancela con auditoria y libera cupo', async () => {
    const a = await book(); await login(admin);
    await status(a.id, 'confirmed'); await status(a.id, 'confirmed'); await status(a.id, 'cancelled');
    assert.equal(await scalar('select count(*)::int from public.appointment_audit'), 3);
    assert.equal(await scalar("select actor_user_id from public.appointment_audit where action='updated' limit 1"), admin);
    await db.exec('reset role');
    assert.equal(await scalar('select count(*)::int from public.integration_outbox'), 9);
    await book();
  });
  await scenario('cancelacion terminal no puede reabrirse', async () => {
    const a = await book(); await login(admin); await status(a.id, 'cancelled');
    await assert.rejects(status(a.id, 'confirmed'), /INVALID_STATUS_TRANSITION/);
  });
  await scenario('no completar un turno futuro', async () => {
    const a = await book(); await login(admin); await status(a.id, 'confirmed');
    await assert.rejects(status(a.id, 'completed'), /APPOINTMENT_NOT_FINISHED/);
  });
  await scenario('usuario sin rol administrativo no ve pacientes ni cambia estados', async () => {
    const a = await book(); await login(user);
    assert.equal(await scalar('select count(*)::int from public.patients'), 0);
    await assert.rejects(status(a.id, 'confirmed'), /FORBIDDEN/);
  });
  await scenario('admin no puede promoverse', async () => {
    await login(admin);
    assert.equal((await db.query(`update public.profiles set role='superadmin' where user_id='${admin}' returning *`)).rows.length, 0);
  });
  await scenario('superadmin puede administrar roles', async () => {
    await login(superadmin);
    assert.equal((await db.query(`update public.profiles set role='admin' where user_id='${user}' returning *`)).rows[0].role, 'admin');
  });
  await scenario('perfil desactivado pierde permisos administrativos', async () => {
    const a = await book(); await db.exec(`update public.profiles set active=false where user_id='${admin}'`);
    await login(admin); await assert.rejects(status(a.id, 'confirmed'), /FORBIDDEN/);
  });
  await scenario('ACL explicitas aun con defaults Supabase permisivos', async () => {
    for (const role of ['anon', 'authenticated', 'service_role']) {
      for (const table of ['appointments', 'patients', 'appointment_audit', 'services', 'service_schedules', 'blocked_periods']) {
        for (const perm of ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'])
          assert.equal(await scalar('select has_table_privilege($1, $2, $3)', [role, `public.${table}`, perm]), false, `${role}:${table}:${perm}`);
      }
    }
    const funcs = (await db.query("select oid, proname from pg_proc where pronamespace='public'::regnamespace")).rows;
    for (const f of funcs) assert.equal(await scalar('select has_function_privilege($1, $2::oid, $3)', ['anon', f.oid, 'EXECUTE']), false, f.proname);
    assert.equal(await scalar("select has_function_privilege('service_role', 'public.available_slots(uuid,date)', 'EXECUTE')"), true);
    await db.exec('set local role anon');
    await assert.rejects(db.query('select * from public.appointments'), /permission denied/);
  });
  await scenario('service_role puede reservar exclusivamente via RPC', async () => {
    await db.exec('set local role service_role'); await book();
    await assert.rejects(db.exec('delete from public.appointments'), /permission denied/);
  });
  await scenario('consentimiento obligatorio', async () => {
    await assert.rejects(db.query(bookingSql().replace(', true)', ', false)'), [randomUUID()]), /INVALID_REQUEST/);
  });
  await scenario('rechazo libera cupo conservando historial', async () => {
    const a = await book(); await login(admin); await status(a.id, 'rejected');
    await db.exec('reset role'); await book();
    assert.equal(await scalar('select count(*)::int from public.appointments'), 2);
    assert.equal(await scalar('select count(*)::int from public.appointment_audit'), 3);
  });
  await scenario('confirmado finalizado puede completarse', async () => {
    const a = await book();
    await db.query("update public.appointments set starts_at=now()-interval '2h', ends_at=now()-interval '1h' where id=$1", [a.id]);
    await login(admin); await status(a.id, 'confirmed');
    assert.equal((await status(a.id, 'completed')).rows[0].status, 'completed');
  });
  await scenario('fallo de integracion no borra reserva ni duplica outbox al reintentar', async () => {
    const key = randomUUID(); const a = await book('09:00', key);
    // Simula resultado persistido por el futuro worker, no una llamada al proveedor.
    await db.exec("update public.integration_outbox set status='failed', attempts=1, last_error='PROVIDER_UNAVAILABLE'");
    assert.equal((await book('09:00', key)).id, a.id);
    assert.equal(await scalar("select count(*)::int from public.integration_outbox where status='failed'"), 3);
    assert.equal(await scalar('select status from public.appointments'), 'pending');
  });
  await scenario('funciones definer usan search_path vacio', async () => {
    const rows = (await db.query("select proname, proconfig from pg_proc where pronamespace='public'::regnamespace and prosecdef")).rows;
    assert.ok(rows.length > 0);
    assert.ok(rows.every(r => r.proconfig.includes('search_path=""')));
  });
  await scenario('telefono no E.164 rechazado', async () => {
    await assert.rejects(db.query(bookingSql().replaceAll('+5493834123456', 'abc12345678'), [randomUUID()]), /INVALID_PHONE/);
  });
  await scenario('horario fuera de grilla rechazado', async () => {
    await assert.rejects(book('09:01'), /SLOT_UNAVAILABLE/);
  });
  await scenario('aislamiento con snapshot antiguo rechazado', async () => {
    await db.exec('set transaction isolation level repeatable read');
    await assert.rejects(book(), /UNSUPPORTED_ISOLATION/);
  });
});
