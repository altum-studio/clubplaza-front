// components/brand/Logo.tsx
// Identidad de marca: isotipo "GP" (Green Plaza) + wordmark CLUBPLAZA.
// El wordmark es una sola palabra: CLUB en weight 800 + PLAZA en weight 300.
// (Montserrat es el sustituto libre de Gotham, la tipografía oficial de marca.)

import { cn } from '@/lib/utils';

interface IsoProps {
  size?: number;
  onGreen?: boolean;
  className?: string;
}

/** Isotipo circular GP. Placeholder de la marca Green Plaza (no recrea el oficial). */
export function BrandIso({ size = 26, onGreen = false, className }: IsoProps) {
  return (
    <div
      className={cn('flex flex-shrink-0 items-center justify-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        border: onGreen ? '1.5px solid rgba(255,255,255,0.9)' : `1.5px dashed #23753a`,
        background: onGreen ? 'rgba(255,255,255,0.12)' : 'rgba(35,117,58,0.06)',
        fontFamily: '"Spline Sans Mono", ui-monospace, monospace',
        fontSize: size * 0.26,
        color: onGreen ? 'rgba(255,255,255,0.85)' : '#23753a',
      }}
    >
      GP
    </div>
  );
}

interface LogoProps {
  /** Tamaño del wordmark en px (el iso escala con él). */
  size?: number;
  onGreen?: boolean;
  /** Mostrar el isotipo a la izquierda del wordmark. */
  iso?: boolean;
  className?: string;
}

export function Logo({ size = 17, onGreen = false, iso = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {iso && <BrandIso size={size * 1.5} onGreen={onGreen} />}
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
