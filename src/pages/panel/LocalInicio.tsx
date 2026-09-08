// pages/panel/LocalInicio.tsx
// Panel Local (comercio adherido) · Inicio. 4 KPIs reales + canjes por día
// (últimos 7) y actividad reciente de validaciones, todo desde la API
// (api.promos.mine + api.canjes.statsMine + api.canjes.mine).

import { Link, useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, Bars, PButton, PCard, Stat } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { useLocalScope } from '@/hooks/useLocalScope';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';
import { diaSemanaAR, diaSemanaDe, formatoAR, hoyAR } from '@/lib/fechas';
import { promoPorVencer, promoPublicada, promoVencida, promoVigenteHoy } from '@/lib/opciones';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const ESTADO: Record<string, { tone: 'ok' | 'bad' | 'warn'; label: string }> = {
  ok: { tone: 'ok', label: 'Aplicado' },
  rechazado: { tone: 'bad', label: 'Rechazado' },
  repetido: { tone: 'warn', label: 'Repetido' },
};

// Timestamp UTC de la API → hora Argentina.
function horaLabel(iso: string): string {
  return formatoAR(iso, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function LocalInicio() {
  const navigate = useNavigate();

  const { activeLocalId, activeLocal } = useLocalScope();
  const state = useAsync(
    () =>
      Promise.all([
        api.promos.mine({ local_id: activeLocalId ?? undefined, limit: 50 }),
        api.canjes.statsMine({ local_id: activeLocalId ?? undefined }).catch(() => null),
        api.canjes.mine({ local_id: activeLocalId ?? undefined, limit: 40 }).catch(() => null),
      ]).then(([promos, stats, recientes]) => ({ promos, stats, recientes })),
    [activeLocalId],
  );

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Café Central"
      userRole="Comercio adherido"
      topbarTitle={`Hola, ${activeLocal?.nombre ?? 'tu comercio'}`}
      topbarActions={
        <PButton icon="qr" onClick={() => navigate('/panel/validar')}>
          Validar credencial
        </PButton>
      }
    >
      <DataView state={state}>
        {(d) => {
          const hoy = hoyAR();
          const dias = d.stats?.canjes_ultimos_7_dias ?? [];
          const serie = dias.map((x) => x.cantidad);
          const labels = dias.map((x) => DOW[diaSemanaDe(x.fecha)] ?? '');
          // "Canjes hoy": el bucket cuya fecha es HOY (Argentina), no el último por posición.
          // El mismo índice marca la barra de hoy como parcial en el gráfico.
          const hoyIdx = dias.findIndex((x) => x.fecha.slice(0, 10) === hoy);
          const canjesHoy = hoyIdx >= 0 ? dias[hoyIdx].cantidad : 0;
          const recientes = d.recientes?.data ?? [];
          // Vigente (definición canónica): activa + dentro de vigencia + hoy es día válido.
          const vigentes = d.promos.data.filter((p) => promoVigenteHoy(p, hoy, diaSemanaAR())).length;
          // Publicados: activos y no vencidos (vigentes hoy o algún día de la semana).
          const publicados = d.promos.data.filter((p) => promoPublicada(p, hoy)).length;
          // Vencimientos (mismo criterio que el admin): activos vencidos y los que vencen en 30 días.
          const activas = d.promos.data.filter((p) => p.activa);
          const vencidos = activas.filter((p) => promoVencida(p, hoy)).length;
          const porVencer = activas.filter((p) => promoPorVencer(p, hoy)).length;

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Una sola card: vigentes hoy, con el total publicado como referencia. */}
                <Stat
                  live
                  label="Beneficios vigentes"
                  value={String(vigentes)}
                  unit={`de ${publicados} publicados`}
                  icon="tag"
                />
                <Stat live label="Canjes hoy" value={d.stats ? String(canjesHoy) : '—'} icon="ticket" />
                <Stat
                  live
                  label="Miembros activos del mes"
                  value={d.stats ? String(d.stats.miembros_unicos_mes) : '—'}
                  icon="users"
                />
              </div>

              {/* Aviso de vencimientos (solo si hay algo que avisar). */}
              {(vencidos > 0 || porVencer > 0) && (
                <div className="flex flex-col gap-1.5 rounded-[12px] border border-warn/40 bg-warn-soft px-4 py-3 text-[12.5px] transition-colors hover:bg-[oklch(0.925_0.06_80)]">
                  {vencidos > 0 && (
                    <Link
                      to="/panel/beneficios?resaltar=vencidos"
                      className="flex items-center gap-2 py-0.5 text-ink"
                    >
                      <Icon name="clock" size={14} className="flex-shrink-0 text-bad" />
                      <span>
                        <b>{vencidos}</b>{' '}
                        {vencidos === 1 ? 'beneficio vencido sigue publicado' : 'beneficios vencidos siguen publicados'}
                      </span>
                      <Icon name="chevR" size={14} className="text-mute" />
                    </Link>
                  )}
                  {porVencer > 0 && (
                    <Link
                      to="/panel/beneficios?resaltar=por-vencer"
                      className="flex items-center gap-2 py-0.5 text-ink"
                    >
                      <Icon name="cal" size={14} className="flex-shrink-0 text-warn" />
                      <span>
                        <b>{porVencer}</b> {porVencer === 1 ? 'beneficio vence' : 'beneficios vencen'} en los próximos 30 días
                      </span>
                      <Icon name="chevR" size={14} className="text-mute" />
                    </Link>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                <PCard title="Canjes por día" sub={`Últimos 7 días${hoyIdx >= 0 ? ' · hoy parcial' : ''}`}>
                  {serie.length ? (
                    <Bars
                      data={serie}
                      labels={labels}
                      highlight={hoyIdx >= 0 ? hoyIdx : undefined}
                      parcial={hoyIdx >= 0 ? hoyIdx : undefined}
                      h={170}
                    />
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
