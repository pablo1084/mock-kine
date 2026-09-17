import React from 'react';

export function AlliancesSection({ hidden, items }) {
  return (
    <section id="alianzas-estrategicas" className={`${hidden ? 'hidden' : ''} border-y border-white/10 bg-graphiteSoft py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-pulse">Alianzas</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">
          Alianzas que amplían nuestra experiencia
        </h2>
        <p className="mt-5 text-base leading-8 text-white/72">
          Trabajamos con instituciones y profesionales vinculados al deporte, la formación y el alto rendimiento.
        </p>

        <div className="mt-10 grid grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
          {items.map((item) => (
            <figure key={item.id} className="min-w-0 text-center">
              <div className="mx-auto flex aspect-square w-full max-w-36 items-center justify-center overflow-hidden rounded-full border border-white bg-white p-1.5 sm:p-3">
                <img src={item.logoSrc} alt={`Logo de ${item.title}`} className="h-full w-full object-contain" loading="lazy" decoding="async" />
              </div>
              <figcaption className="mt-2 truncate text-[10px] font-semibold text-white sm:mt-3 sm:text-sm lg:text-base">{item.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
