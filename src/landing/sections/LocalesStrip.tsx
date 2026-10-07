// landing/sections/LocalesStrip.tsx
// Logos de los locales adheridos desfilando en loop (CSS, liviano). La pista va
// duplicada para que el loop no tenga corte. Con "reducir movimiento" activado
// se queda quieta y se puede deslizar con el dedo. Los "próximamente" van en gris.

import { LocalLogo } from '@/components/benefits/LocalLogo';
import { cn } from '@/lib/utils';
import type { LandingData } from '../useLandingData';

export function LocalesStrip({ data }: { data: LandingData }) {
  const { locales, status } = data;
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
        <div className="mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
          <ul
            className="cp-marquee flex w-max gap-4 px-2 py-1"
            style={{ ['--cp-marquee-dur' as string]: `${Math.max(locales.length, 8) * 2.4}s` }}
          >
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
