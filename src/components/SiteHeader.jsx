import React from 'react';
import { CalendarCheck, Menu, X } from 'lucide-react';
import { slug } from '../utils/slug';

export function SiteHeader({ menuOpen, navItems, onCloseMenu, onHomeSection, onOpenMenu }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-graphiteDark/78 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3" onClick={onHomeSection}>
            <img src="/assets/navbar-logo.png" alt="José Oviedo kinesiología deportiva" className="h-12 w-auto object-contain" />
          </a>
          <nav className="hidden items-center gap-7 text-sm text-white/75 md:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${slug(item)}`} className="transition hover:text-white" onClick={onHomeSection}>
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#turnos"
            onClick={onHomeSection}
            className="hidden items-center gap-2 rounded-md bg-pulse px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pulse/20 transition hover:bg-orange-600 md:inline-flex"
          >
            Reservar <CalendarCheck size={16} />
          </a>
          <button aria-label="Abrir menu" className="rounded-md border border-white/15 p-2 md:hidden" onClick={onOpenMenu}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#15181b] text-white md:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <img src="/assets/LOGO.png" alt="José Oviedo kinesiología deportiva" className="h-14 w-auto object-contain" />
            <button aria-label="Cerrar menu" className="rounded-md border border-white/15 p-2" onClick={onCloseMenu}>
              <X size={20} />
            </button>
          </div>
          <nav className="grid gap-3 px-5 pt-6 text-2xl font-semibold">
            {[...navItems, 'Turnos'].map((item) => (
              <a
                key={item}
                href={`#${slug(item)}`}
                className="rounded-md border border-white/10 bg-white/8 px-4 py-4 text-white shadow-sm transition hover:bg-white/14"
                onClick={() => {
                  onHomeSection();
                  onCloseMenu();
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
