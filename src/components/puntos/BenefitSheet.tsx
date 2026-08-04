// components/puntos/BenefitSheet.tsx
// Pop-up del beneficio desbloqueado. En celular es una hoja inferior (bottom
// sheet); en tablet/escritorio, un modal centrado. Trae el QR único del
// beneficio y su vencimiento. Único elemento blanco: el recuadro del QR.

import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Store, Clock, X } from 'lucide-react';
import { PT_GRADIENT, pad } from './kit';

export interface BenefitSheetData {
  nivel: number;
  codigo: string;
  diasVence: number;
}

export function BenefitSheet({
  data,
  onClose,
}: {
  data: BenefitSheetData | null;
  onClose: () => void;
}) {
  // Cerrar con Escape.
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, onClose]);

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      style={{ background: 'rgba(15,32,21,0.60)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full overflow-hidden rounded-t-[24px] px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-5 text-white shadow-[0_-12px_40px_rgba(0,0,0,0.28)] sm:max-w-[420px] sm:rounded-[24px] sm:pb-6 sm:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        style={{ background: PT_GRADIENT }}
      >
        {/* Handle (celular) */}
        <span className="mx-auto mb-4 block h-1 w-[42px] rounded-full bg-white/35 sm:hidden" />

        {/* Cerrar (tablet/escritorio) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 hidden h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white sm:flex"
          style={{ background: 'rgba(255,255,255,0.14)' }}
        >
          <X size={16} />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <span
            className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(255,255,255,0.14)' }}
          >
            <Ticket size={22} className="text-white" />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[1px] text-moss">
              Desbloqueado en Nivel {pad(data.nivel)}
            </p>
            <h2 className="text-[18px] font-extrabold leading-tight text-white">Beneficio exclusivo</h2>
          </div>
        </div>

        {/* Tarjeta del local */}
        <div
          className="mt-4 flex items-center gap-2.5 rounded-[12px] border px-3 py-2.5"
          style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)' }}
        >
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'rgba(255,255,255,0.14)' }}
          >
            <Store size={16} className="text-white" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-white">Local adherido</div>
            <div className="truncate text-[11.5px] text-lgreen">Rubro · dirección del local</div>
          </div>
        </div>

        {/* Descripción / condiciones */}
        <p className="mt-3 text-[13px] leading-[1.5] text-lgreen">
          Descripción del beneficio que desbloqueaste al llegar a este nivel. Condiciones de uso y
          aclaraciones del local.
        </p>

        {/* QR único (único elemento blanco) */}
        <div className="mt-4 flex flex-col items-center">
          <div className="rounded-[16px] bg-white p-3">
            <QRCodeSVG value={data.codigo} size={150} fgColor="#1d1d1b" bgColor="#ffffff" level="M" />
          </div>
          <p className="mt-3 font-mono text-[17px] font-semibold tracking-[3px] text-white">
            {data.codigo}
          </p>
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.18)' }}
          >
            <Clock size={12} />
            Vence en {pad(data.diasVence)} días
          </span>
        </div>

        {/* CTA */}
        <button
          type="button"
          className="mt-5 w-full rounded-[12px] border py-3 text-[14.5px] font-extrabold text-white"
          style={{ background: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.18)' }}
        >
          Mostrar en el local
        </button>
      </div>
    </div>
  );
}
