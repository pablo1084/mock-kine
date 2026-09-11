import React from 'react';
import { Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react';
import { navItems } from '../data/siteContent';
import { getPublicConfig } from '../utils/api';
import { slug } from '../utils/slug';

export function SiteFooter({ hidden }) {
  const [channelUrl, setChannelUrl] = React.useState('');
  React.useEffect(() => {
    if (hidden) return undefined;
    let active = true;
    getPublicConfig().then((config) => {
      if (active) setChannelUrl(config.youtube?.channelUrl || '');
    }).catch(() => {});
    return () => { active = false; };
  }, [hidden]);
  return (
    <footer className={`${hidden ? 'hidden' : ''} bg-graphiteDark text-white`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <img
            src="/assets/LOGO-optimized.webp"
            alt="José Oviedo Kinesiología Deportiva"
            className="h-14 w-auto object-contain sm:h-16"
            loading="lazy"
            decoding="async"
          />

          <p className="mt-5 leading-7 text-white/70">
            Recuperación, prevención de lesiones y entrenamiento personalizado con un enfoque integral para mejorar tu calidad de vida.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-semibold">Navegación</h4>
          <ul className="space-y-3 text-white/70">
            {navItems.map((item) => (
              <li key={item}><a href={`#${slug(item)}`} className="hover:text-pulse">{item}</a></li>
            ))}
            <li><a href="#turnos" className="hover:text-pulse">Reservar</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-semibold">Servicios</h4>
          <ul className="space-y-3 text-white/70">
            <li>Kinesiología Deportiva</li>
            <li>Rehabilitación Física</li>
            <li>Ondas de Choque</li>
            <li>Gimnasio Personalizado</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-semibold">Seguinos</h4>
          <div className="flex gap-3">
            <a
              href="https://wa.me/5493834614543"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-green-600"
            >
              <MessageCircle size={22} />
            </a>
            <a
              href="https://www.instagram.com/joseoviedokinesiodeportiva/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-pink-600"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/share/19WbSaPrep/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar Facebook"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-blue-600"
            >
              <Facebook size={20} />
            </a>
            {channelUrl && (
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar YouTube"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-red-600"
              >
                <Youtube size={22} />
              </a>
            )}
          </div>

          <p className="mt-5 text-sm leading-6 text-white/70">
            Seguinos para conocer novedades, consejos de prevención y contenidos sobre salud y rehabilitación.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} José Oviedo Kinesiología. Todos los derechos reservados.</p>
          <a href="/politica-de-privacidad.html" className="transition hover:text-pulse">Política de privacidad</a>
        </div>
      </div>
    </footer>
  );
}
