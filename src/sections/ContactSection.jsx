import React from 'react';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';

const contactIcons = {
  phone: Phone,
  map: MapPin,
  mail: Mail,
  clock: Clock3,
};

export function ContactSection({ contactCards, hidden }) {
  return (
    <section id="contacto" className={`${hidden ? 'hidden' : ''} mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8`}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-pulse">Contacto</p>
        <h2 className="mt-3 text-4xl font-bold text-white">Estamos para ayudarte.</h2>
        <p className="mt-5 max-w-lg text-lg leading-8 text-white/72">
          Comunicate con nuestro equipo para solicitar un turno, realizar consultas o recibir información sobre nuestros tratamientos.
        </p>

        <div className="mt-10 space-y-4">
          {contactCards.map((card) => {
            const Icon = contactIcons[card.icon];

            return (
              <div key={card.title} className="flex items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="rounded-full bg-orange-50 p-3">
                  <Icon size={22} className="text-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-graphite">{card.title}</h3>
                  <p className="text-neutral-600">
                    {card.text}
                    {card.secondLine && (
                      <>
                        <br />
                        {card.secondLine}
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <img src="/assets/fachada.jpg" alt="Centro José Oviedo Kinesiología" className="h-80 w-full object-cover" />
        <div className="p-7">
          <h3 className="text-2xl font-bold text-graphite">Conocé nuestro centro</h3>
          <p className="mt-4 leading-7 text-neutral-600">
            Contamos con instalaciones modernas y un ambiente preparado para brindar una atención personalizada, enfocada en la recuperación, la prevención de lesiones y el bienestar de cada paciente.
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
  );
}
