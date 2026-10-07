// landing/sections/LocalesStrip.tsx
// Logos de los locales adheridos desfilando solos, fluidos. Se pueden agarrar y
// arrastrar (mouse o dedo) con inercia al soltar (ver useMarquee). La pista va
// duplicada para que el loop no tenga corte. Los "próximamente" van en gris.

import { useRef } from 'react';
import { LocalLogo } from '@/components/benefits/LocalLogo';
import { useMarquee } from '@/hooks/useMarquee';
import { cn } from '@/lib/utils';
import type { LandingData } from '../useLandingData';

const VELOCIDAD = 22; // px por segundo del desfile automático

export function LocalesStrip({ data }: { data: LandingData }) {
  const { locales, status } = data;
  const viewportRef = useRef<HTMLDivElement>(null);
  const pistaRef = useRef<HTMLUListElement>(null);
  useMarquee(viewportRef, pistaRef, { velocidad: VELOCIDAD }, `${status}-${locales.length}`);

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
          ref={viewportRef}
          className="cp-drag mt-4 overflow-hidden py-1 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] [touch-action:pan-y]"
        >
          {/* Sin padding a la izquierda y pr = gap: el loop calza justo en la mitad. */}
          <ul ref={pistaRef} className="flex w-max gap-4 pr-4 will-change-transform">
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
