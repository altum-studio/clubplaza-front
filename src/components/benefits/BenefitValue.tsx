// components/benefits/BenefitValue.tsx
// Muestra el "valor" del beneficio. Para tipo 'descuento_fijo' con precios,
// renderiza el precio anterior TACHADO + el precio nuevo. Para el resto, la
// etiqueta normal (valorLabel). Va dentro del badge de valor de cada vista.

import type { TipoBeneficio } from '@/types';
import { valorLabel } from '@/lib/opciones';

function fmtPrecio(n: number): string {
  return `$${Math.round(n).toLocaleString('es-AR')}`;
}

export function BenefitValue({
  tipo,
  valor,
  precioAnterior,
  precioNuevo,
}: {
  tipo?: TipoBeneficio | null;
  valor?: number | null;
  precioAnterior?: number | null;
  precioNuevo?: number | null;
}) {
  if (tipo === 'descuento_fijo' && precioNuevo != null) {
    return (
      <span className="inline-flex items-baseline gap-1.5">
        {precioAnterior != null && (
          <span className="font-normal line-through opacity-55">{fmtPrecio(precioAnterior)}</span>
        )}
        <span>{fmtPrecio(precioNuevo)}</span>
      </span>
    );
  }
  return <>{valorLabel(tipo, valor)}</>;
}
