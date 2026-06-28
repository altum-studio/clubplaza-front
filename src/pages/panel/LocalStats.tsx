// pages/panel/LocalStats.tsx
// Panel Local · Estadísticas de canjes. Datos reales desde GET /api/canjes/stats/mine:
// canjes del mes, miembros únicos, serie de los últimos 7 días y beneficio más
// canjeado. (El backend devuelve el mes actual; el selector queda como referencia.)

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Bars, PCard, Stat } from '@/components/panel/kit';
import { MonthPicker } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function LocalStats() {
  const [monthOffset, setMonthOffset] = useState(0);
  const state = useAsync(() => api.canjes.statsMine(), []);

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Estadísticas de canjes"
      topbarActions={<MonthPicker offset={monthOffset} onChange={setMonthOffset} />}
    >
      <DataView state={state}>
        {(s) => {
          const dias = s.canjes_ultimos_7_dias ?? [];
          const serie = dias.map((d) => d.cantidad);
          const labels = dias.map((d) => {
            const dt = new Date(`${d.fecha}T00:00:00`);
            return isNaN(dt.getTime()) ? '' : DOW[dt.getDay()];
          });
          const total7 = serie.reduce((a, b) => a + b, 0);
          const porMiembro = s.miembros_unicos_mes ? s.canjes_mes / s.miembros_unicos_mes : 0;

          return (
            <div className="flex flex-col gap-4">
              {/* ── KPIs (reales) ── */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Canjes del mes" value={String(s.canjes_mes)} icon="ticket" />
                <Stat live label="Miembros únicos" value={String(s.miembros_unicos_mes)} icon="users" />
                <Stat
                  live
                  label="Canjes / miembro"
                  value={porMiembro ? porMiembro.toFixed(1).replace('.', ',') : '—'}
                  icon="chart"
                />
                <Stat live label="Últimos 7 días" value={String(total7)} icon="up" />
              </div>

              {/* ── Gráficos ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
                <PCard title="Canjes por día" sub="Últimos 7 días">
                  {serie.length ? (
                    <Bars data={serie} labels={labels} highlight={serie.length - 1} h={210} />
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
