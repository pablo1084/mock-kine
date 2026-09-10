import React from 'react';
import { Activity, ArrowRight, Dumbbell, FlaskConical, Waves } from 'lucide-react';

const pillars = [
  { id: 'kinesiologia', icon: Activity, title: 'Kinesiología deportiva y rehabilitación', text: 'Lesiones, recuperación funcional y tratamiento personalizado.' },
  { id: 'laboratorio-ivolution', icon: FlaskConical, title: 'Evaluación funcional y del rendimiento', text: 'Ivolution Lab, fuerza, potencia, perfil de rendimiento y seguimiento.' },
  { id: 'readaptacion', icon: Dumbbell, title: 'Readaptación y entrenamiento', text: 'Fortalecimiento, reacondicionamiento, progresión y retorno a la actividad o al deporte.' },
  { id: 'tecnologia-aplicada', icon: Waves, title: 'Tecnología aplicada', text: 'Ondas de choque y MEP ecoguiado.' },
];

const pillarImages = {
  kinesiologia: '/assets/centro/gimnasio2.webp',
  readaptacion: '/assets/readaptacion-entrenamiento.webp',
  'tecnologia-aplicada': '/assets/ondas-tratamiento.webp',
};

export function ServicePillars({ onOpenServices }) {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      {pillars.map(({ id, icon: Icon, title, text }, index) => (
        <a key={id} href={`#${id}`} onClick={onOpenServices ? (event) => { event.preventDefault(); onOpenServices(id); } : undefined} className="group relative isolate flex flex-col overflow-hidden rounded-md border border-white/10 bg-graphiteDark p-6 transition hover:-translate-y-1 hover:border-pulse/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pulse sm:p-8">
          {pillarImages[id] && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={id === 'kinesiologia' ? { containerType: 'size' } : undefined}>
              <img
                src={pillarImages[id]}
                alt=""
                loading="lazy"
                decoding="async"
                style={id === 'kinesiologia' ? { position: 'absolute', left: '50%', top: '50%', width: '100cqh', height: '100cqw', maxWidth: 'none', transform: 'translate(-50%, -50%) rotate(-90deg) scale(1.15)', objectPosition: '55% 100%' } : id === 'readaptacion' ? { objectPosition: 'center 55%' } : undefined}
                className="h-full w-full object-cover object-bottom opacity-[0.35] saturate-[0.2] contrast-[1.05] transition-opacity duration-500 group-hover:opacity-[0.45] group-focus-visible:opacity-[0.45]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,24,27,0.8),rgba(21,24,27,0.25)_65%,rgba(21,24,27,0.5)),linear-gradient(0deg,#15181b,transparent_35%,transparent_65%,#15181b)]" />
            </div>
          )}
          <div className="flex items-center justify-between text-pulse"><Icon size={27} /><span className="text-sm font-semibold">0{index + 1}</span></div>
          <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">{text}</p>
          <div className="mt-auto flex items-center justify-between gap-4 pt-6">
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-pulse">Conocer más <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
            {id === 'laboratorio-ivolution' && (
              <img
                src="/assets/ivolution-lab/ivolution-logo.webp"
                alt="Ivolution"
                loading="lazy"
                decoding="async"
                className="mr-2 h-auto w-56 max-w-[50%] object-contain opacity-80 mix-blend-screen [clip-path:inset(3%_0.5%_3%_1%)] transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
