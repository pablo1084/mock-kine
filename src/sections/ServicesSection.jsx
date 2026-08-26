import React from 'react';
import { Activity, Apple, Brain, ChevronLeft, ChevronRight, Dumbbell, Image, Maximize2, ShieldCheck, Target, Waves, X, Zap } from 'lucide-react';

const serviceIcons = {
  activity: Activity,
  shield: ShieldCheck,
  brain: Brain,
  apple: Apple,
  dumbbell: Dumbbell,
};

export function ServicesSection({ hidden, ivolutionGallery, services, stages, technologyServices }) {
  const ivolutionCarouselRef = React.useRef(null);
  const [mepVideoOpen, setMepVideoOpen] = React.useState(false);

  const scrollIvolutionGallery = (direction) => {
    const carousel = ivolutionCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.72,
      behavior: 'smooth',
    });
  };

  return (
    <section id="servicios" className={`${hidden ? 'hidden' : ''} bg-graphite py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Servicios</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              Kinesiología deportiva basada en evaluación, rehabilitación y rendimiento.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-white/72">
            Un abordaje integral para deportistas y personas activas, combinando datos objetivos, tratamiento kinésico, entrenamiento, salud integral y tecnología aplicada.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {stages.map((stage) => (
            <article key={stage.title} className="rounded-md border border-white/10 bg-white/8 p-6">
              <span className="text-sm font-semibold text-pulse">{stage.step}</span>
              <h3 className="mt-4 text-2xl font-semibold text-white">{stage.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{stage.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 overflow-hidden rounded-md border border-[#f3c635]/25 bg-[#070808] shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <span className="inline-flex items-center gap-2 rounded-md border border-[#f3c635]/45 bg-[#f3c635]/10 px-3 py-2 text-xs font-semibold uppercase text-[#f3c635]">
                <Zap size={15} /> Laboratorio exclusivo
              </span>
              <div className="mt-7 flex flex-col gap-3 sm:inline-flex sm:flex-row sm:items-end sm:gap-5">
                <div className="w-full max-w-[17rem] sm:max-w-xs">
                  <img
                    src="/assets/ivolution-lab/ivolution-logo.png"
                    alt="Ivolution"
                    className="h-auto w-full"
                  />
                </div>
                <p className="font-lab text-5xl font-semibold leading-none tracking-normal text-[#f3c635] drop-shadow-[4px_5px_0_rgba(0,0,0,0.35)] sm:text-6xl">
                  lab
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-white/48">
                  Lo que se puede medir, se puede mejorar.
                </p>
              </div>
              <h3 className="mt-7 text-4xl font-semibold leading-tight text-white">
                Evaluación deportiva con tecnología de alto rendimiento.
              </h3>
              <p className="mt-5 text-base leading-8 text-white/72">
                Un laboratorio pensado para medir fuerza, potencia, asimetrías y evolución con datos concretos. La información obtenida permite tomar mejores decisiones en rehabilitación, prevención y rendimiento.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {['Fuerza', 'Potencia', 'Asimetrías'].map((item) => (
                  <div key={item} className="rounded-md border border-[#f3c635]/18 bg-white/[0.06] p-4">
                    <Target className="text-[#f3c635]" size={20} />
                    <span className="mt-3 block text-sm font-semibold text-white">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold uppercase text-white/60">
                Representación regional del laboratorio en el NOA.
              </p>
            </div>
            <div className="relative min-h-80 overflow-hidden bg-[#101112]">
              <img
                src="/assets/ivolution-lab/lab1.jpg"
                alt="Evaluación deportiva en Ivolution Lab"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070808]/72 via-[#070808]/12 to-transparent" />
            </div>
          </div>

          <div className="border-t border-white/10 p-4 sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-[#f3c635]">Galería Ivolution Lab</p>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  aria-label="Ver imagen anterior"
                  onClick={() => scrollIvolutionGallery(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f3c635]/35 bg-white/8 text-[#f3c635] transition hover:bg-[#f3c635] hover:text-[#070808]"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Ver imagen siguiente"
                  onClick={() => scrollIvolutionGallery(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f3c635]/35 bg-white/8 text-[#f3c635] transition hover:bg-[#f3c635] hover:text-[#070808]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div ref={ivolutionCarouselRef} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
              {ivolutionGallery.map((item) => (
                <figure key={item.id} className="relative aspect-square min-w-[58%] max-w-[220px] shrink-0 snap-center overflow-hidden rounded-md border border-white/10 bg-black sm:min-w-[34%] sm:max-w-[240px] lg:aspect-[4/3] lg:min-w-0 lg:max-w-none lg:bg-white/[0.055]">
                  {item.src ? (
                    <img src={item.src} alt={item.label} className="h-full w-full object-contain lg:object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                      <Image className="text-[#f3c635]" size={28} />
                      <div>
                        <figcaption className="text-sm font-semibold text-white">{item.label}</figcaption>
                        <p className="mt-1 text-xs leading-5 text-white/48">Próxima imagen</p>
                      </div>
                    </div>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md border border-white/10 bg-white p-6 text-ink shadow-sm">
            <span className="text-sm font-semibold uppercase text-pulse">Tecnología terapéutica</span>
            <h3 className="mt-3 text-3xl font-semibold text-graphite">Ondas de choque y MEP ecoguiado</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {technologyServices.map((service) => (
                <article key={service.title} className="rounded-md border border-line p-5">
                  {service.title === 'Ondas de choque' ? <Waves className="text-pulse" size={26} /> : <Activity className="text-pulse" size={26} />}
                  <h4 className="mt-4 text-xl font-semibold text-graphite">{service.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{service.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-white/10 bg-[#070808] shadow-soft">
            <div className="p-5 sm:p-6">
              <span className="text-xs font-semibold uppercase text-pulse">Aplicación en consultorio</span>
              <p className="mt-2 text-2xl font-semibold text-white">Video MEP ecoguiado</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/72">
                Procedimiento guiado por ecografía para trabajar con precisión sobre tejidos específicos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Ecografía', 'Precisión', 'Tratamiento focalizado'].map((item) => (
                  <span key={item} className="rounded-md border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/78">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="relative aspect-video overflow-hidden rounded-md border border-white/12 bg-black shadow-[0_18px_45px_rgba(0,0,0,0.34)] ring-1 ring-white/5">
                <video
                  className="absolute inset-0 h-full w-full object-contain transition duration-500 sm:scale-[1.03] sm:object-cover sm:hover:scale-[1.045]"
                  src="/assets/mep-ecoguiado.mp4"
                  controls
                  controlsList="nofullscreen nodownload"
                  disablePictureInPicture
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(event) => { event.currentTarget.volume = 0.5; }}
                />
              </div>
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:border-pulse hover:text-pulse"
                onClick={() => setMepVideoOpen(true)}
              >
                Ver ampliado <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {mepVideoOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-graphiteDark/92 px-4 py-8 backdrop-blur" onClick={() => setMepVideoOpen(false)}>
            <div className="w-full max-w-3xl rounded-md border border-white/10 bg-[#070808] p-3 shadow-soft" onClick={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between gap-4 px-1">
                <div>
                  <p className="text-xs font-semibold uppercase text-pulse">MEP ecoguiado</p>
                  <p className="text-sm text-white/68">Vista ampliada</p>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar video"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/12 text-white transition hover:border-pulse hover:text-pulse"
                  onClick={() => setMepVideoOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <video
                className="max-h-[72vh] w-full rounded-md bg-black object-contain"
                src="/assets/mep-ecoguiado.mp4"
                controls
                controlsList="nofullscreen nodownload"
                disablePictureInPicture
                playsInline
                preload="metadata"
                onLoadedMetadata={(event) => { event.currentTarget.volume = 0.5; }}
              />
            </div>
          </div>
        )}

        <div className="mt-12">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-pulse">Áreas complementarias</p>
              <h3 className="mt-3 max-w-3xl text-3xl font-semibold text-white">Salud integral alrededor del movimiento.</h3>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/68">
              Profesionales y recursos que acompañan el proceso clínico, deportivo y de bienestar.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon, title, text }) => {
              const Icon = serviceIcons[icon];

              return (
                <article key={title} className="rounded-md border border-white/10 bg-white p-6 text-ink shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                  <Icon className="text-pulse" size={30} />
                  <h4 className="mt-5 text-xl font-semibold text-graphite">{title}</h4>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{text}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-12 rounded-md border border-white/10 bg-white/8 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Consulta especializada</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Evaluá, tratá y entrená con un plan pensado para tu objetivo.</h3>
          </div>
          <a href="#turnos" className="mt-5 inline-flex items-center justify-center rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 sm:mt-0">
            Solicitar turno
          </a>
        </div>
      </div>
    </section>
  );
}
