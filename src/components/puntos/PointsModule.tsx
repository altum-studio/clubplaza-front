// components/puntos/PointsModule.tsx
// Franja de puntos que va DEBAJO del código de socio en la credencial, sobre el
// mensaje "Mostrá esta pantalla...". Regla firme: no compite con el QR. Toda la
// franja es un target táctil que navega a la pantalla de puntos.

import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { usePuntos } from '@/hooks/usePuntos';
import { PtBar, pad } from './kit';

export function PointsModule() {
  const { data } = usePuntos();
  const navigate = useNavigate();
  const pct = data.meta > 0 ? (data.saldo / data.meta) * 100 : 0;

  return (
    <button
      type="button"
      onClick={() => navigate('/puntos')}
      className="w-full rounded-[16px] border px-[17px] py-[15px] text-left lg:px-5 lg:py-4"
      style={{ background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.18)' }}
      aria-label="Ver mis puntos"
    >
      {/* Fila superior: saldo + acceso */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <Star size={17} className="translate-y-0.5 text-white" />
          <span className="text-[20px] font-extrabold leading-none text-white">
            {pad(data.saldo)}
            <span className="text-[13.5px] font-bold text-lgreen">/{pad(data.meta)}</span>
          </span>
          <span className="text-[12.5px] font-semibold text-lgreen">puntos</span>
        </div>
        <span className="flex items-center gap-0.5 text-[12px] font-bold text-white">
          Ver mis puntos
          <ChevronRight size={14} />
        </span>
      </div>

      {/* Barra de progreso sobre verde */}
      <PtBar onGreen pct={pct} className="mt-2.5" />

      {/* Fila inferior: nivel base ↔ próximo */}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-lgreen">
          <span className="font-bold text-white">Nivel {pad(data.nivelBase)}</span> · base
        </span>
        <span className="text-lgreen">
          <span className="font-bold text-white">Nivel {pad(data.nivelProximo)}</span> próx.
        </span>
      </div>
    </button>
  );
}
