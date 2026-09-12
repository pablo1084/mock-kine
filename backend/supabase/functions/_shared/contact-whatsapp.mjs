export function whatsappConfig(env) {
  const config = {
    token: env('WHATSAPP_ACCESS_TOKEN'), phoneId: env('WHATSAPP_PHONE_NUMBER_ID'),
    version: env('WHATSAPP_GRAPH_VERSION'), centerPhone: env('WHATSAPP_CENTER_PHONE'),
    patientTemplate: env('WHATSAPP_PATIENT_TEMPLATE'), centerTemplate: env('WHATSAPP_CENTER_TEMPLATE'),
    language: env('WHATSAPP_TEMPLATE_LANGUAGE'), workerSecret: env('CONTACT_WORKER_SECRET'),
  };
  if (!config.token || !/^\d+$/.test(config.phoneId || '') || !/^v\d+\.0$/.test(config.version || '')
    || !/^\+[1-9]\d{7,14}$/.test(config.centerPhone || '')
    || !/^[a-z0-9_]{1,512}$/.test(config.patientTemplate || '')
    || !/^[a-z0-9_]{1,512}$/.test(config.centerTemplate || '')
    || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(config.language || '')
    || (config.workerSecret || '').length < 32) return null;
  return config;
}

export function createWhatsAppSender(config, fetchImpl = fetch) {
  return async (job) => {
    if (!['patient', 'center'].includes(job.recipient)) throw new Error('INVALID_RECIPIENT');
    const to = job.recipient === 'patient' ? job.phone : config.centerPhone;
    if (!/^\+[1-9]\d{7,14}$/.test(to)) throw new Error('INVALID_RECIPIENT');
    const template = { name: job.recipient === 'patient' ? config.patientTemplate : config.centerTemplate, language: { code: config.language } };
    if (job.recipient === 'center') {
      template.components = [{ type: 'body', parameters: [job.full_name, job.phone, job.service_name, job.description]
        .map(value => ({ type: 'text', text: value.replace(/\s+/g, ' ').trim() })) }];
    }
    let response;
    try {
      response = await fetchImpl(`https://graph.facebook.com/${config.version}/${config.phoneId}/messages`, {
        method: 'POST', headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: to.slice(1), type: 'template', template, biz_opaque_callback_data: job.id }),
        signal: AbortSignal.timeout(10000), redirect: 'error',
      });
    } catch { return { result: 'unknown', error: 'NETWORK_OR_TIMEOUT' }; }
    if (response.status === 429) return { result: 'retry', error: 'HTTP_429' };
    if (response.status >= 500) return { result: 'unknown', error: 'PROVIDER_5XX' };
    if (!response.ok) return { result: 'failed', error: 'PROVIDER_REJECTED' };
    let data;
    try { data = await response.json(); } catch { return { result: 'unknown', error: 'INVALID_PROVIDER_RESPONSE' }; }
    const id = data?.messages?.[0]?.id;
    return typeof id === 'string' && id.length > 0 && id.length <= 500
      ? { result: 'accepted', messageId: id }
      : { result: 'unknown', error: 'MISSING_MESSAGE_ID' };
  };
}

export function createContactDispatcher(backend, send, log = console.warn) {
  /** @param {string | null} contactId */
  return async (contactId = null) => {
    const jobs = await backend.claim(contactId);
    if (!Array.isArray(jobs) || jobs.length > 2) throw new Error('INVALID_CLAIM');
    const results = await Promise.allSettled(jobs.map(async (job) => {
      const outcome = await send(job);
      await backend.finish({ p_id: job.id, p_claim_token: job.claim_token, p_result: outcome.result,
        p_message_id: outcome.messageId || null, p_error_code: outcome.error || null });
    }));
    const errors = results.filter(result => result.status === 'rejected').length;
    if (errors) log(JSON.stringify({ event: 'contact_dispatch_incomplete', count: errors }));
    return { processed: jobs.length, errors };
  };
}

export function createContactWorker({ config, dispatch }) {
  return async (request) => {
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
    const reply = (status, data) => new Response(JSON.stringify(data), { status, headers });
    if (!config) return reply(503, { error: 'NOT_CONFIGURED' });
    if (request.method !== 'POST') return reply(405, { error: 'METHOD_NOT_ALLOWED' });
    const supplied = request.headers.get('authorization') || '';
    const digest = async (text) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
    const [a, b] = await Promise.all([digest(supplied), digest(`Bearer ${config.workerSecret}`)]);
    let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    if (diff !== 0) return reply(403, { error: 'FORBIDDEN' });
    try { return reply(200, await dispatch()); }
    catch { return reply(503, { error: 'DISPATCH_UNAVAILABLE' }); }
  };
}
