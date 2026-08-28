import React from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

export function SiteFooter({ hidden }) {
  return (
    <footer className={`${hidden ? 'hidden' : ''} bg-graphiteDark text-white`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <img
            src="/assets/LOGO.png"
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
            <li><a href="#inicio" className="hover:text-pulse">Inicio</a></li>
            <li><a href="#servicios" className="hover:text-pulse">Servicios</a></li>
            <li><a href="#quienes-somos" className="hover:text-pulse">Sobre nosotros</a></li>
            <li><a href="#turnos" className="hover:text-pulse">Turnos Online</a></li>
            <li><a href="#contacto" className="hover:text-pulse">Contacto</a></li>
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
              href="https://wa.me/549383XXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-green-600"
            >
              <MessageCircle size={22} />
            </a>
            <a
              href="https://www.instagram.com/joseoviedokinesiodeportiva?igsi=dmk1YWRyM3JmNjJu"
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
          </div>

          <p className="mt-5 text-sm leading-6 text-white/70">
            Seguinos para conocer novedades, consejos de prevención y contenidos sobre salud y rehabilitación.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} José Oviedo Kinesiología. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
