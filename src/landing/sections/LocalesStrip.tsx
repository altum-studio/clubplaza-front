// landing/sections/LocalesStrip.tsx
// Logos de los locales adheridos desfilando solos en loop. Se pueden deslizar con
// el dedo o agarrar y arrastrar con el mouse (el auto-desfile se pausa y retoma).
// La pista va duplicada para que el loop no tenga corte. Con "reducir movimiento"
// activado no desfila sola. Los "próximamente" van en gris.

import { useEffect, useRef } from 'react';
import { LocalLogo } from '@/components/benefits/LocalLogo';
import { useDragScroll } from '@/hooks/useDragScroll';
import { cn } from '@/lib/utils';
import type { LandingData } from '../useLandingData';

const VELOCIDAD = 0.35; // px por frame del auto-desfile

export function LocalesStrip({ data }: { data: LandingData }) {
  const { locales, status } = data;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausado = useRef(false);
  const retomar = useRef<number | undefined>(undefined);

  const pausar = () => {
    pausado.current = true;
    if (retomar.current) clearTimeout(retomar.current);
  };
  const retomarPronto = () => {
    if (retomar.current) clearTimeout(retomar.current);
    retomar.current = window.setTimeout(() => {
      pausado.current = false;
    }, 1600);
  };

  useDragScroll(scrollerRef, { onDragStart: pausar, onDragEnd: retomarPronto });

  // Auto-desfile por requestAnimationFrame (acumulador en float: el navegador
  // redondea scrollLeft y a baja velocidad no avanzaría).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || locales.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let pos = el.scrollLeft;
    const tick = () => {
      const mitad = el.scrollWidth / 2;
      if (pausado.current) {
        pos = el.scrollLeft;
      } else {
        pos += VELOCIDAD;
        if (mitad > 0 && pos >= mitad) pos -= mitad;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (retomar.current) clearTimeout(retomar.current);
    };
  }, [locales.length]);

  return (
    <section aria-labelledby="locales-titulo" className="bg-screen py-7 md:py-9">
      <h2 id="locales-titulo" className="text-center text-[11px] font-extrabold uppercase tracking-[1.2px] text-graytext">
        Locales adheridos
      </h2>

      {status === 'loading' ? (
        <div className="mt-4 flex justify-center gap-4 overflow-hidden px-5" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-fill" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          onTouchStart={pausar}
          onTouchEnd={retomarPronto}
          onMouseEnter={pausar}
          onMouseLeave={retomarPronto}
          className="cp-drag cp-noscrollbar mt-4 overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        >
          <ul className="flex w-max gap-4 px-2 py-1">
            {[...locales, ...locales].map((l, i) => (
              <li key={`${l.nombre}-${i}`} aria-hidden={i >= locales.length ? true : undefined}>
                <LocalLogo
                  src={l.logo}
                  name={l.nombre}
                  size={56}
                  className={cn('shadow-sm ring-1 ring-line-soft', l.estado === 'proximamente' && 'grayscale')}
                />
                <span className="sr-only">
                  {l.nombre}
                  {l.estado === 'proximamente' ? ' (próximamente)' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
