// components/benefits/LocalsMarquee.tsx
// Carrusel de logos de locales: scrolleable con el dedo y, si no se toca, sigue
// girando solo (auto-scroll por rAF). La pista está duplicada → loop sin corte.
// Cada círculo linkea a la pantalla del local. Sin dots.

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LocalLogo } from './LocalLogo';
import { slugify } from '@/lib/utils';

interface Local {
  nombre: string;
  logo: string;
}

const SPEED = 0.12; // px por frame del auto-scroll

export function LocalsMarquee({ locales }: { locales: Local[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    // Acumulador en float: el navegador redondea scrollLeft, así que llevamos la
    // posición real acá para que avance aunque la velocidad sea muy baja.
    let pos = el.scrollLeft;
    const tick = () => {
      const half = el.scrollWidth / 2; // ancho de una pasada (la pista está duplicada)
      if (pausedRef.current) {
        pos = el.scrollLeft; // sincronizar con el scroll manual
      } else {
        pos += SPEED;
        if (half > 0 && pos >= half) pos -= half;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };
  const resumeSoon = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1600);
  };

  if (locales.length === 0) return null;

  // Duplicamos para que el loop sea continuo (seamless).
  const pista = [...locales, ...locales];

  return (
    <div className="mb-3">
      <div
        ref={scrollerRef}
        onTouchStart={pause}
        onTouchEnd={resumeSoon}
        onMouseEnter={pause}
        onMouseLeave={resumeSoon}
        onWheel={() => {
          pause();
          resumeSoon();
        }}
        className="flex gap-5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pista.map((l, i) => (
          <Link
            key={`${l.nombre}-${i}`}
            to={`/local/${slugify(l.nombre)}`}
            aria-label={`Ver ${l.nombre}`}
            className="shrink-0 active:scale-95"
          >
            <LocalLogo
              src={l.logo}
              name={l.nombre}
              size={64}
              className="shadow-sm ring-1 ring-line-soft"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
