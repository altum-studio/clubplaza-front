// pages/admin/AdminDashboard.tsx
// Panel Admin · Dashboard general. KPIs reales, "Altas de miembros" desde
// GET /api/usuarios/altas (mes/semana) y "Top locales por canjes". El selector
// de mes actualiza los canjes del mes y el ranking (?mes= en el backend).

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { PChip, PCard, Stat, LogoBox } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { AltasChart } from '@/components/panel/AltasChart';
import { MonthPicker, monthValue } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiLocal } from '@/types';
import { ADMIN_NAV } from '@/data/panelMock';

const benCount = (l: ApiLocal) =>
  Array.isArray(l.promos) && l.promos[0] && 'count' in l.promos[0]
    ? (l.promos[0] as { count: number }).count
    : (l.promos_count ?? 0);

// La vista mensual arranca en el mes de lanzamiento (no mostramos meses previos).
const LAUNCH_MONTH = '2026-06';

// Enumera 'YYYY-MM' desde `from` hasta `to` inclusive (serie de canjes por mes).
function monthsRange(from: string, to: string): string[] {
  const out: string[] = [];
  let y = Number(from.slice(0, 4));
  let m = Number(from.slice(5, 7));
  const ty = Number(to.slice(0, 4));
  const tm = Number(to.slice(5, 7));
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

export default function AdminDashboard() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  // Métrica del gráfico principal: se alterna con la flecha del título.
  const [metric, setMetric] = useState<'altas' | 'canjes'>('altas');
  const mes = monthValue(monthOffset);

  // Base: totales (cada fuente cae por separado, así un endpoint roto no tumba todo).
  const base = useAsync(
    () =>
      Promise.all([
        api.locales.list({ limit: 500 }).catch(() => ({ data: [] as ApiLocal[], count: 0 })),
        api.promos.list({ limit: 1 }).catch(() => ({ data: [], count: 0 })),
        api.usuarios.list({ limit: 1 }).catch(() => ({ data: [], count: 0 })),
      ]).then(([l, p, u]) => ({
        locales: l.data,
        localesCount: l.count,
        promos: p.count,
        usuariosCount: u.count,
      })),
    [],
  );

  // Altas de miembros (endpoint dedicado): cambia con el toggle mes/semana.
  const altas = useAsync(() => api.usuarios.altas(vista), [vista]);

  // Serie de canjes en el MISMO formato que altas, para el toggle del gráfico.
  // Semana → últimos 7 días (canjes_ultimos_7_dias); Mes → total de cada mes
  // desde el lanzamiento (una llamada a stats por mes). No usa el backend nuevo.
  const canjesSerie = useAsync(async () => {
    if (vista === 'semana') {
      const s = await api.canjes.stats({});
      return s.canjes_ultimos_7_dias.map((d) => ({ periodo: d.fecha, count: d.cantidad }));
    }
    const months = monthsRange(LAUNCH_MONTH, monthValue(0));
    return Promise.all(
      months.map((m) =>
        api.canjes
          .stats({ mes: m })
          .then((s) => ({ periodo: m, count: s.canjes_mes }))
          .catch(() => ({ periodo: m, count: 0 })),
      ),
    );
  }, [vista]);

  // Del mes: canjes globales + ranking por local (refetch al cambiar el mes).
  const mesData = useAsync(async () => {
    const b = base.data;
    if (!b) return null;
    const [globalStats, ranking] = await Promise.all([
      api.canjes.stats({ mes }).catch(() => null),
      Promise.all(
        b.locales.map((loc) =>
          api.canjes
            .stats({ local_id: loc.id, mes })
            .then((s) => ({ local: loc, canjes: s.canjes_mes }))
            .catch(() => ({ local: loc, canjes: 0 })),
        ),
      ),
    ]);
    ranking.sort((a, b2) => b2.canjes - a.canjes);
    return { canjesMes: globalStats?.canjes_mes ?? null, ranking };
  }, [mes, base.data]);

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Dashboard general"
      topbarActions={<MonthPicker offset={monthOffset} onChange={setMonthOffset} />}
    >
      <DataView state={base}>
        {(b) => {
          const md = mesData.data;
          const ranking = md?.ranking ?? [];
          const altasData = altas.data ?? [];
          // Mensual: desde el lanzamiento. Semanal: los 7 días tal cual.
          const altasVista =
            vista === 'mes' ? altasData.filter((b) => b.periodo >= LAUNCH_MONTH) : altasData;
          const canjesData = canjesSerie.data ?? [];
          const canjesVista =
            vista === 'mes' ? canjesData.filter((b) => b.periodo >= LAUNCH_MONTH) : canjesData;
          // El gráfico principal muestra altas o canjes según el toggle.
          const esAltas = metric === 'altas';
          const chartState = esAltas ? altas : canjesSerie;
          const chartData = esAltas ? altasVista : canjesVista;

          return (
            <div className="flex flex-col gap-4 lg:gap-[18px]">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Miembros totales" value={String(b.usuariosCount)} icon="users" />
                <Stat live label="Locales activos" value={String(b.localesCount)} icon="store" />
                <Stat live label="Beneficios publicados" value={String(b.promos)} icon="tag" />
                {md?.canjesMes != null ? (
                  <Stat live label="Canjes del mes" value={String(md.canjesMes)} icon="ticket" />
                ) : (
                  <Stat live label="Canjes del mes" value={mesData.loading ? '…' : '—'} icon="ticket" />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
                <PCard
                  fill
                  title={
                    <button
                      type="button"
                      onClick={() => setMetric((m) => (m === 'altas' ? 'canjes' : 'altas'))}
                      className="group -my-1 flex cursor-pointer items-center gap-1.5"
                      aria-label={esAltas ? 'Ver canjes' : 'Ver altas de miembros'}
                      title={esAltas ? 'Ver canjes' : 'Ver altas de miembros'}
                    >
                      <span>{esAltas ? 'Altas de miembros' : 'Canjes'}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fill text-mute transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                        <Icon name="chevR" size={15} />
                      </span>
                    </button>
                  }
                  sub={
                    esAltas
                      ? vista === 'mes'
                        ? 'Nuevos registros por mes'
                        : 'Nuevos registros por día (7d)'
                      : vista === 'mes'
                        ? 'Canjes por mes'
                        : 'Canjes por día (7d)'
                  }
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
                  {chartState.error ? (
                    <PanelEmpty
                      icon={esAltas ? 'users' : 'ticket'}
                      title={esAltas ? 'No se pudieron cargar las altas' : 'No se pudieron cargar los canjes'}
                      hint={chartState.error}
                    />
                  ) : chartState.loading && chartData.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-14 text-[13px] text-mute">
                      Cargando…
                    </div>
                  ) : (
                    <AltasChart buckets={chartData} vista={vista} />
                  )}
                </PCard>

                <PCard title="Top locales por canjes" sub="Canjes del mes · ordenado de mayor a menor">
                  {mesData.loading ? (
                    <div className="py-[11px] text-[13px] text-mute">Cargando…</div>
                  ) : ranking.length === 0 ? (
                    <div className="py-[11px] text-[13px] text-mute">Sin locales</div>
                  ) : (
                    <div className="max-h-[280px] overflow-y-auto pr-3">
                      {ranking.map((r, i) => (
                        <div
                          key={r.local.id}
                          className={`flex items-center gap-3 py-[11px] ${i === ranking.length - 1 ? '' : 'border-b border-line-soft'}`}
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
          );
        }}
      </DataView>
    </PanelShell>
  );
}
