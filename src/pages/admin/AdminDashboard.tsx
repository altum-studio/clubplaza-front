// pages/admin/AdminDashboard.tsx
// Panel Admin · Dashboard general. KPIs reales, "Altas de miembros" real (de las
// fechas de alta de usuarios) y "Top locales por canjes". El selector de mes
// (arriba) actualiza los canjes del mes y el ranking (?mes= en el backend).

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Area, PChip, PCard, Stat, LogoBox } from '@/components/panel/kit';
import { MonthPicker, monthValue, monthInitial } from '@/components/panel/MonthPicker';
import { DataView } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiLocal, Profile } from '@/types';
import { ADMIN_NAV } from '@/data/panelMock';

const benCount = (l: ApiLocal) =>
  Array.isArray(l.promos) && l.promos[0] && 'count' in l.promos[0]
    ? (l.promos[0] as { count: number }).count
    : (l.promos_count ?? 0);

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Altas por mes: 12 meses terminando en el mes de referencia (offset del picker).
function altasMensual(usuarios: Profile[], endOffset: number, months = 12) {
  const counts: Record<string, number> = {};
  for (const u of usuarios) {
    const k = (u.created_at || '').slice(0, 7); // YYYY-MM
    if (k) counts[k] = (counts[k] ?? 0) + 1;
  }
  const keys = Array.from({ length: months }, (_, i) => monthValue(endOffset - (months - 1 - i)));
  return { data: keys.map((k) => counts[k] ?? 0), labels: keys.map(monthInitial) };
}

// Altas por día: últimos 7 días (fecha real).
function altasSemanal(usuarios: Profile[]) {
  const counts: Record<string, number> = {};
  for (const u of usuarios) {
    const k = (u.created_at || '').slice(0, 10); // YYYY-MM-DD
    if (k) counts[k] = (counts[k] ?? 0) + 1;
  }
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  return { data: days.map((d) => counts[ymd(d)] ?? 0), labels: days.map((d) => DOW[d.getDay()]) };
}

export default function AdminDashboard() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  const mes = monthValue(monthOffset);

  // Base: no depende del mes (se carga una vez).
  const base = useAsync(
    () =>
      Promise.all([
        api.locales.list({ limit: 500 }),
        api.promos.list({ limit: 1 }),
        api.usuarios.list({ limit: 1000 }),
      ]).then(([l, p, u]) => ({
        locales: l.data,
        localesCount: l.count,
        promos: p.count,
        usuariosCount: u.count,
        usuarios: u.data,
      })),
    [],
  );

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
          const altas = vista === 'mes' ? altasMensual(b.usuarios, monthOffset) : altasSemanal(b.usuarios);
          const md = mesData.data;
          const ranking = md?.ranking ?? [];

          return (
            <div className="flex flex-col gap-4 lg:gap-[18px]">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Miembros totales" value={String(b.usuariosCount)} icon="users" />
                <Stat live label="Locales activos" value={String(b.localesCount)} icon="store" />
                <Stat live label="Beneficios publicados" value={String(b.promos)} icon="tag" />
                {md?.canjesMes != null ? (
                  <Stat live label="Canjes del mes" value={String(md.canjesMes)} icon="ticket" />
                ) : (
                  <Stat label="Canjes del mes" value={mesData.loading ? '…' : undefined} icon="ticket" />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
                <PCard
                  title="Altas de miembros"
                  sub={vista === 'mes' ? 'Nuevos registros por mes' : 'Nuevos registros por día (7d)'}
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
                  <Area data={altas.data} h={180} />
                  <div className="mt-1 flex justify-between">
                    {altas.labels.map((m, i) => (
                      <span key={i} className="text-[10.5px] font-semibold text-faint">
                        {m}
                      </span>
                    ))}
                  </div>
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
