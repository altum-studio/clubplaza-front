// pages/panel/LocalHistorial.tsx
// Panel Local · Historial de validaciones (canjes). Lista real desde
// GET /api/canjes/mine: qué miembro usó qué beneficio, cuándo y su estado.
// Se navega por mes (mismo selector que Stats) y se puede exportar a CSV la
// lista de miembros que validaron en ese mes (nombre, apellido, email, código).

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, PButton, PCard, Table, type Column } from '@/components/panel/kit';
import { MonthPicker, monthLabel, monthValue } from '@/components/panel/MonthPicker';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { ConfirmDialog } from '@/components/panel/RowMenu';
import { useAsync } from '@/hooks/useAsync';
import { useLocalScope } from '@/hooks/useLocalScope';
import { api } from '@/lib/api';
import type { CanjeHistorialItem } from '@/types';
import { LOCAL_NAV } from '@/data/panelMock';
import { fechaAR, formatoAR, mesAR } from '@/lib/fechas';
import { aCSV, descargarCSV } from '@/lib/exportCampanias';
import { slugify } from '@/lib/utils';

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

// Miembros distintos que validaron (estado ok) en la lista dada, con su resumen.
const COLUMNAS_EXPORT = ['Nombre', 'Apellido', 'Email', 'Código', 'Validaciones', 'Última validación'] as const;
function filasMiembros(canjes: CanjeHistorialItem[]): string[][] {
  const porMiembro = new Map<string, { nombre: string; apellido: string; email: string; n: number; ultimo: string }>();
  for (const c of canjes) {
    if (c.estado !== 'ok' || !c.usuarios?.codigo) continue;
    const k = c.usuarios.codigo;
    const m = porMiembro.get(k) ?? {
      nombre: c.usuarios.nombre ?? '',
      apellido: c.usuarios.apellido ?? '',
      email: c.usuarios.email ?? '',
      n: 0,
      ultimo: '',
    };
    m.n++;
    const f = fechaAR(c.fecha);
    if (f > m.ultimo) m.ultimo = f;
    porMiembro.set(k, m);
  }
  return [...porMiembro.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .map(([codigo, m]) => [m.nombre, m.apellido, m.email, codigo, String(m.n), m.ultimo]);
}

export default function LocalHistorial() {
  const navigate = useNavigate();
  const { activeLocalId, activeLocal } = useLocalScope();
  // Mes elegido (mismo selector que Stats). /canjes/mine no filtra por mes, así
  // que se filtra acá sobre la fecha convertida a hora Argentina.
  const [monthOffset, setMonthOffset] = useState(0);
  const mes = monthValue(monthOffset);
  const state = useAsync(
    () => api.canjes.mine({ local_id: activeLocalId ?? undefined, limit: 500 }),
    [activeLocalId],
  );
  const delMes = (state.data?.data ?? []).filter((c) => mesAR(c.fecha) === mes);
  const filasExport = filasMiembros(delMes);
  const [exportOpen, setExportOpen] = useState(false);
  const exportar = async () => {
    const nombre = `clubplaza-validaciones-${slugify(activeLocal?.nombre ?? 'local')}-${mes}.csv`;
    descargarCSV(aCSV(filasExport, COLUMNAS_EXPORT), nombre);
  };

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Historial de validaciones"
      topbarActions={
        <>
          <MonthPicker offset={monthOffset} onChange={setMonthOffset} />
          <PButton
            variant="outline"
            icon="download"
            title="Exportar miembros del mes"
            onClick={() => setExportOpen(true)}
            disabled={filasExport.length === 0}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Exportar</span>
          </PButton>
        </>
      }
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
                {' · '}
                {filasExport.length} {filasExport.length === 1 ? 'miembro distinto' : 'miembros distintos'}
              </div>
            </PCard>
          );
        }}
      </DataView>

      <ConfirmDialog
        open={exportOpen}
        title="Exportar miembros del mes"
        message={`Se va a descargar un CSV con ${filasExport.length} ${filasExport.length === 1 ? 'miembro que validó' : 'miembros que validaron'} beneficios en tu local en ${monthLabel(monthOffset)}: nombre, apellido, email, código de credencial, cantidad de validaciones y última fecha. Son datos personales: usalos solo para comunicaciones de tu local y no los compartas.`}
        confirmLabel="Descargar CSV"
        loadingLabel="Generando…"
        variant="primary"
        icon="download"
        onConfirm={exportar}
        onClose={() => setExportOpen(false)}
      />
    </PanelShell>
  );
}
