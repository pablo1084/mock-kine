import { test, expect } from '@playwright/test';

const service = '00000000-0000-4000-8000-000000000001';
async function setup(page, failFirst = false, unavailable = false) {
  const sent = [];
  await page.route('https://**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'challenges.cloudflare.com') {
      return route.fulfill({ contentType: 'application/javascript', body: `window.turnstile={render:(node,opts)=>{setTimeout(()=>opts.callback(opts.cData+':test-token'),20);return 'widget';},remove:()=>{}};` });
    }
    if (url.hostname !== 'booking-test.example') return route.abort();
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type,idempotency-key', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (url.pathname === '/booking/services') return route.fulfill({ status: unavailable ? 503 : 200, headers, json: unavailable ? { error: { code: 'BOOKING_NOT_CONFIGURED' } } : { services: [{ id: service, name: 'Kinesiología deportiva' }] } });
    if (url.pathname === '/booking/requests') {
      sent.push({ body: route.request().postDataJSON(), key: route.request().headers()['idempotency-key'] });
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
  await page.getByRole('textbox', { name: 'Teléfono de WhatsApp' }).fill('+54 9 383 4123456');
  await page.getByRole('combobox', { name: 'Servicio', exact: true }).selectOption(service);
  await page.getByRole('textbox', { name: 'Breve descripción' }).fill('Quisiera una consulta');
  await page.getByRole('checkbox').check();
}
test('formulario sin fecha/hora: envia solo los datos pedidos y muestra recepcion', async ({ page }, info) => {
  const sent = await setup(page);
  const section = page.locator('#turnos');
  await expect(section.locator('input[type=date],input[type=time]')).toHaveCount(0);
  await expect(section.getByText('Horarios disponibles')).toHaveCount(0);
  await fill(page);
  await section.screenshot({ path: `test-results/contact-${info.project.name}.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
  await page.getByRole('button', { name: 'Reservar turno', exact: true }).click();
  await expect(section.getByRole('heading', { name: 'Recibimos tu solicitud' })).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(Object.keys(sent[0].body).sort()).toEqual(['description', 'full_name', 'phone', 'privacy_consent', 'service_id', 'turnstile_token'].sort());
  expect(sent[0].body.turnstile_token).toBe(sent[0].key + ':test-token');
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
