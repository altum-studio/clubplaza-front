// pages/admin/AdminDashboard.tsx
// Panel Admin · Dashboard general (variante A). 4 KPIs + altas de miembros
// (área) + top locales por canjes. Totales reales desde la API; el resto de las
// métricas (altas, canjes) sigue detrás de METRICS_SOON.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Area, PChip, PCard, Stat, LogoBox } from '@/components/panel/kit';
import { MonthPicker } from '@/components/panel/MonthPicker';
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
  const state = useAsync(async () => {
    const [l, p, u, stats] = await Promise.all([
      api.locales.list({ limit: 500 }),
      api.promos.list({ limit: 1 }),
      api.usuarios.list({ limit: 1 }),
      api.canjes.stats().catch(() => null),
    ]);
    // Canjes del mes por local, para ordenar el ranking (si un local falla → 0).
    const ranking = await Promise.all(
      l.data.map((loc) =>
        api.canjes
          .stats({ local_id: loc.id })
          .then((s) => ({ local: loc, canjes: s.canjes_mes }))
          .catch(() => ({ local: loc, canjes: 0 })),
      ),
    );
    ranking.sort((a, b) => b.canjes - a.canjes); // mayor cantidad de canjes primero
    return {
      localesCount: l.count,
      promos: p.count,
      usuarios: u.count,
      canjesMes: stats?.canjes_mes ?? null,
      ranking,
    };
  }, []);

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
              {d.canjesMes != null ? (
                <Stat live label="Canjes del mes" value={String(d.canjesMes)} icon="ticket" />
              ) : (
                <Stat label="Canjes del mes" icon="ticket" />
              )}
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

              <PCard title="Top locales por canjes" sub="Canjes del mes · ordenado de mayor a menor">
                {d.ranking.length === 0 ? (
                  <div className="py-[11px] text-[13px] text-mute">Sin locales</div>
                ) : (
                  <div className="max-h-[280px] overflow-y-auto pr-3">
                    {d.ranking.map((r, i) => (
                      <div
                        key={r.local.id}
                        className={`flex items-center gap-3 py-[11px] ${i === d.ranking.length - 1 ? '' : 'border-b border-line-soft'}`}
                      >
                        <div
                          className={`w-[22px] text-sm font-extrabold ${i === 0 ? 'text-brand' : 'text-faint'}`}
                        >
                          {i + 1}
                        </div>
                        {r.local.logo_url ? (
                          <img
                            src={r.local.logo_url}
                            className="h-[34px] w-[34px] rounded-full border border-line object-cover"
                          />
                        ) : (
                          <LogoBox size={34} />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-bold text-ink">{r.local.nombre}</div>
                          <div className="text-[11px] text-mute">{benCount(r.local)} benef.</div>
                        </div>
                        <span className="text-[13px] font-extrabold text-ink">{r.canjes}</span>
                      </div>
                    ))}
                  </div>
                )}
              </PCard>
            </div>
          </div>
        )}
      </DataView>
    </PanelShell>
  );
}
