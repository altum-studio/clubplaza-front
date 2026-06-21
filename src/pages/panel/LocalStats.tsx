// pages/panel/LocalStats.tsx
// Panel Local · Estadísticas de canjes. 4 KPIs + evolución mensual (área) +
// beneficio más canjeado. Métricas detrás de METRICS_SOON.

import { PanelShell } from '@/components/panel/PanelShell';
import { Area, PButton, PCard, PChip, SoonBox, Stat } from '@/components/panel/kit';
import { LOCAL_NAV, SERIE_MES } from '@/data/panelMock';

export default function LocalStats() {
  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Café Central"
      userRole="Comercio adherido"
      topbarTitle="Estadísticas de canjes"
      topbarActions={
        <>
          <PChip icon="cal">Junio 2026</PChip>
          <PButton icon="download" variant="outline">
            Exportar
          </PButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Canjes del mes" value="2.480" icon="ticket" delta="+18%" />
          <Stat label="Miembros únicos" value="1.284" icon="users" delta="+5%" />
          <Stat label="Canjes / miembro" value="1,9" icon="chart" delta="+0,3" />
          <Stat label="Tasa de repetición" value="34" unit="%" icon="up" delta="-2%" trend="down" />
        </div>

        {/* ── Gráficos ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
          <PCard title="Canjes en el tiempo" sub="Evolución mensual · últimos 12 meses">
            <Area data={SERIE_MES} h={210} />
          </PCard>

          <PCard title="Beneficio más canjeado">
            <SoonBox h={210} />
          </PCard>
        </div>
      </div>
    </PanelShell>
  );
}
