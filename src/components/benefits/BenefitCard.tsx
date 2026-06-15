// components/benefits/BenefitCard.tsx
// Tarjeta de beneficio del grid de 2 columnas (basada en WFBenefitCard).
// Imagen arriba + badge de categoría + título del descuento en verde. Linkea al detalle.

import { Link } from 'react-router-dom';
import type { Promo } from '@/types';
import { labelCategoria } from '@/lib/categorias';
import { BenefitBadge } from './BenefitBadge';
import { BenefitImage } from './BenefitImage';

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
        <span className="absolute left-2 top-2">
          <BenefitBadge>{labelCategoria(promo.categoria)}</BenefitBadge>
        </span>
      </div>
      <div className="px-2.5 pb-3 pt-2.5">
        <div className="mb-1 truncate text-[17px] font-extrabold leading-none text-brand">
          {promo.titulo}
        </div>
        <p className="line-clamp-2 text-[11px] font-normal leading-snug text-mute">
          {promo.local_nombre}
        </p>
      </div>
    </Link>
  );
}
