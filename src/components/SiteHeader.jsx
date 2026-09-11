import React from 'react';
import { CalendarCheck, Menu, X } from 'lucide-react';
import { slug } from '../utils/slug';

const primaryItems = ['Servicios', 'Nuestro centro', 'Quienes somos'];
const labelFor = (item) => item === 'Quienes somos' ? 'Quiénes somos' : item;

export function SiteHeader({ menuOpen, navItems, onCloseMenu, onHomeSection, onOpenMenu }) {
  const headerRef = React.useRef(null);
  const toggleRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) onCloseMenu();
    };
    const closeWithEscape = (event) => {
      if (event.key === 'Escape') {
        onCloseMenu();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [menuOpen, onCloseMenu]);

  const navigate = (event) => {
    onHomeSection();
    onCloseMenu();
    const target = event.currentTarget.hash;
    window.requestAnimationFrame(() => {
      document.getElementById(target.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-graphiteDark/78 text-white backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
        <a href="#inicio" aria-label="José Oviedo, inicio" className="shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pulse" onClick={navigate}>
          <img src="/assets/navbar-logo-optimized.webp" alt="José Oviedo kinesiología deportiva" className="h-10 w-auto max-w-[120px] object-contain sm:h-12 sm:max-w-[170px]" />
        </a>

        <div className="flex items-center gap-2 sm:gap-4 lg:gap-7">
          <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm text-white/75 lg:flex">
            {primaryItems.map((item) => (
              <a key={item} href={`#${slug(item)}`} className="whitespace-nowrap rounded-sm py-2 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pulse" onClick={navigate}>
                {labelFor(item)}
              </a>
            ))}
          </nav>
          <a href="#turnos" onClick={navigate} className="hidden min-h-11 items-center gap-2 rounded-md bg-pulse px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pulse sm:inline-flex sm:px-4">
            Reservar <CalendarCheck size={16} className="hidden sm:block" />
          </a>
          <button ref={toggleRef} type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Más opciones de navegación'} aria-expanded={menuOpen} aria-controls="additional-navigation" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-pulse ${menuOpen ? 'bg-white/10 text-white' : 'text-white/75'}`} onClick={menuOpen ? onCloseMenu : onOpenMenu}>
            <span className="hidden sm:inline">Más</span>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav id="additional-navigation" aria-label="Más secciones" className="absolute right-4 top-[calc(100%+0.75rem)] max-h-[calc(100dvh-6rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-md border border-white/10 bg-graphiteDark p-3 shadow-2xl sm:right-6 lg:right-8">
            <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-white/40">Explorá el centro</p>
            {navItems.map((item) => (
              <a key={item} href={`#${slug(item)}`} className={`${primaryItems.includes(item) ? 'lg:hidden' : ''} block rounded-md px-3 py-3 text-sm text-white/80 transition hover:bg-white/5 hover:text-pulse focus-visible:outline focus-visible:outline-2 focus-visible:outline-pulse`} onClick={navigate}>
                {labelFor(item)}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
