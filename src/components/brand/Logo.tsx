// components/brand/Logo.tsx
// Identidad de marca: isotipo "GP" (Green Plaza) + wordmark CLUBPLAZA.
// El wordmark es una sola palabra: CLUB en weight 800 + PLAZA en weight 300.
// (Montserrat es el sustituto libre de Gotham, la tipografía oficial de marca.)

import { cn } from '@/lib/utils';
import { BrandMark } from './BrandMark';

interface IsoProps {
  size?: number;
  onGreen?: boolean;
  className?: string;
}

/** Isotipo oficial de Green Plaza (SVG). Blanco sobre verde, verde sobre claro. */
export function BrandIso({ size = 26, onGreen = false, className }: IsoProps) {
  return (
    <span className={cn('inline-flex flex-shrink-0 items-center justify-center', className)}>
      <BrandMark size={size} color={onGreen ? '#ffffff' : '#23753a'} />
    </span>
  );
}

interface LogoProps {
  /** Tamaño del wordmark en px (el iso escala con él). */
  size?: number;
  onGreen?: boolean;
  /** Mostrar el isotipo (a la izquierda en fila, o arriba si `stacked`). */
  iso?: boolean;
  /** Apila el iso ARRIBA del wordmark, todo centrado (para headers destacados). */
  stacked?: boolean;
  className?: string;
}

export function Logo({
  size = 17,
  onGreen = false,
  iso = true,
  stacked = false,
  className,
}: LogoProps) {
  return (
    <div
      className={cn(
        'flex',
        stacked ? 'flex-col items-center gap-2.5' : 'items-center gap-2',
        className,
      )}
    >
      {iso && <BrandIso size={size * (stacked ? 2.2 : 1.5)} onGreen={onGreen} />}
      <span
        className={cn('leading-none tracking-[0.6px]', onGreen ? 'text-white' : 'text-ink')}
        style={{ fontSize: size }}
      >
        <span className="font-extrabold">CLUB</span>
        <span className="font-light">PLAZA</span>
      </span>
    </div>
  );
}
