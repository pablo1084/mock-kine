import { test, expect } from '@playwright/test';

const service = '00000000-0000-4000-8000-000000000001';
async function setup(page, failFirst = false, unavailable = false, challengeError = null, duplicate = false, catalog = [{ id: service, name: 'Kinesiología deportiva', slug: 'kinesiologia' }]) {
  const sent = [];
  await page.route('https://**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'challenges.cloudflare.com') {
      if (challengeError) return route.fulfill({ contentType: 'application/javascript', body: `window.turnstile={render:(node,opts)=>{setTimeout(()=>opts['error-callback'](${JSON.stringify(challengeError)}),20);return 'widget';},remove:()=>{}};` });
      return route.fulfill({ contentType: 'application/javascript', body: `window.turnstile={render:(node,opts)=>{setTimeout(()=>opts.callback(opts.cData+':test-token'),20);return 'widget';},remove:()=>{}};` });
    }
    if (url.hostname !== 'booking-test.example') return route.abort();
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type,idempotency-key', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (url.pathname === '/booking/services') return route.fulfill({ status: unavailable ? 503 : 200, headers, json: unavailable ? { error: { code: 'BOOKING_NOT_CONFIGURED' } } : { services: catalog } });
    if (url.pathname === '/booking/requests') {
      sent.push({ body: route.request().postDataJSON(), key: route.request().headers()['idempotency-key'] });
      if (duplicate) return route.fulfill({ status: 409, headers, json: { error: { code: 'CONTACT_ALREADY_REQUESTED' } } });
      if (failFirst && sent.length === 1) return route.fulfill({ status: 503, headers, json: { error: { code: 'BACKEND_UNAVAILABLE' } } });
      return route.fulfill({ headers, json: { request: { id: service, status: 'received' } } });
    }
    return route.fulfill({ headers, json: { youtube: { channelUrl: '' }, status: 'empty', videos: [], channelUrl: '' } });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#turnos').scrollIntoViewIfNeeded();
  return sent;
}
async function fill(page) {
  await page.getByRole('textbox', { name: 'Nombre y apellido', exact: true }).fill('Paciente Prueba');
  await page.getByRole('textbox', { name: 'Teléfono de WhatsApp' }).fill('3834123456');
  await page.getByRole('combobox', { name: 'Servicio', exact: true }).selectOption(service);
  await page.getByRole('textbox', { name: 'Descripción' }).fill('Quisiera una consulta');
  await page.getByRole('radio', { name: 'Sí', exact: true }).check();
  const particular = page.getByRole('radio', { name: 'Particular', exact: true });
  if (await particular.count()) await particular.check();
  await page.getByRole('checkbox', { name: 'Mañana', exact: true }).check();
  await page.getByRole('checkbox', { name: /Leí la política/ }).check();
}
test('especialidades directas muestran contacto sin formulario ni envio', async ({ page }) => {
  const catalog = ['Osteopatía','Nutrición','Psicología'].map((name,i) => ({id:String(i),name,contact_mode:'direct',contact_phone:i===0?'+543834320138':null}));
  const sent = await setup(page,false,false,null,false,catalog);
  for (const s of catalog) {
    await page.getByRole('combobox',{name:'Servicio',exact:true}).selectOption(s.id);
    await expect(page.getByRole('button',{name:'Reservar turno',exact:true})).toHaveCount(0);
    await expect(page.getByRole('textbox',{name:'Nombre y apellido',exact:true})).toHaveCount(0);
    if (s.contact_phone) {
      const whatsapp = page.getByRole('link', { name: `Contactar por WhatsApp al ${s.contact_phone}` });
      await expect(whatsapp).toHaveAttribute('href', `https://wa.me/${s.contact_phone.replace(/\D/g, '')}`);
      await expect(whatsapp).toHaveAttribute('target', '_blank');
    }
    else await expect(page.getByText('Próximamente publicaremos aquí el número de contacto para este servicio.')).toBeVisible();
  }
  expect(sent).toHaveLength(0);
});
test('entrenamiento exige plan y envia el identificador del plan mensual', async ({ page }) => {
  const plan = '00000000-0000-4000-8000-000000000002';
  const sent = await setup(page,false,false,null,false,[{id:service,name:'Entrenamiento',contact_mode:'group'}, {id:plan,name:'Entrenamiento mensual: 2 veces por semana',parent_id:service,contact_mode:'request'}]);
  await fill(page);
  await page.getByRole('button',{name:'Reservar turno',exact:true}).click();
  expect(sent).toHaveLength(0);
  await page.getByRole('combobox',{name:'Plan mensual de entrenamiento'}).selectOption(plan);
  await page.getByRole('button',{name:'Reservar turno',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Recibimos tu solicitud',exact:true})).toBeVisible();
  expect(sent[0].body.service_id).toBe(plan);
});
test('solo kinesiología permite elegir obra social', async ({ page }) => {
  const particularService = '00000000-0000-4000-8000-000000000003';
  await setup(page, false, false, null, false, [
    { id: service, name: 'Kinesiología', slug: 'kinesiologia' },
    { id: particularService, name: 'Recovery', slug: 'recovery' },
  ]);
  const selector = page.getByRole('combobox', { name: 'Servicio', exact: true });
  await selector.selectOption(particularService);
  await expect(page.getByText('Recordá que este servicio se brinda únicamente de forma particular.')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Obra social', exact: true })).toHaveCount(0);
  await selector.selectOption(service);
  await expect(page.getByRole('radio', { name: 'Obra social', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Particular', exact: true })).toBeVisible();
});
test('solicitud repetida informa bloqueo de 24 horas por pantalla', async ({ page }) => {
  await setup(page, false, false, null, true);
  await fill(page);
  await page.getByRole('button', { name: 'Reservar turno', exact: true }).click();
  await expect(page.locator('#turnos').getByRole('alert')).toContainText('Ya recibimos tu solicitud para este servicio en las últimas 24 horas');
  await expect(page.getByRole('heading', { name: 'Recibimos tu solicitud', exact: true })).toHaveCount(0);
});
test('error de Turnstile muestra codigo sin enviar solicitud y conserva datos', async ({ page }) => {
  const sent = await setup(page, false, false, '110200');
  await fill(page);
  await page.getByRole('button', { name: 'Reservar turno', exact: true }).click();
  await expect(page.locator('#turnos').getByRole('alert')).toContainText('Código Turnstile: 110200');
  await expect(page.getByRole('textbox', { name: 'Nombre y apellido', exact: true })).toHaveValue('Paciente Prueba');
  expect(sent).toHaveLength(0);
});
test('formulario sin fecha/hora: envia solo los datos pedidos y muestra recepcion', async ({ page }, info) => {
  const sent = await setup(page);
  const section = page.locator('#turnos');
  await expect(section.getByRole('textbox', { name: 'Descripción' })).toHaveAttribute('maxlength', '120');
  await expect(section.getByText('Máximo 120 caracteres.')).toBeVisible();
  await expect(section.getByRole('checkbox', { name: /Leí la política/ })).toHaveAttribute('required', '');
  await expect(section.getByRole('link', { name: 'política de privacidad' })).toHaveAttribute('href', '/politica-de-privacidad.html');
  await expect(section.locator('input[type=date],input[type=time]')).toHaveCount(0);
  await expect(section.getByText('Horarios disponibles')).toHaveCount(0);
  await fill(page);
  await section.screenshot({ path: `test-results/contact-${info.project.name}.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
  await page.getByRole('button', { name: 'Reservar turno', exact: true }).click();
  await expect(section.getByRole('heading', { name: 'Recibimos tu solicitud' })).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(Object.keys(sent[0].body).sort()).toEqual(['coverage', 'description', 'full_name', 'health_insurance', 'phone', 'privacy_consent', 'service_id', 'turnstile_token'].sort());
  expect(sent[0].body.turnstile_token).toBe(sent[0].key + ':test-token');
  expect(sent[0].body.description).toContain('Indicación médica: Sí | Atención: Particular | Disponibilidad: Mañana');
  await expect(section.getByRole('button', { name: 'Reservar turno', exact: true })).toHaveCount(0);
});
test('error preserva datos y reintento conserva clave de idempotencia', async ({ page }) => {
  const sent = await setup(page, true); await fill(page);
  const button = page.getByRole('button', { name: 'Reservar turno', exact: true });
  await button.click();
  await expect(page.locator('#turnos').getByRole('alert')).toContainText('No pudimos comprobar');
  await expect(page.getByRole('textbox', { name: 'Nombre y apellido', exact: true })).toHaveValue('Paciente Prueba');
  await button.click(); await expect(page.getByRole('heading', { name: 'Recibimos tu solicitud' })).toBeVisible();
  expect(sent).toHaveLength(2); expect(sent[0].key).toBe(sent[1].key);
});
test('servicio sin configurar nunca muestra exito ni permite enviar', async ({ page }) => {
  const sent = await setup(page, false, true);
  await expect(page.locator('#turnos').getByRole('alert')).toContainText('No pudimos cargar');
  await expect(page.getByRole('button', { name: 'Reservar turno', exact: true })).toBeDisabled();
  expect(sent).toHaveLength(0);
});
