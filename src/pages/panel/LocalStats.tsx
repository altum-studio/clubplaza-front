// pages/panel/LocalStats.tsx
// Panel Local · Estadísticas de canjes. Datos reales desde GET /api/canjes/stats/mine
// (?mes=): canjes del mes, miembros activos, serie diaria y beneficio más canjeado.
// Las promos del local se traen para mostrar el banner del beneficio más canjeado.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { LogoBox, PButton, PCard, Stat } from '@/components/panel/kit';
import { AltasChart } from '@/components/panel/AltasChart';
import { MonthPicker, monthLabel, monthValue } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { useLocalScope } from '@/hooks/useLocalScope';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';
import { ddmm, hoyAR } from '@/lib/fechas';

export default function LocalStats() {
  const navigate = useNavigate();
  const [monthOffset, setMonthOffset] = useState(0);
  const { activeLocalId, activeLocal } = useLocalScope();
  const mes = monthValue(monthOffset);
  const state = useAsync(
    () =>
      Promise.all([
        api.canjes.statsMine({ local_id: activeLocalId ?? undefined, mes }),
        // Promos del local: solo para el banner del beneficio más canjeado (si falla, sin imagen).
        api.promos.mine({ local_id: activeLocalId ?? undefined, limit: 200 }).catch(() => null),
      ]).then(([stats, promos]) => ({ stats, promos: promos?.data ?? [] })),
    [activeLocalId, mes],
  );

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Estadísticas de canjes"
      topbarActions={
        <>
          <MonthPicker offset={monthOffset} onChange={setMonthOffset} />
          {/* Historial no entra en la nav inferior (6 ítems): link fijo acá. */}
          <PButton variant="outline" icon="clock" onClick={() => navigate('/panel/historial')}>
            Historial
          </PButton>
        </>
      }
    >
      <DataView state={state}>
        {(d) => {
          const s = d.stats;
          const hoy = hoyAR();
          const esMesActual = mes === hoy.slice(0, 7);
          // Serie diaria del mes elegido (con ?mes= el backend manda el mes entero).
          // En el mes en curso se corta en HOY: los días futuros no aportan nada.
          const dias = (s.serie ?? s.canjes_ultimos_7_dias ?? []).filter(
            (x) => !esMesActual || x.fecha.slice(0, 10) <= hoy,
          );
          const buckets = dias.map((x) => ({ periodo: x.fecha.slice(0, 10), count: x.cantidad }));
          const hoyParcial = esMesActual && buckets.length > 0 && buckets[buckets.length - 1].periodo === hoy;
          // "Últimos 7 días" = los 7 últimos días de la serie (hasta hoy en el mes actual).
          const total7 = dias.slice(-7).reduce((a, x) => a + x.cantidad, 0);
          const porMiembro = s.miembros_unicos_mes ? s.canjes_mes / s.miembros_unicos_mes : 0;
          // Beneficio más canjeado + su banner (desde las promos del local).
          const top = s.beneficio_mas_canjeado;
          const topPromo = top ? d.promos.find((p) => p.id === top.promo_id) : undefined;
          const topImg = topPromo?.banner_url ?? activeLocal?.logo_url ?? null;
          const pct = top && s.canjes_mes ? Math.round((top.cantidad / s.canjes_mes) * 100) : 0;

          return (
            <div className="flex flex-col gap-4">
              {/* ── KPIs (reales) ── */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Canjes del mes" info="Canjes válidos en tu local en el mes elegido." value={String(s.canjes_mes)} icon="ticket" />
                <Stat live label="Miembros activos del mes" info="Miembros distintos que canjearon al menos una vez en el mes elegido." value={String(s.miembros_unicos_mes)} icon="users" />
                <Stat
                  live
                  label="Canjes / miembro"
                  info="Promedio de canjes por miembro activo en el mes."
                  value={porMiembro ? porMiembro.toFixed(1).replace('.', ',') : '—'}
                  icon="chart"
                />
                <Stat live label="Últimos 7 días" info="Canjes de los últimos 7 días hasta hoy." value={String(total7)} icon="up" />
              </div>

              {/* ── Gráficos ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
                <PCard
                  title="Canjes por día"
                  sub={`${monthLabel(monthOffset)}${hoyParcial ? ` · hoy parcial · al ${ddmm(hoy)}` : ''}`}
                >
                  {buckets.length ? (
                    <div className="h-[240px]">
                      <AltasChart buckets={buckets} vista="dia" parcial={hoyParcial} />
                    </div>
                  ) : (
                    <PanelEmpty
                      icon="chart"
                      title="Sin canjes todavía"
                      hint="Cuando registres canjes vas a ver la evolución acá."
                    />
                  )}
                </PCard>

                <PCard title="Beneficio más canjeado" sub={monthLabel(monthOffset)}>
                  {top ? (
                    <div className="flex items-center gap-4 py-2">
                      {topImg ? (
                        <img
                          src={topImg}
                          alt=""
                          className="h-16 w-16 flex-shrink-0 rounded-full border border-line object-cover"
                        />
                      ) : (
                        <LogoBox size={64} />
                      )}
                      <div className="min-w-0">
                        <div className="text-[16px] font-extrabold leading-tight text-ink">{top.titulo}</div>
                        <div className="mt-1 text-[13px] text-graytext">
                          <b className="text-ink">{top.cantidad}</b> {top.cantidad === 1 ? 'canje' : 'canjes'}
                          {pct > 0 ? ` · ${pct}% de los canjes del mes` : ''}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <PanelEmpty
                      icon="tag"
                      title="Sin datos del mes"
                      hint="Cuando haya canjes, vas a ver el beneficio más usado."
                    />
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
