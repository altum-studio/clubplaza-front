// pages/panel/LocalHistorial.tsx
// Panel Local · Historial de validaciones (canjes). Lista real desde
// GET /api/canjes/mine: qué miembro usó qué beneficio, cuándo y su estado.

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, PCard, Table, type Column } from '@/components/panel/kit';
import { MonthPicker, monthLabel, monthValue } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { useLocalScope } from '@/hooks/useLocalScope';
import { api } from '@/lib/api';
import type { CanjeHistorialItem } from '@/types';
import { LOCAL_NAV } from '@/data/panelMock';
import { formatoAR, mesAR } from '@/lib/fechas';

const ESTADO: Record<string, { tone: 'ok' | 'bad' | 'warn'; label: string }> = {
  ok: { tone: 'ok', label: 'Aplicado' },
  rechazado: { tone: 'bad', label: 'Rechazado' },
  repetido: { tone: 'warn', label: 'Repetido' },
};

// Timestamp UTC de la API → hora Argentina.
function fechaLabel(iso: string): string {
  return formatoAR(iso, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) || '—';
}

const columns: Column<CanjeHistorialItem>[] = [
  {
    key: 'miembro',
    label: 'Miembro',
    w: '40%',
    render: (_v, c) => (
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold text-ink">
          {`${c.usuarios?.nombre ?? ''} ${c.usuarios?.apellido ?? ''}`.trim() || '—'}
        </div>
        <div className="truncate font-mono text-[11px] tracking-[0.5px] text-mute">
          {c.usuarios?.codigo ?? ''}
        </div>
      </div>
    ),
  },
  {
    key: 'beneficio',
    label: 'Beneficio',
    w: '32%',
    render: (_v, c) => (
      <span className="truncate text-[12.5px] text-graytext">{c.promos?.titulo ?? '—'}</span>
    ),
  },
  {
    key: 'estado',
    label: 'Estado',
    w: '14%',
    align: 'center',
    render: (_v, c) => {
      const e = ESTADO[c.estado] ?? { tone: 'mute' as const, label: c.estado };
      return <Badge tone={e.tone}>{e.label}</Badge>;
    },
  },
  {
    key: 'fecha',
    label: 'Fecha',
    w: '14%',
    align: 'right',
    render: (_v, c) => <span className="text-[12px] text-mute">{fechaLabel(c.fecha)}</span>,
  },
];

export default function LocalHistorial() {
  const navigate = useNavigate();
  const { activeLocalId } = useLocalScope();
  // Mes elegido (mismo selector que Stats). /canjes/mine no filtra por mes, así
  // que se filtra acá sobre la fecha convertida a hora Argentina.
  const [monthOffset, setMonthOffset] = useState(0);
  const mes = monthValue(monthOffset);
  const state = useAsync(
    () => api.canjes.mine({ local_id: activeLocalId ?? undefined, limit: 500 }),
    [activeLocalId],
  );

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Historial de validaciones"
      topbarActions={<MonthPicker offset={monthOffset} onChange={setMonthOffset} />}
    >
      <button
        type="button"
        onClick={() => navigate('/panel')}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-brand hover:underline"
      >
        <ChevronLeft size={17} /> Volver a Inicio
      </button>

      <DataView state={state}>
        {(d) => {
          const delMes = d.data.filter((c) => mesAR(c.fecha) === mes);
          if (d.data.length === 0) {
            return (
              <PanelEmpty
                icon="clock"
                title="Todavía no hay validaciones"
                hint="Cuando valides credenciales y apliques beneficios, cada canje va a aparecer acá."
              />
            );
          }
          if (delMes.length === 0) {
            return (
              <PanelEmpty
                icon="cal"
                title={`Sin validaciones en ${monthLabel(monthOffset)}`}
                hint="Probá con otro mes desde el selector de arriba."
              />
            );
          }
          return (
            <PCard pad={0}>
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <Table columns={columns} rows={delMes} dense />
                </div>
              </div>
              <div className="border-t border-line-soft px-4 py-3 text-xs text-mute">
                {delMes.length} {delMes.length === 1 ? 'validación' : 'validaciones'} en {monthLabel(monthOffset)}
              </div>
            </PCard>
          );
        }}
      </DataView>
    </PanelShell>
  );
}
