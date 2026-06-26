// components/benefits/BenefitCarousel.tsx
// Carrusel horizontal de "Beneficio del día": tarjeta centrada (las vecinas
// asoman), degradado en los costados, dots de posición y avance automático.
// El avance auto se pausa mientras el usuario arrastra.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BenefitImage } from './BenefitImage';
import { BenefitBadge } from './BenefitBadge';
import { LocalLogo } from './LocalLogo';
import { Button } from '@/components/ui/app-button';
import { labelCategoria } from '@/lib/categorias';
import type { Promo } from '@/types';

const AUTOPLAY_MS = 4500;

export function BenefitCarousel({ promos }: { promos: Promo[] }) {
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);

  // Centra la tarjeta i dentro del scroller.
  const centerOn = (i: number) => {
    const scroller = scrollerRef.current;
    const card = scroller?.children[i] as HTMLElement | undefined;
    if (!scroller || !card) return;
    scroller.scrollTo({
      left: card.offsetLeft - (scroller.clientWidth - card.clientWidth) / 2,
      behavior: 'smooth',
    });
  };

  // La tarjeta más cercana al centro es la activa (actualiza los dots).
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(scroller.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const dist = Math.abs(el.offsetLeft + el.clientWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    activeRef.current = best;
    setActive(best);
  };

  // Si cambia la lista (ej: cambia el filtro de fecha) NO reiniciamos el scroll:
  // dejamos la posición donde está y solo recalculamos el dot activo. Así el
  // filtro y el carrusel son independientes.
  useEffect(() => {
    handleScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promos]);

  // Avance automático (se pausa mientras se arrastra con el dedo).
  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      centerOn((activeRef.current + 1) % promos.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [promos.length]);

  if (promos.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="relative -mx-4">
        {/* Degradados laterales: las tarjetas se funden en los bordes (sutil) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-screen to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-screen to-transparent" />

        {/* Scroller con snap centrado */}
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          onTouchStart={() => {
            pausedRef.current = true;
          }}
          onTouchEnd={() => {
            pausedRef.current = false;
          }}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[10%] pb-1 sm:px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {promos.map((p) => (
            <article
              key={p.id}
              className="relative flex w-[80%] flex-shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-line-soft bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] sm:w-[320px]"
            >
              <div className="h-[110px] w-full">
                <BenefitImage
                  src={p.imagen_url}
                  alt={`${p.titulo} · ${p.local_nombre}`}
                  fallbackLabel={p.local_nombre}
                />
              </div>
              {/* Badge sobre la imagen */}
              <span className="absolute left-2.5 top-2.5">
                <BenefitBadge>{labelCategoria(p.categoria)}</BenefitBadge>
              </span>
              {/* Logo del local montado en el borde inferior de la imagen */}
              <LocalLogo
                src={p.local_logo_url}
                name={p.local_nombre}
                size={48}
                className="absolute left-3.5 top-[110px] -translate-y-1/2 shadow-md"
              />
              {/* Cuerpo en columna: el botón queda anclado abajo (misma altura en todas) */}
              <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-2.5">
                <div className="flex min-h-[26px] items-center pl-[56px]">
                  <span className="truncate text-[12.5px] font-semibold text-graytext">
                    {p.local_nombre}
                  </span>
                </div>
                <h2 className="mb-2 mt-1 text-[22px] font-extrabold leading-tight text-brand">
                  {p.titulo}
                </h2>
                <p className="mb-3 line-clamp-2 text-[12.5px] text-graytext">{p.descripcion}</p>
                <Button className="mt-auto" onClick={() => navigate(`/beneficios/${p.id}`)}>
                  Ver beneficio
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Dots de posición (clickeables) */}
      {promos.length > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {promos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Ir al beneficio ${i + 1}`}
              onClick={() => centerOn(i)}
              className={
                i === active
                  ? 'h-1.5 w-4 rounded-full bg-brand transition-all'
                  : 'h-1.5 w-1.5 rounded-full bg-line transition-all'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
