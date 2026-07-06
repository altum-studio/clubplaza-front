// pages/panel/LocalInicio.tsx
// Panel Local (comercio adherido) · Inicio. 4 KPIs reales + canjes por día
// (últimos 7) y actividad reciente de validaciones, todo desde la API
// (api.promos.mine + api.canjes.statsMine + api.canjes.mine).

import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, Bars, PButton, PCard, Stat } from '@/components/panel/kit';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const ESTADO: Record<string, { tone: 'ok' | 'bad' | 'warn'; label: string }> = {
  ok: { tone: 'ok', label: 'Aplicado' },
  rechazado: { tone: 'bad', label: 'Rechazado' },
  repetido: { tone: 'warn', label: 'Repetido' },
};

function horaLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function LocalInicio() {
  const navigate = useNavigate();

  const state = useAsync(
    () =>
      Promise.all([
        api.locales.mine().catch(() => null),
        api.promos.mine({ limit: 50 }),
        api.canjes.statsMine().catch(() => null),
        api.canjes.mine({ limit: 40 }).catch(() => null),
      ]).then(([local, promos, stats, recientes]) => ({ local, promos, stats, recientes })),
    [],
  );

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Café Central"
      userRole="Comercio adherido"
      topbarTitle={`Hola, ${state.data?.local?.nombre ?? 'tu comercio'}`}
      topbarActions={
        <PButton icon="qr" onClick={() => navigate('/panel/validar')}>
          Validar credencial
        </PButton>
      }
    >
      <DataView state={state}>
        {(d) => {
          const dias = d.stats?.canjes_ultimos_7_dias ?? [];
          const serie = dias.map((x) => x.cantidad);
          const labels = dias.map((x) => {
            const dt = new Date(`${x.fecha}T00:00:00`);
            return isNaN(dt.getTime()) ? '' : DOW[dt.getDay()];
          });
          const canjesHoy = serie.length ? serie[serie.length - 1] : 0;
          const recientes = d.recientes?.data ?? [];

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat
                  live
                  label="Beneficios activos"
                  value={String(d.promos.data.filter((p) => p.activa).length)}
                  icon="tag"
                />
                <Stat live label="Beneficios totales" value={String(d.promos.count)} icon="chart" />
                <Stat
                  live={!!d.stats}
                  label="Canjes hoy"
                  value={d.stats ? String(canjesHoy) : undefined}
                  icon="ticket"
                />
                <Stat
                  live={!!d.stats}
                  label="Miembros del mes"
                  value={d.stats ? String(d.stats.miembros_unicos_mes) : undefined}
                  icon="users"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                <PCard title="Canjes por día" sub="Últimos 7 días">
                  {serie.length ? (
                    <Bars data={serie} labels={labels} highlight={serie.length - 1} h={170} />
                  ) : (
                    <PanelEmpty
                      icon="chart"
                      title="Sin canjes todavía"
                      hint="Cuando valides credenciales vas a ver la evolución acá."
                    />
                  )}
                </PCard>

                <PCard
                  title="Actividad"
                  actions={
                    <button
                      type="button"
                      onClick={() => navigate('/panel/historial')}
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      Ver todo
                    </button>
                  }
                >
                  {recientes.length === 0 ? (
                    <PanelEmpty
                      icon="clock"
                      title="Sin validaciones todavía"
                      hint="Las validaciones de credenciales van a aparecer acá."
                    />
                  ) : (
                    <div className="flex max-h-[300px] flex-col overflow-y-auto pr-1">
                      {recientes.map((c, i) => {
                        const e = ESTADO[c.estado] ?? { tone: 'mute' as const, label: c.estado };
                        return (
                          <div
                            key={c.id}
                            className={`flex items-center gap-3 py-2.5 ${i === recientes.length - 1 ? '' : 'border-b border-line-soft'}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-bold text-ink">
                                {`${c.usuarios?.nombre ?? ''} ${c.usuarios?.apellido ?? ''}`.trim() || '—'}
                              </div>
                              <div className="truncate text-[11px] text-mute">
                                {c.promos?.titulo ?? ''} · {horaLabel(c.fecha)}
                              </div>
                            </div>
                            <Badge tone={e.tone}>{e.label}</Badge>
                          </div>
                        );
                      })}
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
