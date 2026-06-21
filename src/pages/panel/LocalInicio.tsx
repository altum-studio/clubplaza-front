// pages/panel/LocalInicio.tsx
// Panel Local (comercio adherido) · Inicio. 4 KPIs + canjes por día (Bars) y
// actividad reciente de validaciones. Métricas detrás de METRICS_SOON.

import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import {
  Bars,
  METRICS_SOON,
  PButton,
  PCard,
  PChip,
  SoonTag,
  Stat,
} from '@/components/panel/kit';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { CANJES_DIA, DIAS, LOCAL_NAV } from '@/data/panelMock';

const METRICS_LABELS = ['Promedio diario', 'Mejor día', 'Ticket promedio est.'];

export default function LocalInicio() {
  const navigate = useNavigate();

  const state = useAsync(
    () =>
      Promise.all([
        api.locales.mine().catch(() => null),
        api.promos.mine({ limit: 50 }),
      ]).then(([local, promos]) => ({ local, promos })),
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
        {(d) => (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat
                live
                label="Beneficios activos"
                value={String(d.promos.data.filter((p) => p.activa).length)}
                icon="tag"
              />
              <Stat live label="Beneficios totales" value={String(d.promos.count)} icon="chart" />
              <Stat label="Canjes hoy" icon="ticket" />
              <Stat label="Miembros alcanzados" icon="users" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
              <PCard
                title="Canjes por día"
                sub="Últimos 7 días"
                actions={<PChip icon="cal">Esta semana</PChip>}
              >
                <Bars data={CANJES_DIA} labels={DIAS} highlight={6} h={170} />
                {METRICS_SOON && (
                  <div className="mt-4 flex gap-6 border-t border-line-soft pt-3.5">
                    {METRICS_LABELS.map((label) => (
                      <div key={label}>
                        <div className="text-[11px] font-semibold text-mute">{label}</div>
                        <div className="mt-1.5">
                          <SoonTag small />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PCard>

              <PCard
                title="Actividad reciente"
                actions={<span className="text-xs font-bold text-brand">Ver todo</span>}
              >
                <PanelEmpty
                  icon="clock"
                  title="Sin validaciones todavía"
                  hint="Las validaciones de credenciales van a aparecer acá."
                />
              </PCard>
            </div>
          </div>
        )}
      </DataView>
    </PanelShell>
  );
}
