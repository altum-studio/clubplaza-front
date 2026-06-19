// components/benefits/LocalLogo.tsx
// Logo del local en círculo, con aro blanco para montarse sobre la imagen.
// Si no hay logo (local_logo_url vacío), muestra las iniciales del local.

import { cn } from '@/lib/utils';

// Monograma de 1-2 letras (tipo ISO): primera letra + mayúsculas internas
// (ej. "Farmacia Maschwitz"→FM, "MaxiPet"→MP, "iTech"→IT, "Origen"→OR).
function iniciales(nombre: string): string {
  const t = nombre.trim();
  if (!t) return '';
  const caps = t.slice(1).match(/\p{Lu}/gu) ?? [];
  const mono = (t[0] + caps.join('')).toUpperCase();
  if (mono.length >= 2) return mono.slice(0, 2);
  const alpha = t.replace(/[^\p{L}]/gu, '');
  return alpha.slice(0, 2).toUpperCase();
}

export function LocalLogo({
  src,
  name,
  size = 44,
  className,
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={`Logo de ${name}`} className="h-full w-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-fill font-bold text-brand"
          style={{ fontSize: size * 0.36 }}
        >
          {iniciales(name)}
        </span>
      )}
    </span>
  );
}
