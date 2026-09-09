# Referencia del hero antes de probar hero-nueva2

Configuración manual del usuario guardada el 2026-09-08.

- Imagen: `/assets/hero-nueva.png`.
- Menos de 1024 px: fondo completo, altura mínima `max(calc(90svh - 6rem), calc(120vw - 6rem))`, enfoque `center 85%`, capa oscura al 50%.
- Desde 1024 px: imagen en la mitad derecha, fondo opaco detrás del texto y degradado lateral; altura mínima `max(580px, calc(60vw - 6rem))`, enfoque inferior.
- Filtro: `contrast(1.08) saturate(0.78)`.

Las copias `HeroSection.before-nueva2.jsx` y `styles.before-nueva2.css` conservan el estado exacto previo. Usarlas como referencia para restaurar el hero, sin sobrescribir cambios posteriores de otras secciones.

Prueba nueva: `/assets/hero-nueva2.jpg` (1600 x 1200), encuadre `20% 100%` mediante `.hero-photo .hero-image-training`, orientado a la pista y las personas en la parte inferior izquierda. Se conservan las alturas y degradados anteriores.
