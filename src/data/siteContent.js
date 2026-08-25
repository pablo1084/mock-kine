export const navItems = ['Inicio', 'Quienes somos', 'Servicios', 'Nuestro centro', 'Alianzas estratégicas', 'Experiencias'];

export const services = [
  {
    icon: 'activity',
    title: 'Kinesiología deportiva',
    text: 'Evaluación, tratamiento y readaptación para atletas y personas activas que buscan volver con confianza.',
  },
  {
    icon: 'shield',
    title: 'Rehabilitación',
    text: 'Planes progresivos para lesiones musculares, articulares, post quirúrgicos y dolor persistente.',
  },
  {
    icon: 'waves',
    title: 'Ondas de choque',
    text: 'Tecnología aplicada a tendinopatías, fascitis, espolón calcáneo y cuadros crónicos seleccionados.',
  },
  {
    icon: 'dumbbell',
    title: 'Gimnasio personalizado',
    text: 'Rutinas supervisadas, fuerza, movilidad y control de cargas con objetivos medibles.',
  },
];

export const gallery = [
  { src: '/assets/centro-gimnasio.jpg', title: 'Área de rehabilitación y entrenamiento', tag: 'Rehabilitación' },
  { src: '/assets/equipo.jpg', title: 'Nuestro equipo profesional', tag: 'Equipo' },
  { src: '/assets/readaptacion.jpg', title: 'Readaptación deportiva', tag: 'Deporte' },
  { src: '/assets/boxes.jpg', title: 'Consultorios de atención', tag: 'Boxes' },
  { src: '/assets/moderno.jpg', title: 'Espacios modernos y confortables', tag: 'Centro' },
  { src: '/assets/atencion.jpg', title: 'Atención Personalizada', tag: 'Atención' },
];

export const slots = ['08:30', '10:00', '12:30', '15:00', '17:30', '19:00'];

export const teamAreas = ['Dirección', 'Kinesiología', 'Salud integral', 'Entrenamiento', 'Administración'];

