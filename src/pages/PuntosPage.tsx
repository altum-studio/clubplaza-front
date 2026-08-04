// pages/PuntosPage.tsx
// Pantalla dedicada del sistema de puntos (/puntos). Saldo + progreso del tramo
// arriba; abajo el camino de niveles y el historial. En celular se apilan; en
// escritorio se abren en dos columnas. Todos los números son placeholders (00).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppCanvas } from '@/components/ui/AppCanvas';
import { usePuntos, type PtNivel } from '@/hooks/usePuntos';
import {
  PT_GRADIENT,
  pad,
  PtBar,
  PtSection,
  PtPathNode,
  PtHistoryRow,
} from '@/components/puntos/kit';
import { BenefitSheet, type BenefitSheetData } from '@/components/puntos/BenefitSheet';

export default function PuntosPage() {
  const { data } = usePuntos();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<BenefitSheetData | null>(null);

  const pct = data.meta > 0 ? (data.saldo / data.meta) * 100 : 0;
  const openCupon = (nivel: number) =>
    setSheet({ nivel, codigo: data.codigoBeneficio, diasVence: 0 });

  const subtitle = (nv: PtNivel) =>
    nv.estado === 'done'
      ? 'Conquistado'
      : nv.estado === 'current'
        ? `Faltan ${pad(data.faltanPuntos)} puntos y quedan ${pad(data.diasRestantes)} días de plazo`
        : `Se abre al llegar a Nivel ${nv.n - 1}`;

  return (
    <AppCanvas wide bg="#f7f4ec">
      <div className="flex h-full w-full flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1040px] flex-col lg:grid lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-[22px] lg:p-[30px]">
          {/* ── Columna izquierda: saldo + camino ── */}
          <div className="flex flex-col lg:gap-[22px]">
            {/* Saldo (cabecera verde) */}
            <header
              className="px-5 pb-[18px] pt-[max(env(safe-area-inset-top),56px)] text-white lg:rounded-[16px] lg:p-6 lg:pt-6"
              style={{ background: PT_GRADIENT }}
            >
              <div className="mb-4 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label="Volver"
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
                  style={{ background: 'rgba(255,255,255,0.16)' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <h1 className="text-[17px] font-extrabold">Mis puntos</h1>
              </div>

              <p className="text-[10.5px] font-extrabold uppercase tracking-[1.2px] text-moss">Tu saldo</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[40px] font-extrabold leading-none">
                  {pad(data.saldo)}
                  <span className="text-[26px] font-bold text-lgreen">/{pad(data.meta)}</span>
                </span>
                <span className="text-[14px] font-semibold text-lgreen">puntos</span>
              </div>

              <PtBar onGreen pct={pct} className="mt-4" />
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-lgreen">
                  <span className="font-bold text-white">Nivel {pad(data.nivelBase)}</span> · base
                </span>
                <span className="font-bold text-white">Nivel {pad(data.nivelProximo)}</span>
              </div>

              <p className="mt-3.5 text-[12.5px] leading-snug text-lgreen">
                Consigue <span className="font-extrabold text-white">{pad(data.faltanPuntos)} puntos</span>{' '}
                antes del <span className="font-extrabold text-white">{data.fechaLimite}</span> para pasar al
                próximo nivel
              </p>
            </header>

            {/* Tu camino */}
            <section className="px-5 py-4 lg:rounded-[16px] lg:border lg:border-line lg:bg-white lg:p-5 lg:shadow-[0_1px_2px_rgba(23,80,42,0.04)]">
              <PtSection label="Tu camino" className="mb-3" />
              {data.niveles.map((nv, i) => (
                <PtPathNode
                  key={nv.n}
                  n={nv.n}
                  estado={nv.estado}
                  subtitle={subtitle(nv)}
                  isLast={i === data.niveles.length - 1}
                  cupon={nv.cupon}
                  onOpenCupon={() => openCupon(nv.n)}
                />
              ))}
            </section>
          </div>

          {/* ── Columna derecha: historial ── */}
          <section className="px-5 pb-8 pt-2 lg:rounded-[16px] lg:border lg:border-line lg:bg-white lg:p-5 lg:pt-5 lg:shadow-[0_1px_2px_rgba(23,80,42,0.04)]">
            <PtSection
              label="Historial"
              action={
                <button type="button" className="cursor-pointer text-[12px] font-bold text-brand">
                  Ver todo
                </button>
              }
              className="mb-1"
            />
            {data.historial.map((mov, i) => (
              <PtHistoryRow key={mov.id} mov={mov} last={i === data.historial.length - 1} />
            ))}
          </section>
        </div>
      </div>

      <BenefitSheet data={sheet} onClose={() => setSheet(null)} />
    </AppCanvas>
  );
}
