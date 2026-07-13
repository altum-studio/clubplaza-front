// components/benefits/BenefitCard.tsx
// Tarjeta de beneficio del grid de 2 columnas (basada en WFBenefitCard).
// Imagen arriba + badge de categoría + título del descuento en verde. Linkea al detalle.

import { Link } from 'react-router-dom';
import type { Promo } from '@/types';
import { BenefitImage } from './BenefitImage';
import { LocalLogo } from './LocalLogo';

export function BenefitCard({ promo }: { promo: Promo }) {
  return (
    <Link
      to={`/beneficios/${promo.id}`}
      className="block overflow-hidden rounded-2xl border border-line-soft bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md"
    >
      <div className="relative">
        <div className="h-[88px] w-full border-b border-line-soft">
          <BenefitImage
            src={promo.imagen_url}
            alt={`${promo.titulo} · ${promo.local_nombre}`}
            fallbackLabel={promo.local_nombre}
          />
        </div>
        {/* Logo del local montado en el borde inferior de la imagen */}
        <LocalLogo
          src={promo.local_logo_url}
          name={promo.local_nombre}
          size={34}
          className="absolute left-2.5 top-[88px] -translate-y-1/2 shadow"
        />
      </div>
      <div className="px-2.5 pb-3 pt-2">
        <div className="flex min-h-[20px] items-center pl-[34px]">
          <span className="truncate text-[11px] font-medium text-mute">{promo.local_nombre}</span>
        </div>
        <div className="mt-1 truncate text-[17px] font-extrabold leading-none text-brand">
          {promo.titulo}
        </div>
      </div>
    </Link>
  );
}
