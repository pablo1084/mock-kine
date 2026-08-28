import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function AlliancesSection({ hidden, items }) {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

  const showPrevious = React.useCallback(() => {
    setSelectedIndex((current) => (current - 1 + items.length) % items.length);
  }, [items.length]);

  const showNext = React.useCallback(() => {
    setSelectedIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  React.useEffect(() => {
    if (selectedIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedIndex(null);
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showPrevious, showNext]);

  return (
    <section id="alianzas-estrategicas" className={`${hidden ? 'hidden' : ''} border-y border-white/10 bg-graphiteSoft py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-pulse">Alianzas estratégicas</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">
          Crecemos junto a instituciones que comparten nuestro compromiso con la salud y el deporte.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
          Construimos vínculos que nos permiten conectar experiencia, formación y trabajo interdisciplinario para ofrecer un acompañamiento cada vez más completo.
        </p>

        <div className="alliances-marquee scrollbar-none mt-10 overflow-x-auto overflow-y-hidden touch-pan-x">
          <div className="alliances-track flex w-max">
            {[0, 1].map((group) => (
              <div key={group} className="alliances-group flex shrink-0" aria-hidden={group === 1 ? 'true' : undefined}>
                {items.map((item, index) => (
                  <button
                    key={`${group}-${item.id}`}
                    type="button"
                    className="group w-56 shrink-0 bg-transparent text-left sm:w-64 lg:w-96"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Ampliar imagen de ${item.title}`}
                    tabIndex={group === 1 ? -1 : undefined}
                  >
                    <div className="flex h-52 items-center justify-center p-1 sm:h-60 lg:h-72 lg:p-2">
                      <img src={item.src} alt={item.title} className="max-h-full max-w-full rounded-md border border-white/30 p-1 object-contain transition duration-500 group-hover:scale-105 group-hover:border-pulse" loading="lazy" decoding="async" />
                    </div>
                    <div className="px-3 pb-3 pt-2 text-center">
                      <span className="text-lg font-semibold text-white">{item.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-graphiteDark/95 p-4 backdrop-blur" onClick={() => setSelectedIndex(null)}>
          <button type="button" aria-label="Cerrar imagen" className="absolute right-4 top-4 rounded-md border border-white/20 p-2 text-white transition hover:border-pulse hover:text-pulse sm:right-8 sm:top-8" onClick={() => setSelectedIndex(null)}>
            <X size={22} />
          </button>

          <button type="button" aria-label="Imagen anterior" className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-pulse sm:left-8" onClick={(event) => { event.stopPropagation(); showPrevious(); }}>
            <ChevronLeft size={28} />
          </button>

          <figure className="flex max-h-[85vh] w-full max-w-5xl flex-col items-center bg-transparent p-5 sm:p-8" onClick={(event) => event.stopPropagation()}>
            <img src={items[selectedIndex].src} alt={items[selectedIndex].title} className="max-h-[68vh] max-w-full rounded-md border border-white/40 p-1 object-contain" decoding="async" />
            <figcaption className="mt-5 text-xl font-semibold text-white">{items[selectedIndex].title}</figcaption>
          </figure>

          <button type="button" aria-label="Imagen siguiente" className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-pulse sm:right-8" onClick={(event) => { event.stopPropagation(); showNext(); }}>
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </section>
  );
}
