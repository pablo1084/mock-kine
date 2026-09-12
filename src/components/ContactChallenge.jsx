import React from 'react';

let loading;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => { script.remove(); loading = undefined; reject(new Error('No pudimos cargar la verificación. Volvé a intentar.')); }, 15000);
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => { clearTimeout(timer); if (window.turnstile) resolve(window.turnstile); else { loading = undefined; script.remove(); reject(new Error('No pudimos cargar la verificación.')); } };
      script.onerror = () => { clearTimeout(timer); loading = undefined; script.remove(); reject(new Error('No pudimos cargar la verificación. Revisá tu conexión.')); };
      document.head.append(script);
    });
  }
  return loading;
}

export const ContactChallenge = React.forwardRef(function ContactChallenge({ siteKey }, ref) {
  const container = React.useRef(null);
  const widget = React.useRef(null);
  const pending = React.useRef(null);
  React.useEffect(() => () => {
    pending.current?.(new Error('Verificación cancelada.'));
    if (widget.current !== null) window.turnstile?.remove(widget.current);
    widget.current = null;
  }, []);
  React.useImperativeHandle(ref, () => ({
    async execute(requestId) {
      if (!siteKey) throw new Error('Las solicitudes online no están disponibles por el momento.');
      const turnstile = await loadTurnstile();
      if (!container.current) throw new Error('Verificación cancelada.');
      if (widget.current !== null) turnstile.remove(widget.current);
      return new Promise((resolve, reject) => {
        let done = false;
        const finish = (error, token) => {
          if (done) return; done = true; clearTimeout(timer); pending.current = null;
          if (error) reject(error); else resolve(token);
        };
        const timer = setTimeout(() => finish(new Error('La verificación venció. Volvé a intentar.')), 90000);
        pending.current = finish;
        try {
          widget.current = turnstile.render(container.current, {
            sitekey: siteKey, action: 'booking', cData: requestId, theme: 'light',
            callback: (token) => finish(null, token),
            'error-callback': () => finish(new Error('No pudimos verificar la solicitud. Volvé a intentar.')),
            'expired-callback': () => finish(new Error('La verificación venció. Volvé a intentar.')),
            'timeout-callback': () => finish(new Error('La verificación venció. Volvé a intentar.')),
          });
        } catch { finish(new Error('No pudimos iniciar la verificación.')); }
      });
    },
  }), [siteKey]);
  return <div ref={container} className="mt-4 overflow-x-auto" />;
});
