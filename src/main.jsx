import React from 'react';
import { createRoot } from 'react-dom/client';
import fachada from "/assets/fachada.jpg";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  Dumbbell,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
  Mail,
  Clock3,
  Instagram,
  Facebook,
  MessageCircle,
} from 'lucide-react';
import './styles.css';

const HERO_VIDEO_SPEED = 0.45;

function useSlowVideo(speed = HERO_VIDEO_SPEED) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = speed;
    }
  }, [speed]);

  return ref;
}

const services = [
  {
    icon: Activity,
    title: 'Kinesiología deportiva',
    text: 'Evaluación, tratamiento y readaptación para atletas y personas activas que buscan volver con confianza.',
  },
  {
    icon: ShieldCheck,
    title: 'Rehabilitación',
    text: 'Planes progresivos para lesiones musculares, articulares, post quirúrgicos y dolor persistente.',
  },
  {
    icon: Waves,
    title: 'Ondas de choque',
    text: 'Tecnología aplicada a tendinopatías, fascitis, espolón calcáneo y cuadros crónicos seleccionados.',
  },
  {
    icon: Dumbbell,
    title: 'Gimnasio personalizado',
    text: 'Rutinas supervisadas, fuerza, movilidad y control de cargas con objetivos medibles.',
  },
];

const gallery = [
  {
    src: '/assets/centro-gimnasio.jpg',
    title: 'Área de rehabilitación y entrenamiento',
  },
  {
    src: '/assets/equipo.jpg',
    title: 'Nuestro equipo profesional',
  },
  {
    src: '/assets/readaptacion.jpg',
    title: 'Readaptación deportiva',
  },
  {
    src: '/assets/boxes.jpg',
    title: 'Consultorios de atención',
  },
  {
    src: '/assets/moderno.jpg',
    title: 'Espacios modernos y confortables',
  },
  {
    src: '/assets/atencion.jpg',
    title: 'Atención Personalizada',
  },
];

