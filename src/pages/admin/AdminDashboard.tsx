// pages/admin/AdminDashboard.tsx
// Panel Admin · Dashboard general (variante A). 4 KPIs + altas de miembros
// (área) + top locales por canjes. Totales reales desde la API; el resto de las
// métricas (altas, canjes) sigue detrás de METRICS_SOON.

import { PanelShell } from '@/components/panel/PanelShell';
import { Area, PButton, PChip, PCard, Stat, LogoBox } from '@/components/panel/kit';
import { DataView } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiLocal } from '@/types';
import { ADMIN_NAV, ALTAS, MESES } from '@/data/panelMock';

const benCount = (l: ApiLocal) =>
  Array.isArray(l.promos) && l.promos[0] && 'count' in l.promos[0]
    ? (l.promos[0] as { count: number }).count
    : (l.promos_count ?? 0);

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

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Dashboard general"
      topbarActions={
        <>
          <PChip icon="cal">Junio 2026</PChip>
          <PButton icon="download" variant="outline">
            Exportar
          </PButton>
        </>
      }
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
                sub="Nuevos registros por mes · 2025–2026"
                actions={
                  <div className="hidden gap-1.5 sm:flex">
                    <PChip active>Mes</PChip>
                    <PChip>Semana</PChip>
                  </div>
                }
              >
                <Area data={ALTAS} h={180} />
                <div className="mt-1 flex justify-between">
                  {MESES.map((m, i) => (
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
                          className="h-[34px] w-[34px] rounded-[9px] object-cover border border-line"
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
