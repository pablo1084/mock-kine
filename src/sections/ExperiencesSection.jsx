import React from 'react';
export function ExperiencesSection({ hidden }) {
  return (
    <section id="experiencias" className={`${hidden ? 'hidden' : ''} mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8`}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-pulse">Experiencias</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">Historias y vivencias de pacientes del centro.</h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-white/68">Sección preparada para sumar testimonios, casos o contenido audiovisual.</p>
      </div>
    </section>
  );
}