export const teamMembers = [
  { id: 'director', name: 'Dr. José Oviedo', role: 'Director / Kinesiólogo', area: 'Dirección', initials: 'JO', photo: '/assets/equipo/director.jpg', imagePosition: 'object-[50%_9%]', highlight: true, summary: 'Coordina el abordaje integral del centro y acompaña procesos de rehabilitación, readaptación y rendimiento.', bio: 'Director del centro y referente del equipo profesional. Su trabajo integra evaluación funcional, tratamiento kinésico y seguimiento personalizado para que cada paciente avance con objetivos claros y medibles.', certificationsUrl: '/assets/certificaciones-director.pdf' },
  { id: 'kinesiologo-1', name: 'Luciana Cordero', role: 'Kinesiología y rehabilitación', area: 'Kinesiología', initials: 'K1', photo: '/assets/equipo/kinesiologo-1.jpg', imagePosition: 'object-[50%_13%]', summary: 'Acompaña procesos de recuperación funcional con seguimiento cercano y progresivo.', bio: 'Profesional del área kinésica orientado/a a la recuperación del movimiento, el control del dolor y la vuelta segura a las actividades de cada paciente.' },
  { id: 'kinesiologo-2', name: 'Tomas Ibañez Espeche', role: 'Kinesiología y rehabilitación', area: 'Kinesiología', initials: 'K2', photo: '/assets/equipo/kinesiologo-2.jpg', imagePosition: 'object-[50%_13%]', summary: 'Trabaja con lesiones deportivas, movilidad y readaptación al esfuerzo.', bio: 'Su enfoque combina evaluación clínica, ejercicios terapéuticos y progresiones de carga para acompañar a personas activas y deportistas.' },
  { id: 'kinesiologo-3', name: 'Javier Luna Mercado', role: 'Kinesiología y rehabilitación', area: 'Kinesiología', initials: 'K3', photo: '/assets/equipo/kinesiologo-3.jpg', imagePosition: 'object-[50%_13%]', summary: 'Diseña planes de tratamiento para mejorar movilidad, fuerza y autonomía.', bio: 'Acompaña procesos de rehabilitación musculoesquelética con objetivos concretos, controles periódicos y educación para el paciente.' },
  { id: 'kinesiologo-4', name: 'Natalia Herrera', role: 'Kinesiología y rehabilitación', area: 'Kinesiología', initials: 'K4', photo: '/assets/equipo/kinesiologo-4.jpg', imagePosition: 'object-[50%_13%]', summary: 'Integra recursos manuales, ejercicio terapéutico y prevención.', bio: 'Su intervención busca mejorar la calidad del movimiento y reducir molestias mediante un abordaje personalizado y progresivo.' },
  { id: 'kinesiologo-5', name: 'Leandro Fagonde', role: 'Kinesiología y rehabilitación', area: 'Kinesiología', initials: 'K5', photo: '/assets/equipo/kinesiologo-5.jpg', imagePosition: 'object-[50%_13%]', summary: 'Acompaña la recuperación de hábitos de movimiento seguros y eficientes.', bio: 'Trabaja en la reeducación de patrones funcionales, fortalecimiento y seguimiento de la evolución de cada paciente.' },
  { id: 'osteopata', name: 'Pablo Villafañe', role: 'Osteopatía', area: 'Salud integral', initials: 'OS', photo: '/assets/equipo/osteopata.jpg', imagePosition: 'object-[50%_13%]', summary: 'Aporta una mirada global sobre movilidad, postura y equilibrio corporal.', bio: 'Desde la osteopatía, acompaña el tratamiento con una evaluación integral orientada a mejorar la función y el bienestar general.' },
  { id: 'psicologo', name: 'Ezequiel Vera', role: 'Psicología', area: 'Salud integral', initials: 'PS', photo: '/assets/equipo/psicologo.jpg', imagePosition: 'object-[50%_13%]', summary: 'Acompaña aspectos emocionales vinculados al proceso de recuperación y bienestar.', bio: 'Brinda un espacio de escucha y acompañamiento para pacientes que atraviesan procesos de dolor, lesión, cambios de hábitos o vuelta a la actividad.' },
  { id: 'nutricionista', name: 'Viviana Ali', role: 'Nutrición', area: 'Salud integral', initials: 'NU', photo: '/assets/equipo/nutricionista.jpg', imagePosition: 'object-[50%_13%]', summary: 'Orienta hábitos alimentarios para potenciar salud, recuperación y rendimiento.', bio: 'Trabaja en estrategias nutricionales personalizadas, integradas a los objetivos clínicos, deportivos y de bienestar de cada paciente.' },
  { id: 'profesor', name: 'Mateo Vega', title: 'Profesor de Educación Física', role: 'Entrenamiento personalizado', area: 'Entrenamiento', initials: 'EF', photo: '/assets/equipo/profe-educacion-fisica.jpg', imagePosition: 'object-[50%_13%]', summary: 'Planifica entrenamientos personalizados con control de cargas y objetivos medibles.', bio: 'Profesor de Educación Física especializado en entrenamiento personalizado. Acompaña rutinas de fuerza, movilidad y acondicionamiento físico, adaptadas al estado inicial, la evolución y las metas de cada persona.' },
  { id: 'administracion-1', name: 'Alejandra Tamargo', role: 'Atención y coordinación', area: 'Administración', initials: 'A1', photo: '/assets/equipo/administracion-1.jpg', imagePosition: 'object-[50%_13%]', summary: 'Organiza turnos, consultas y la comunicación diaria con pacientes.', bio: 'Forma parte del primer contacto con el centro, acompañando la gestión de turnos, orientación inicial y coordinación administrativa.' },
  { id: 'administracion-2', name: 'Nazarena Oviedo', role: 'Gestión administrativa', area: 'Administración', initials: 'A2', photo: '/assets/equipo/administracion-2.jpg', imagePosition: 'object-[50%_13%]', summary: 'Acompaña la organización interna y la experiencia de atención.', bio: 'Colabora con la gestión del centro para que cada paciente reciba información clara, seguimiento y una atención ordenada.' },
];

export const allianceItems = ['Instituciones', 'Profesionales', 'Marcas'];

export const contactCards = [
  { icon: 'phone', title: 'Teléfono / WhatsApp', text: '+54 9 383 XXX XXXX' },
  { icon: 'map', title: 'Dirección', text: 'Núñez del Prado 987, Catamarca, Argentina' },
  { icon: 'mail', title: 'Correo electrónico', text: 'contacto@joseoviedokinesiologia.com' },
  { icon: 'clock', title: 'Horarios de atención', text: 'Lunes a Viernes: 8:00 a 20:00 hs', secondLine: 'Sábados: 8:00 a 13:00 hs' },
];
