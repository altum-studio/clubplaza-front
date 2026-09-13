// pages/panel/LocalStats.tsx
// Panel Local · Estadísticas de canjes. Datos reales desde GET /api/canjes/stats/mine
// (?mes=): canjes del mes, miembros activos, serie diaria y beneficio más canjeado.
// El gráfico se navega en el tiempo como el del admin: vista Mes (‹ › cambia el
// mes, igual que el selector de arriba) o Semana (‹ › va a semanas anteriores
// vía /canjes/serie). Las promos del local se traen para el banner del más canjeado.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { LogoBox, PButton, PCard, PChip, Stat } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { AltasChart } from '@/components/panel/AltasChart';
import { MonthPicker, monthLabel, monthValue } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { useLocalScope } from '@/hooks/useLocalScope';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';
import { ddmm, hoyAR, rangoSemana } from '@/lib/fechas';

export default function LocalStats() {
  const navigate = useNavigate();
  const [monthOffset, setMonthOffset] = useState(0);
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  // Vista Semana: 0 = últimos 7 días, +1 = semana anterior, …
  const [semanaBack, setSemanaBack] = useState(0);
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
  // Serie de la semana elegida (solo en vista Semana).
  const semana = useAsync(async () => {
    if (vista !== 'semana') return null;
    const { desde, hasta } = rangoSemana(semanaBack);
    return api.canjes.serie(desde, hasta, activeLocalId ?? undefined).catch(() => []);
  }, [vista, semanaBack, activeLocalId]);

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
          const diasMes = (s.serie ?? s.canjes_ultimos_7_dias ?? []).filter(
            (x) => !esMesActual || x.fecha.slice(0, 10) <= hoy,
          );
          const diasChart = vista === 'mes' ? diasMes : (semana.data ?? []);
          const buckets = diasChart.map((x) => ({ periodo: x.fecha.slice(0, 10), count: x.cantidad }));
          const ultimo = buckets[buckets.length - 1]?.periodo;
          const hoyParcial = !!ultimo && ultimo === hoy;
          // "Últimos 7 días" = los 7 últimos días del mes actual hasta hoy.
          const total7 = diasMes.slice(-7).reduce((a, x) => a + x.cantidad, 0);
          const porMiembro = s.miembros_unicos_mes ? s.canjes_mes / s.miembros_unicos_mes : 0;
          // Beneficio más canjeado + su banner (desde las promos del local).
          const top = s.beneficio_mas_canjeado;
          const topPromo = top ? d.promos.find((p) => p.id === top.promo_id) : undefined;
          const topImg = topPromo?.banner_url ?? activeLocal?.logo_url ?? null;
          const pct = top && s.canjes_mes ? Math.round((top.cantidad / s.canjes_mes) * 100) : 0;
          // Label del navegador de período.
          const periodoLabel =
            vista === 'mes'
              ? monthLabel(monthOffset)
              : semanaBack === 0
                ? 'Últimos 7 días'
                : rangoSemana(semanaBack).label;

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
                  sub={`${periodoLabel}${hoyParcial ? ` · hoy parcial · al ${ddmm(hoy)}` : ''}`}
                  actions={
                    <div className="flex flex-shrink-0 gap-1.5">
                      <PChip active={vista === 'mes'} onClick={() => setVista('mes')}>
                        Mes
                      </PChip>
                      <PChip
                        active={vista === 'semana'}
                        onClick={() => {
                          setVista('semana');
                          setSemanaBack(0);
                        }}
                      >
                        Semana
                      </PChip>
                    </div>
                  }
                >
                  {/* Navegador de período: meses (vista Mes) o semanas (vista Semana) */}
                  <div className="mb-2.5 flex items-center justify-between rounded-lg bg-fill px-2 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        vista === 'mes' ? setMonthOffset((o) => o - 1) : setSemanaBack((w) => w + 1)
                      }
                      aria-label={vista === 'mes' ? 'Mes anterior' : 'Semana anterior'}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-graytext hover:bg-white disabled:opacity-30"
                    >
                      <Icon name="chevL" size={15} />
                    </button>
                    <span className="text-[12px] font-semibold text-graytext">{periodoLabel}</span>
                    <button
                      type="button"
                      onClick={() =>
                        vista === 'mes'
                          ? setMonthOffset((o) => Math.min(0, o + 1))
                          : setSemanaBack((w) => Math.max(0, w - 1))
                      }
                      disabled={vista === 'mes' ? monthOffset >= 0 : semanaBack === 0}
                      aria-label={vista === 'mes' ? 'Mes siguiente' : 'Semana siguiente'}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-graytext hover:bg-white disabled:opacity-30"
                    >
                      <Icon name="chevR" size={15} />
                    </button>
                  </div>
                  {vista === 'semana' && semana.loading ? (
                    <div className="flex items-center justify-center py-14 text-[13px] text-mute">Cargando…</div>
                  ) : buckets.length ? (
                    <div className="h-[240px]">
                      <AltasChart buckets={buckets} vista={vista === 'mes' ? 'dia' : 'semana'} parcial={hoyParcial} />
                    </div>
                  ) : (
                    <PanelEmpty
                      icon="chart"
                      title={vista === 'semana' && semanaBack > 0 ? 'Sin datos para esta semana' : 'Sin canjes todavía'}
                      hint={
                        vista === 'semana' && semanaBack > 0
                          ? 'No hay registros en este rango.'
                          : 'Cuando registres canjes vas a ver la evolución acá.'
                      }
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
