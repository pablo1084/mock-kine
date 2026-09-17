import React from 'react';
import { Apple, ArrowLeft, Brain, Maximize2, ShieldCheck, Waves, X, Zap } from 'lucide-react';

const serviceIcons = {
  shield: ShieldCheck,
  brain: Brain,
  apple: Apple,
};

const complementaryProfessionalIds = {
  'Osteopatía': 'osteopata',
  'Psicología': 'psicologo',
  'Nutrición': 'nutricionista',
};

const complementaryImages = {
  'Osteopatía': {
    src: '/assets/osteopata/osteopata2-web-optimized.webp',
    alt: 'Pablo Villafañe durante una sesión de osteopatía',
  },
  'Psicología': {
    src: '/assets/equipo/psico1-optimized.webp',
    alt: 'Ezequiel Vera trabajando en el consultorio de psicología',
  },
};

export function ServicesSection({ hidden, targetId, onBack, onRequestAppointment, services, stages, technologyServices, teamMembers }) {
  React.useEffect(() => {
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [targetId]);

  const mepInlineVideoRef = React.useRef(null);
  const mepModalVideoRef = React.useRef(null);
  const [mepVideoOpen, setMepVideoOpen] = React.useState(false);
  const [isTabletUp, setIsTabletUp] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateViewport = () => setIsTabletUp(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  const openMepVideo = () => {
    const inlineVideo = mepInlineVideoRef.current;
    if (inlineVideo) inlineVideo.pause();
    setMepVideoOpen(true);
  };

  const closeMepVideo = () => {
    if (mepModalVideoRef.current) mepModalVideoRef.current.pause();
    setMepVideoOpen(false);
  };

  React.useEffect(() => {
    const inlineVideo = mepInlineVideoRef.current;
    const modalVideo = mepModalVideoRef.current;
    if (!mepVideoOpen || !modalVideo) return;
    if (inlineVideo) modalVideo.currentTime = inlineVideo.currentTime;
    modalVideo.volume = 0.5;
    modalVideo.play().catch(() => {});
  }, [mepVideoOpen]);

  return (
    <section className={`${hidden ? 'hidden' : ''} bg-graphite pb-20 pt-32`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button type="button" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-pulse" onClick={onBack}>
          <ArrowLeft size={17} /> Volver al inicio
        </button>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Servicios</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">Cuatro pilares para acompañar tu recuperación y rendimiento.</h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-white/72">Un abordaje integral para deportistas y personas activas, combinando datos objetivos, tratamiento kinésico, entrenamiento, salud integral y tecnología aplicada.</p>
        </div>

        <section id="kinesiologia" aria-labelledby="kinesiologia-title" className="mt-14 scroll-mt-28 rounded-md border border-white/10 bg-graphiteDark p-6 sm:p-8 lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase text-pulse">01 · Recuperar movimiento</p>
              <h3 id="kinesiologia-title" className="mt-3 text-3xl font-semibold text-white">Kinesiología deportiva y rehabilitación</h3>
              <p className="mt-5 text-base leading-8 text-white/72">Un tratamiento personalizado que parte de la evaluación de la lesión, las necesidades y los objetivos de cada persona.</p>
              <p className="mt-4 text-sm leading-7 text-white/68">Integramos recuperación funcional, ejercicio terapéutico y seguimiento de la evolución para acompañar el regreso a las actividades cotidianas y deportivas.</p>
            </div>
            <div className="group mx-auto aspect-[5/4] w-full max-w-[18rem] overflow-hidden rounded-md border border-white/10 bg-graphiteSoft shadow-soft sm:max-w-[24rem] lg:ml-auto lg:mr-0">
              <img src="/assets/IMG-20260914-WA0057-optimized.webp" alt="Una entrenadora supervisa a dos pacientes mientras realizan ejercicios en el centro" loading="lazy" decoding="async" className="h-full w-full translate-x-[11%] scale-[1.38] object-cover object-[42%_62%] transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.43]" width="1600" height="1200" />
            </div>
          </div>
        </section>

        <div id="laboratorio-ivolution" className="mt-14 scroll-mt-28 overflow-hidden rounded-md border border-pulse/25 bg-[#070808] shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase text-pulse">02 · Medir para decidir</p>
              <div className="mt-7 flex flex-col gap-3 sm:inline-flex sm:flex-row sm:items-end sm:gap-5">
                <div className="w-full max-w-[17rem] sm:max-w-xs"><img src="/assets/ivolution-lab/ivolution-logo.webp" alt="Ivolution" className="h-auto w-full" /></div>
                <p className="font-lab text-5xl font-semibold leading-none tracking-normal text-pulse drop-shadow-[4px_5px_0_rgba(0,0,0,0.35)] sm:relative sm:bottom-[20px] sm:text-6xl">lab</p>
              </div>
              <h4 className="mt-4 text-4xl font-semibold leading-tight text-white">Evaluación deportiva con tecnología de alto rendimiento.</h4>
              <p className="mt-5 text-base leading-8 text-white/72">Ivolution Lab es nuestra unidad de evaluación objetiva. Medimos fuerza, potencia y asimetrías para construir un perfil de rendimiento que orienta las decisiones y permite seguir la evolución. Estos datos ayudan a planificar la rehabilitación, prevenir lesiones y mejorar el rendimiento.</p>
              <br/>
              <p className="mt-6 text-base font-semibold uppercase leading-7 text-white/70 sm:text-lg">Representación regional del laboratorio en el NOA.</p>
            </div>
            <div className="group mx-auto aspect-[2/3] w-full max-w-[12.5rem] overflow-hidden rounded-md border border-white/10 bg-graphiteSoft shadow-soft sm:max-w-[21rem] lg:my-auto">
              <img src="/assets/ivolution-lab/lab1-optimized.webp" alt="Evaluación deportiva en Ivolution Lab" className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.045]" />
            </div>
          </div>
        </div>

        <section id="readaptacion" aria-labelledby="readaptacion-title" className="mt-14 scroll-mt-28 rounded-md border border-white/10 bg-graphiteDark p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase text-pulse">03 · Volver a la actividad</p>
          <h3 id="readaptacion-title" className="mt-3 text-3xl font-semibold text-white">Readaptación y entrenamiento</h3>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">El puente entre rehabilitación y rendimiento. Trabajamos el fortalecimiento, el reacondicionamiento y la progresión de cargas de acuerdo con las demandas de cada actividad o deporte.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {stages.map((stage) => (
              <article key={stage.title} className="rounded-md border border-white/10 bg-white/5 p-5">
                <span className="text-sm font-semibold text-pulse">{stage.step}</span>
                <h4 className="mt-3 text-xl font-semibold text-white">{stage.title}</h4>
                <p className="mt-3 text-sm leading-7 text-white/68">{stage.text}</p>
              </article>
            ))}
          </div>

          <div id="recovery" className="mt-10 overflow-hidden rounded-md border border-white/10 bg-white/5">
            <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_21rem]">
              <div>
                <p className="text-sm font-semibold uppercase text-pulse">Recovery</p>
                <h4 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Recuperación y descarga</h4>
                <p className="mt-4 text-sm leading-7 text-white/70">Estrategias de recuperación para complementar el entrenamiento y la readaptación. La compresión neumática secuencial se utiliza como herramienta de recuperación, favoreciendo el retorno venoso y proporcionando una sensación de descarga en miembros inferiores.</p>
              </div>
              <div className="group mx-auto w-full max-w-[21rem] overflow-hidden rounded-md border border-white/10">
                <img src="/assets/recovery.png" alt="Sesión de recuperación con sistema de compresión neumática en miembros inferiores" width="1086" height="1448" className="h-auto w-full transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.035]" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </section>

        <section id="tecnologia-aplicada" aria-labelledby="tecnologia-title" className="mt-14 scroll-mt-28 rounded-md border border-white/10 bg-graphiteDark p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase text-pulse">04 · Herramientas al servicio del tratamiento</p>
          <h3 id="tecnologia-title" className="mt-3 text-3xl font-semibold text-white">Tecnología aplicada</h3>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">Ondas de choque y MEP ecoguiado se integran al plan de tratamiento según la evaluación y las necesidades de cada paciente.</p>
          <div className="relative mt-8 grid gap-x-16 gap-y-6 border-t border-white/10 pt-8 lg:grid-cols-2">
            <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 top-8 hidden border-l border-white/10 lg:block" />
            <div id="ondas-de-choque" className="order-1 scroll-mt-28">
              <span className="text-sm font-semibold uppercase text-pulse">Tecnología terapéutica</span>
              <h4 className="mt-3 flex items-center gap-3 text-3xl font-semibold text-white"><Waves className="shrink-0 text-pulse" size={26} /> Ondas de choque</h4>
              <p className="mt-4 text-sm leading-7 text-white/70">{technologyServices.find((service) => service.title === 'Ondas de choque')?.text}</p>
            </div>
            <div className="order-3 border-t border-white/10 pt-8 lg:order-2 lg:border-0 lg:pt-0">
              <span className="text-sm font-semibold uppercase text-pulse">Aplicación en consultorio</span>
              <h4 className="mt-3 text-3xl font-semibold text-white">MEP ecoguiado de precisión</h4>
              <p className="mt-4 text-sm leading-7 text-white/70">Procedimiento guiado por ecografía para trabajar con precisión sobre tejidos específicos.</p>
              <div className="mt-3 flex flex-wrap justify-start gap-2">
                {['Ecografía', 'Precisión', 'Tratamiento focalizado'].map((item) => (
                  <span key={item} className="rounded-md border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/78">{item}</span>
                ))}
              </div>
            </div>
            <div className="order-2 lg:order-3">
              <div className="group mx-auto w-full max-w-[21rem] overflow-hidden rounded-md border border-white/10">
                <img src="/assets/ondas-choque-optimized.webp" alt="Aplicación de ondas de choque en la rodilla de un paciente" width="946" height="1200" className="h-auto w-full transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.045]" loading="lazy" decoding="async" />
              </div>
            </div>
            <div className="order-4">
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[15rem] overflow-hidden rounded-md border border-white/12 bg-black shadow-[0_18px_45px_rgba(0,0,0,0.34)] ring-1 ring-white/5">
                <video ref={mepInlineVideoRef} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:hover:scale-[1.025]" src="/assets/mep-ecoguiado.mp4" controls controlsList={isTabletUp ? 'nofullscreen nodownload' : 'nodownload'} disablePictureInPicture playsInline preload="metadata" onLoadedMetadata={(event) => { event.currentTarget.volume = 0.5; }} />
              </div>
              <div className="mt-4 hidden justify-center md:flex">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:border-pulse hover:text-pulse" onClick={openMepVideo}>Ver ampliado <Maximize2 size={16} /></button>
              </div>
            </div>
          </div>
        </section>

        {mepVideoOpen && (
          <div className="fixed inset-0 z-[70] hidden items-center justify-center bg-graphiteDark/92 px-4 py-8 backdrop-blur md:flex" onClick={closeMepVideo}>
            <div className="w-full max-w-3xl rounded-md border border-white/10 bg-[#070808] p-3 shadow-soft" onClick={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between gap-4 px-1">
                <div><p className="text-xs font-semibold uppercase text-pulse">MEP ecoguiado</p><p className="text-sm text-white/68">Vista ampliada</p></div>
                <button type="button" aria-label="Cerrar video" className="flex h-10 w-10 items-center justify-center rounded-md border border-white/12 text-white transition hover:border-pulse hover:text-pulse" onClick={closeMepVideo}><X size={18} /></button>
              </div>
              <video ref={mepModalVideoRef} className="max-h-[72vh] w-full rounded-md bg-black object-contain" src="/assets/mep-ecoguiado.mp4" controls controlsList="nofullscreen nodownload" disablePictureInPicture autoPlay playsInline preload="metadata" onLoadedMetadata={(event) => { event.currentTarget.volume = 0.5; }} />
            </div>
          </div>
        )}

        <section aria-labelledby="complementary-areas-title" className="mt-14 overflow-hidden rounded-md border border-white/15 bg-[#e9e7e3] p-5 shadow-soft sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-pulse">Áreas complementarias</p>
              <h3 id="complementary-areas-title" className="mt-3 max-w-3xl text-3xl font-semibold text-graphite">Salud integral alrededor del movimiento.</h3>
            </div>
            <p className="max-w-md text-sm leading-7 text-neutral-600">Profesionales y recursos que acompañan el proceso clínico, deportivo y de bienestar.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {services.filter((service) => service.icon !== 'activity').map(({ icon, title, text }) => {
              const Icon = serviceIcons[icon];
              const professional = teamMembers.find((member) => member.id === complementaryProfessionalIds[title]);
              const image = complementaryImages[title];
              return (
                <article key={title} className="flex h-full flex-col rounded-md border border-black/5 bg-white p-5 text-ink shadow-sm sm:p-6">
                  <div className="flex items-center gap-3"><Icon className="shrink-0 text-pulse" size={30} /><h4 className="text-xl font-semibold text-graphite">{title}</h4></div>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">{text}</p>
                  <div className="mt-6 border-l-2 border-pulse pl-4"><p className="font-semibold text-graphite">{professional.name}</p><p className="mt-1 text-sm text-neutral-600">{title} · Equipo de salud integral</p></div>
                  <div className="group mt-6 aspect-[2/3] w-full overflow-hidden rounded-md">
                    {image ? (
                      <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.045]" loading="lazy" decoding="async" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed border-[#c7c3bc] bg-[#f5f3ef] px-4 text-center text-sm text-neutral-500">Espacio para imagen de {title.toLowerCase()}</div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-12 rounded-md border border-white/10 bg-white/8 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div><p className="text-sm font-semibold uppercase text-pulse">Consulta especializada</p><h3 className="mt-2 text-2xl font-semibold text-white">Evaluá, tratá y entrená con un plan pensado para tu objetivo.</h3></div>
          <a href="#turnos" onClick={(event) => { event.preventDefault(); onRequestAppointment(); }} className="mt-5 inline-flex items-center justify-center rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 sm:mt-0">Solicitar turno</a>
        </div>
      </div>
    </section>
  );
}
