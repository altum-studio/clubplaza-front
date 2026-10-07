// components/benefits/LocalsMarquee.tsx
// Carrusel de logos de locales: desfila solo, fluido, y se puede agarrar y
// arrastrar (mouse o dedo) con inercia al soltar (ver useMarquee). La pista está
// duplicada → loop sin corte. Cada círculo linkea a la pantalla del local.

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { LocalLogo } from './LocalLogo';
import { slugify, cn } from '@/lib/utils';
import { useMarquee } from '@/hooks/useMarquee';
import type { LocalEstado } from '@/types';

interface Local {
  nombre: string;
  logo: string;
  estado?: LocalEstado;
}

const VELOCIDAD = 8; // px por segundo del desfile automático

export function LocalsMarquee({ locales }: { locales: Local[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pistaRef = useRef<HTMLDivElement>(null);
  useMarquee(viewportRef, pistaRef, { velocidad: VELOCIDAD }, locales.length);

  if (locales.length === 0) return null;

  // Duplicamos para que el loop sea continuo (seamless). La segunda copia no se
  // anuncia ni se enfoca (es solo visual).
  const pista = [...locales, ...locales];

  return (
    <div className="mb-3">
      <div ref={viewportRef} className="cp-drag overflow-hidden py-1 [touch-action:pan-y]">
        {/* Sin padding a la izquierda y pr = gap: el loop calza justo en la mitad. */}
        <div ref={pistaRef} className="flex w-max gap-5 pr-5 will-change-transform">
          {pista.map((l, i) => {
            const copia = i >= locales.length;
            return (
              <Link
                key={`${l.nombre}-${i}`}
                to={`/local/${slugify(l.nombre)}`}
                aria-label={l.estado === 'proximamente' ? `${l.nombre} · Próximamente` : `Ver ${l.nombre}`}
                aria-hidden={copia || undefined}
                tabIndex={copia ? -1 : undefined}
                className="group relative flex shrink-0 active:scale-95"
              >
                <LocalLogo
                  src={l.logo}
                  name={l.nombre}
                  size={64}
                  className={cn(
                    'shadow-sm ring-1 ring-line-soft',
                    // Próximamente: en B/N; al pasar el mouse se revela a color.
                    l.estado === 'proximamente' && 'grayscale transition duration-200 group-hover:grayscale-0',
                  )}
                />
                {/* Relojito centrado (solo el ícono, sin fondo); se oculta en hover. */}
                {l.estado === 'proximamente' && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-0">
                    <Clock
                      size={24}
                      strokeWidth={2.5}
                      className="text-graytext drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
                    />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
