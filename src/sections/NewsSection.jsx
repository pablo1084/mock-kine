import React from 'react';
import { ArrowUpRight, Play, X, Youtube } from 'lucide-react';
import { apiUrl } from '../utils/api';

const REFRESH_MS = 5 * 60 * 1000;
const dateFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

function VideoPlayer({ video, onClose }) {
  const dialogRef = React.useRef(null);
  const closeRef = React.useRef(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    closeRef.current.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="news-video-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-md border border-white/15 bg-graphiteDark p-0 text-white backdrop:bg-black/85 backdrop:backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
        <h3 id="news-video-title" className="text-base font-semibold sm:text-xl">{video.title}</h3>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar video" className="shrink-0 rounded-md border border-white/20 p-2 transition hover:text-pulse focus-visible:outline focus-visible:outline-2 focus-visible:outline-pulse"><X size={20} /></button>
      </div>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
        title={video.title}
        className="aspect-video min-h-[200px] w-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 p-4 text-sm font-semibold text-pulse hover:underline">Ver en YouTube <ArrowUpRight size={16} /></a>
    </dialog>
  );
}

export function NewsSection({ hidden }) {
  const sectionRef = React.useRef(null);
  const [nearViewport, setNearViewport] = React.useState(false);
  const [feed, setFeed] = React.useState({ status: 'loading', channelUrl: '', videos: [] });
  const [selectedVideo, setSelectedVideo] = React.useState(null);

  React.useEffect(() => {
    if (hidden) return undefined;
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), { rootMargin: '300px' });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hidden]);

  React.useEffect(() => {
    if (hidden) {
      setSelectedVideo(null);
      return undefined;
    }
    if (!nearViewport) return undefined;
    let disposed = false;
    let controller;
    let inFlight = false;
    async function refresh() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch(apiUrl('youtube'), { signal: controller.signal });
        const data = await response.json();
        if (!Array.isArray(data.videos) || typeof data.channelUrl !== 'string') throw new Error('Respuesta inválida');
        if (!disposed) setFeed((previous) => data.status === 'error' && previous.videos.length ? { ...previous, status: 'stale' } : data);
      } catch {
        if (!disposed) setFeed((previous) => ({ ...previous, status: previous.videos.length ? 'stale' : 'error' }));
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
      }
    }
    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      disposed = true;
      controller?.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [hidden, nearViewport]);

  const message = feed.status === 'loading'
    ? 'Cargando las últimas novedades…'
    : feed.status === 'error'
      ? 'No pudimos cargar los videos en este momento. Volvé a intentarlo más tarde.'
      : 'Muy pronto compartiremos videos con novedades, actividades y la vida del centro.';

  return (
    <section ref={sectionRef} id="novedades" aria-labelledby="novedades-title" className={`${hidden ? 'hidden' : ''} scroll-mt-24 border-y border-white/10 bg-graphite py-16 sm:py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pulse"><Youtube size={18} /> Nuestro canal</p>
            <h2 id="novedades-title" className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Novedades del centro</h2>
            <p className="mt-3 max-w-2xl font-body text-base leading-7 text-white/70">Conocé lo que hacemos, dentro y fuera del consultorio.</p>
          </div>
          {feed.channelUrl && <a href={feed.channelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 sm:self-auto">Ver todos los videos <ArrowUpRight size={18} /></a>}
        </div>

        {feed.videos.length ? (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
              {feed.videos.slice(0, 3).map((video, index) => (
                <article key={video.id} className={`min-w-0 ${index === 2 ? 'hidden md:block' : ''}`}>
                  <button type="button" onClick={() => setSelectedVideo(video)} aria-label={`Reproducir: ${video.title}`} className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pulse">
                    <div className="relative aspect-video overflow-hidden rounded-md bg-graphiteDark">
                      <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pulse text-white shadow-lg sm:h-14 sm:w-14"><Play size={20} fill="currentColor" className="ml-0.5" /></span>
                      </div>
                    </div>
                    <time dateTime={video.publishedAt} className="mt-3 block text-xs text-white/50">{dateFormat.format(new Date(video.publishedAt))}</time>
                    <h3 className="mt-1.5 line-clamp-3 break-words text-sm font-semibold leading-6 text-white transition group-hover:text-pulse sm:text-lg sm:leading-7">{video.title}</h3>
                  </button>
                </article>
              ))}
            </div>
            {feed.status === 'stale' && <p role="status" className="mt-5 text-sm text-white/60">La actualización está demorada. Podés consultar las novedades directamente en nuestro canal.</p>}
          </>
        ) : (
          <div className="mt-8 rounded-md border border-white/10 bg-graphiteDark/40 px-5 py-10 text-center sm:py-14" role="status">
            <Youtube size={36} className="mx-auto text-pulse" />
            <p className="mt-4 text-lg font-semibold text-white">{feed.status === 'loading' ? 'Nuestros videos' : feed.status === 'error' ? 'Videos del centro' : 'Próximamente en nuestro canal'}</p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-white/60">{message}</p>
          </div>
        )}
      </div>
      {selectedVideo && !hidden && <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </section>
  );
}
