// components/benefits/BenefitImage.tsx
// Imagen del beneficio/local. Si hay `src` real la muestra; si no, un placeholder
// de marca con la inicial del local (reemplaza la "caja rayada" lo-fi del wireflow).

import { cn } from '@/lib/utils';

interface BenefitImageProps {
  src?: string;
  alt: string;
  /** Texto para el placeholder cuando no hay imagen (ej: nombre del local). */
  fallbackLabel?: string;
  className?: string;
  /** Estilo de redondeo; default 0 (lo controla el contenedor). */
  rounded?: string;
}

export function BenefitImage({ src, alt, fallbackLabel, className, rounded }: BenefitImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('h-full w-full object-cover', rounded, className)}
      />
    );
  }
  const initial = (fallbackLabel ?? alt).trim().charAt(0).toUpperCase() || 'GP';
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'flex h-full w-full items-center justify-center bg-fill',
        rounded,
        className,
      )}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(35,117,58,0.06) 0 1px, transparent 1px 11px)',
      }}
    >
      <span className="font-extrabold text-brand/40" style={{ fontSize: 'clamp(28px, 22%, 56px)' }}>
        {initial}
      </span>
    </div>
  );
}
