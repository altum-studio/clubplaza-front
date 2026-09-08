// pages/panel/LocalStats.tsx
// Panel Local · Estadísticas de canjes. Datos reales desde GET /api/canjes/stats/mine:
// canjes del mes, miembros únicos, serie de los últimos 7 días y beneficio más
// canjeado. (El backend devuelve el mes actual; el selector queda como referencia.)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { Bars, PButton, PCard, Stat } from '@/components/panel/kit';
import { MonthPicker, monthLabel, monthValue } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { useLocalScope } from '@/hooks/useLocalScope';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';
import { diaSemanaDe, hoyAR } from '@/lib/fechas';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function LocalStats() {
  const navigate = useNavigate();
  const [monthOffset, setMonthOffset] = useState(0);
  const { activeLocalId } = useLocalScope();
  const mes = monthValue(monthOffset);
  const state = useAsync(
    () => api.canjes.statsMine({ local_id: activeLocalId ?? undefined, mes }),
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
        {(s) => {
          const dias = s.canjes_ultimos_7_dias ?? [];
          const serie = dias.map((d) => d.cantidad);
          // Con ?mes= el backend manda TODOS los días del mes en este campo (no 7).
          // Título y eje se adaptan: mes entero → día del mes (1, 5, 10…); 7 días → Lun, Mar…
          const esMesEntero = dias.length > 7;
          const labels = dias.map((d) => {
            if (!esMesEntero) return DOW[diaSemanaDe(d.fecha)] ?? '';
            const n = Number(d.fecha.slice(8, 10));
            return n === 1 || n % 5 === 0 ? String(n) : '';
          });
          const hoy = hoyAR();
          // Barra de HOY (por fecha, no por posición): resaltada y con trama de "parcial".
          // En un mes pasado no existe → ninguna barra resaltada.
          const hoyIdx = dias.findIndex((d) => d.fecha.slice(0, 10) === hoy);
          // "Últimos 7 días" = los 7 últimos días hasta hoy dentro de la serie (no el mes entero).
          const total7 = dias
            .filter((d) => d.fecha.slice(0, 10) <= hoy)
            .slice(-7)
            .reduce((a, d) => a + d.cantidad, 0);
          const porMiembro = s.miembros_unicos_mes ? s.canjes_mes / s.miembros_unicos_mes : 0;

          return (
            <div className="flex flex-col gap-4">
              {/* ── KPIs (reales) ── */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Canjes del mes" info="Canjes válidos en tu local en el mes elegido." value={String(s.canjes_mes)} icon="ticket" />
                <Stat live label="Miembros activos del mes" info="Miembros distintos que canjearon al menos una vez en el mes elegido." value={String(s.miembros_unicos_mes)} icon="users" />
                <Stat
                  live
                  label="Canjes / miembro" info="Promedio de canjes por miembro activo en el mes."
                  value={porMiembro ? porMiembro.toFixed(1).replace('.', ',') : '—'}
                  icon="chart"
                />
                <Stat live label="Últimos 7 días" info="Canjes de los últimos 7 días hasta hoy." value={String(total7)} icon="up" />
              </div>

              {/* ── Gráficos ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
                <PCard
                  title="Canjes por día"
                  sub={(esMesEntero ? monthLabel(monthOffset) : 'Últimos 7 días') + (hoyIdx >= 0 ? ' · hoy parcial' : '')}
                >
                  {serie.length ? (
                    <Bars
                      data={serie}
                      labels={labels}
                      highlight={hoyIdx >= 0 ? hoyIdx : undefined}
                      parcial={hoyIdx >= 0 ? hoyIdx : undefined}
                      h={210}
                    />
                  ) : (
                    <PanelEmpty
                      icon="chart"
                      title="Sin canjes todavía"
                      hint="Cuando registres canjes vas a ver la evolución acá."
                    />
                  )}
                </PCard>

                <PCard title="Beneficio más canjeado">
                  {s.beneficio_mas_canjeado ? (
                    <div className="flex flex-col gap-1.5 py-3">
                      <div className="text-[16px] font-extrabold leading-tight text-ink">
                        {s.beneficio_mas_canjeado.titulo}
                      </div>
                      <div className="text-[13px] text-mute">
                        {s.beneficio_mas_canjeado.cantidad} canjes este mes
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
