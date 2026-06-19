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

const SPEED = 0.25; // px por frame del auto-scroll

export function LocalsMarquee({ locales }: { locales: Local[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      if (!pausedRef.current) el.scrollLeft += SPEED;
      const half = el.scrollWidth / 2; // ancho de una pasada (la pista está duplicada)
      if (half > 0) {
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft < 0) el.scrollLeft += half;
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
