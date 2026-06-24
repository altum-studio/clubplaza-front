// pages/admin/AdminDashboard.tsx
// Panel Admin · Dashboard general (variante A). 4 KPIs + altas de miembros
// (área) + top locales por canjes. Totales reales desde la API; el resto de las
// métricas (altas, canjes) sigue detrás de METRICS_SOON.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Area, PChip, PCard, Stat, LogoBox } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiLocal } from '@/types';
import { ADMIN_NAV, ALTAS, MESES } from '@/data/panelMock';

const benCount = (l: ApiLocal) =>
  Array.isArray(l.promos) && l.promos[0] && 'count' in l.promos[0]
    ? (l.promos[0] as { count: number }).count
    : (l.promos_count ?? 0);

// Selector de mes (mensual, desde Junio 2026). offset 0 = Junio 2026.
const MES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
function monthLabel(offset: number): string {
  const total = 5 + offset; // 5 = Junio (0-indexed), 2026
  const year = 2026 + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return `${MES_NOMBRES[m]} ${year}`;
}
function MonthPicker({ offset, onChange }: { offset: number; onChange: (o: number) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-1 py-0.5">
      <button
        type="button"
        onClick={() => onChange(offset - 1)}
        disabled={offset <= 0}
        aria-label="Mes anterior"
        className="flex h-7 w-7 items-center justify-center rounded-md text-graytext transition-colors hover:bg-fill disabled:opacity-30"
      >
        <Icon name="chevL" size={15} />
      </button>
      <span className="flex items-center gap-1.5 px-1 text-[12.5px] font-semibold text-graytext">
        <Icon name="cal" size={14} className="text-mute" />
        {monthLabel(offset)}
      </span>
      <button
        type="button"
        onClick={() => onChange(offset + 1)}
        aria-label="Mes siguiente"
        className="flex h-7 w-7 items-center justify-center rounded-md text-graytext transition-colors hover:bg-fill"
      >
        <Icon name="chevR" size={15} />
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const state = useAsync(
    () =>
      Promise.all([
        api.locales.list({ limit: 5 }),
        api.promos.list({ limit: 1 }),
        api.usuarios.list({ limit: 1 }),
      ]).then(([l, p, u]) => ({
        locales: l,
        localesCount: l.count,
        promos: p.count,
        usuarios: u.count,
      })),
    [],
  );

  const [monthOffset, setMonthOffset] = useState(0);
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  const ejeLabels = vista === 'mes' ? MESES : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Dashboard general"
      topbarActions={<MonthPicker offset={monthOffset} onChange={setMonthOffset} />}
    >
      <DataView state={state}>
        {(d) => (
          <div className="flex flex-col gap-4 lg:gap-[18px]">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat live label="Miembros totales" value={String(d.usuarios)} icon="users" />
              <Stat live label="Locales activos" value={String(d.localesCount)} icon="store" />
              <Stat live label="Beneficios publicados" value={String(d.promos)} icon="tag" />
              <Stat label="Canjes del mes" icon="ticket" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
              <PCard
                title="Altas de miembros"
                sub={vista === 'mes' ? 'Nuevos registros por mes' : 'Nuevos registros por semana'}
                actions={
                  <div className="hidden gap-1.5 sm:flex">
                    <PChip active={vista === 'mes'} onClick={() => setVista('mes')}>
                      Mes
                    </PChip>
                    <PChip active={vista === 'semana'} onClick={() => setVista('semana')}>
                      Semana
                    </PChip>
                  </div>
                }
              >
                <Area data={ALTAS} h={180} />
                <div className="mt-1 flex justify-between">
                  {ejeLabels.map((m, i) => (
                    <span key={i} className="text-[10.5px] font-semibold text-faint">
                      {m}
                    </span>
                  ))}
                </div>
              </PCard>

              <PCard
                title="Top locales por canjes"
                actions={<span className="text-xs font-bold text-brand">Ver todos</span>}
              >
                {d.locales.data.length === 0 ? (
                  <div className="py-[11px] text-[13px] text-mute">Sin locales</div>
                ) : (
                  d.locales.data.slice(0, 4).map((l, i) => (
                    <div
                      key={l.id}
                      className={`flex items-center gap-3 py-[11px] ${i === 3 ? '' : 'border-b border-line-soft'}`}
                    >
                      <div
                        className={`w-[22px] text-sm font-extrabold ${i === 0 ? 'text-brand' : 'text-faint'}`}
                      >
                        {i + 1}
                      </div>
                      {l.logo_url ? (
                        <img
                          src={l.logo_url}
                          className="h-[34px] w-[34px] rounded-full object-cover border border-line"
                        />
                      ) : (
                        <LogoBox size={34} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold text-ink">{l.nombre}</div>
                        <div className="text-[11px] text-mute">{benCount(l)} benef.</div>
                      </div>
                      <span className="text-[11px] font-bold text-faint">Próx.</span>
                    </div>
                  ))
                )}
              </PCard>
            </div>
          </div>
        )}
      </DataView>
    </PanelShell>
  );
}