const slots = ['08:30', '10:00', '12:30', '15:00', '17:30', '19:00'];

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState('10:00');
  const heroVideoRef = useSlowVideo();

  const navItems = ['Inicio', 'Quienes somos', 'Servicios', 'Nuestro centro', 'Alianzas estratégicas', 'Experiencias'];

  return (
    <main className="min-h-screen bg-graphite text-white font-sans">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-graphiteDark/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3">
            <img src="/assets/logo-icon.jpg" alt="" className="h-10 w-10 rounded-md object-cover" />
            <div className="leading-tight">
              <span className="block text-sm font-semibold uppercase">José Oviedo</span>
              <span className="block text-xs text-white/65">Kinesiología</span>
            </div>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-white/75 md:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${slug(item)}`} className="transition hover:text-white">
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#turnos"
            className="hidden items-center gap-2 rounded-md bg-pulse px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pulse/20 transition hover:bg-orange-600 md:inline-flex"
          >
            Reservar <CalendarCheck size={16} />
          </a>
          <button
            aria-label="Abrir menu"
            className="rounded-md border border-white/15 p-2 md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#15181b] text-white md:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-semibold uppercase">José Oviedo Kinesiología</span>
            <button aria-label="Cerrar menu" className="rounded-md border border-white/15 p-2" onClick={() => setMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="grid gap-3 px-5 pt-6 text-2xl font-semibold">
            {[...navItems, 'Turnos'].map((item) => (
              <a key={item} href={`#${slug(item)}`} className="rounded-md border border-white/10 bg-white/8 px-4 py-4 text-white shadow-sm transition hover:bg-white/14" onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}

      <section id="inicio" className="relative overflow-hidden bg-graphite pt-24 text-white">
        <div className="absolute inset-0">
          <video ref={heroVideoRef} className="hero-video h-full w-full object-cover" src="/assets/centro2.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" onLoadedMetadata={(event) => { event.currentTarget.playbackRate = HERO_VIDEO_SPEED; }} />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/82 to-graphite/20" />
          <div className="hero-video-texture" />
        </div>
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase text-white/80">
              <Sparkles size={15} /> Readaptación + rendimiento
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
              José Oviedo Kinesiología
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
              Centro integral de kinesiología, rehabilitación y entrenamiento personalizado para recuperarte mejor, moverte con seguridad y volver a tu actividad.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#turnos" className="inline-flex items-center justify-center gap-2 rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                Reservar turno <ArrowRight size={17} />
              </a>
              <a href="#servicios" className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white hover:text-graphite">
                Ver servicios
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src="/assets/paciente-tapia.jpg" alt="Paciente y equipo del centro" className="h-72 w-full rounded-md object-cover shadow-soft sm:h-96" />
            <div className="grid gap-3">
              <img src="/assets/consulta-deportiva.jpg" alt="Consulta deportiva" className="h-36 w-full rounded-md object-cover object-[50%_42%] sm:h-48" />
              <div className="rounded-md border border-white/10 bg-white/10 p-5 backdrop-blur">
                <strong className="block text-4xl">360°</strong>
                <span className="mt-2 block text-sm leading-6 text-white/72">
                  Evaluación, tratamiento, fuerza y seguimiento en un solo lugar.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quienes-somos" className="border-y border-white/10 bg-graphite py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="grid grid-cols-2 gap-3">
            <img src="/assets/gimnasio.jpg" alt="Gimnasio" className="col-span-2 h-72 w-full rounded-md object-cover sm:h-96" />
            <img src="/assets/recepcion.jpg" alt="recepcion" className="h-44 w-full rounded-md object-cover" />
            <img src="/assets/laboratorio.jpg" alt="laboratorio" className="h-44 w-full rounded-md object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase text-pulse">Quienes Somos</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal text-white">Un centro amplio, técnico y cercano.</h2>
            <p className="mt-5 text-base leading-8 text-white/72">
              José Oviedo Kinesiología integra boxes de atención, gimnasio, laboratorio de evaluación y profesionales enfocados en recuperación funcional. El abordaje es moderno, medible y pensado para acompañar desde el diagnóstico hasta la vuelta a la actividad.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Boxes privados', 'Gimnasio equipado', 'Rutinas supervisadas'].map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-white/8 p-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Servicios</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-normal text-white">Tratamientos orientados a movimiento, dolor y rendimiento.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/68">
            Cada plan combina evaluación clínica, objetivos concretos y progresiones medibles según tu deporte, lesión o rutina diaria.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-md border border-white/10 bg-white p-6 text-ink shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <Icon className="text-pulse" size={30} />
              <h3 className="mt-5 text-xl font-semibold text-graphite">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="nuestro-centro" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Nuestro Centro</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal text-white">Conocé nuestro espacio de trabajo</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/68">
            Cada ambiente fue diseñado para ofrecer comodidad, seguridad y un tratamiento personalizado.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <figure key={item.title} className="group overflow-hidden rounded-md border border-white/10 bg-white text-ink">
              <img src={item.src} alt={item.title} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
              <figcaption className="flex items-center justify-between p-4">
                <span className="font-semibold text-graphite">{item.title}</span>
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-neutral-600">{item.tag}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="alianzas-estrategicas" className="border-y border-white/10 bg-graphiteSoft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-pulse">Alianzas estratégicas</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">Un espacio para sumar instituciones, marcas y profesionales aliados.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {['Instituciones', 'Profesionales', 'Marcas'].map((item) => (
              <article key={item} className="rounded-md border border-white/10 bg-white/8 p-6">
                <h3 className="text-xl font-semibold text-white">{item}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">Contenido pendiente para incorporar próximamente.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experiencias" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Experiencias</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">Historias y vivencias de pacientes del centro.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/68">Sección preparada para sumar testimonios, casos o contenido audiovisual.</p>
        </div>
      </section>
      <section id="turnos" className="bg-graphiteDark py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
           <p className="text-sm font-semibold uppercase tracking-wider text-pulse">
  Turnos Online
</p>

<h2 className="mt-3 text-4xl font-semibold tracking-normal">
  Solicitá tu turno de manera rápida y sencilla.
</h2>

<p className="mt-5 text-base leading-8 text-white/70">
  Completá el formulario con tus datos y el servicio que necesitás según la agenda disponible del centro para confirmar el día y horario. Nos comunicaremos con vos a la brevedad.  
</p>

<div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
  <h3 className="text-lg font-semibold">
    Primera consulta
  </h3>

  <p className="mt-2 text-sm leading-7 text-white/70">
    La primera visita incluye una evaluación completa para conocer tu condición física, establecer un diagnóstico funcional y definir el tratamiento más adecuado para alcanzar tus objetivos.
  </p>
</div>
          </div>
          <form className="rounded-md border border-white/10 bg-white p-4 text-ink shadow-soft sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Nombre
                <input className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Nombre y apellido" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Teléfono
                <input className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="+54 9 ..." />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Servicio
                <select className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse">
                  {services.map((service) => (
                    <option key={service.title}>{service.title}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Fecha
                <input type="date" className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" />
              </label>
            </div>
            <div className="mt-5">
              <span className="text-sm font-semibold">Horarios disponibles</span>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      selectedSlot === slot ? 'border-pulse bg-pulse text-white' : 'border-line bg-white text-ink hover:border-pulse'
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Motivo de consulta
              <textarea className="min-h-28 rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Contanos brevemente qué necesitás trabajar." />
            </label>
            <button type="button" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-graphite px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse sm:w-auto">
              Solicitar reserva <CalendarCheck size={17} />
            </button>
          </form>
        </div>
      </section>

      <section
  id="contacto"
  className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8"
>
  {/* Columna izquierda */}
  <div>
    <p className="text-sm font-semibold uppercase tracking-wider text-pulse">
      Contacto
    </p>

    <h2 className="mt-3 text-4xl font-bold text-white">
      Estamos para ayudarte.
    </h2>

    <p className="mt-5 max-w-lg text-lg leading-8 text-white/72">
      Comunicate con nuestro equipo para solicitar un turno, realizar consultas
      o recibir información sobre nuestros tratamientos.
    </p>

    <div className="mt-10 space-y-4">

      {/* Teléfono */}
      <div className="flex items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="rounded-full bg-orange-50 p-3">
          <Phone size={22} className="text-pulse" />
        </div>

        <div>
          <h3 className="font-semibold text-graphite">
            Teléfono / WhatsApp
          </h3>

          <p className="text-neutral-600">
            +54 9 383 XXX XXXX
          </p>
        </div>
      </div>

      {/* Dirección */}
      <div className="flex items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="rounded-full bg-orange-50 p-3">
          <MapPin size={22} className="text-pulse" />
        </div>

        <div>
          <h3 className="font-semibold text-graphite">
            Dirección
          </h3>

          <p className="text-neutral-600">
            Núñez del Prado 987, Catamarca, Argentina
          </p>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="rounded-full bg-orange-50 p-3">
          <Mail size={22} className="text-pulse" />
        </div>

        <div>
          <h3 className="font-semibold text-graphite">
            Correo electrónico
          </h3>

          <p className="text-neutral-600">
            contacto@joseoviedokinesiologia.com
          </p>
        </div>
      </div>

      {/* Horarios */}
      <div className="flex items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="rounded-full bg-orange-50 p-3">
          <Clock3 size={22} className="text-pulse" />
        </div>

        <div>
          <h3 className="font-semibold text-graphite">
            Horarios de atención
          </h3>

          <p className="text-neutral-600">
            Lunes a Viernes: 8:00 a 20:00 hs
            <br />
            Sábados: 8:00 a 13:00 hs
          </p>
        </div>
      </div>

    </div>
  </div>

  {/* Columna derecha */}
  <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

    <img
      src={fachada}
      alt="Centro José Oviedo Kinesiología"
      className="h-80 w-full object-cover"
    />

    <div className="p-7">

      <h3 className="text-2xl font-bold text-graphite">
        Conocé nuestro centro
      </h3>

      <p className="mt-4 leading-7 text-neutral-600">
        Contamos con instalaciones modernas y un ambiente preparado para brindar
        una atención personalizada, enfocada en la recuperación, la prevención
        de lesiones y el bienestar de cada paciente.
      </p>

      <a
        href="https://www.google.com/maps/place/Jose+Oviedo/@-28.4655158,-65.7743581,324m/data=!3m1!1e3!4m6!3m5!1s0x942428bf3c67d161:0x9aac28ab8d1dd802!8m2!3d-28.4652554!4d-65.7729641!16s%2Fg%2F11bbrhdlmb?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center rounded-lg border border-pulse px-6 py-3 font-semibold text-pulse transition hover:bg-pulse hover:text-white"
      >
        Ver en Google Maps
      </a>

    </div>
  </div>
</section>

<footer className="bg-graphiteDark text-white">
  <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">

    {/* Logo */}
    <div>
      <div className="flex items-center gap-3">
        <img
          src="/assets/logo-icon.jpg"
          alt="José Oviedo Kinesiología"
          className="h-12 w-12 rounded-md object-cover"
        />

        <div>
          <h3 className="text-xl font-bold">
            José Oviedo
          </h3>

          <p className="text-sm text-white/70">
            Kinesiología
          </p>
        </div>
      </div>

      <p className="mt-5 leading-7 text-white/70">
        Recuperación, prevención de lesiones y entrenamiento personalizado
        con un enfoque integral para mejorar tu calidad de vida.
      </p>
    </div>

    {/* Navegación */}
    <div>
      <h4 className="mb-4 text-lg font-semibold">
        Navegación
      </h4>

      <ul className="space-y-3 text-white/70">
        <li><a href="#inicio" className="hover:text-pulse">Inicio</a></li>
        <li><a href="#servicios" className="hover:text-pulse">Servicios</a></li>
        <li><a href="#sobre" className="hover:text-pulse">Sobre nosotros</a></li>
        <li><a href="#turnos" className="hover:text-pulse">Turnos Online</a></li>
        <li><a href="#contacto" className="hover:text-pulse">Contacto</a></li>
      </ul>
    </div>

    {/* Servicios */}
    <div>
      <h4 className="mb-4 text-lg font-semibold">
        Servicios
      </h4>

      <ul className="space-y-3 text-white/70">
        <li>Kinesiología Deportiva</li>
        <li>Rehabilitación Física</li>
        <li>Ondas de Choque</li>
        <li>Gimnasio Personalizado</li>
      </ul>
    </div>

    {/* Redes */}
    <div>
      <h4 className="mb-4 text-lg font-semibold">
        Seguinos
      </h4>

      <div className="flex gap-3">

        <div className="flex gap-3">

  <a
    href="https://wa.me/549383XXXXXXX"
    target="_blank"
    rel="noreferrer"
    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-green-600"
  >
    <FaWhatsapp size={22} />
  </a>

  <a
    href="https://instagram.com/tuusuario"
    target="_blank"
    rel="noreferrer"
    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-pink-600"
  >
    <FaInstagram size={20} />
  </a>

  <a
    href="https://facebook.com/tuusuario"
    target="_blank"
    rel="noreferrer"
    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-blue-600"
  >
    <FaFacebookF size={20} />
  </a>

</div>

      </div>

      <p className="mt-5 text-sm leading-6 text-white/70">
        Seguinos para conocer novedades, consejos de prevención y contenidos sobre salud y rehabilitación.
      </p>
    </div>

  </div>

  <div className="border-t border-white/10">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-white/60 sm:flex-row sm:px-6 lg:px-8">

      <p>
        © {new Date().getFullYear()} José Oviedo Kinesiología. Todos los derechos reservados.
      </p>

    </div>
  </div>
</footer>
    </main>
  );
}

function slug(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
}

createRoot(document.getElementById('root')).render(<App />);
