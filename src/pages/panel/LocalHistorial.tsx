// pages/panel/LocalHistorial.tsx
// Panel Local · Historial de validaciones. Filtros + tabla de validaciones de
// miembros con su estado (validado / repetido / rechazado).

import { PanelShell } from '@/components/panel/PanelShell';
import {
  Avatar,
  Badge,
  PButton,
  PCard,
  PChip,
  Search,
  Table,
  type Column,
} from '@/components/panel/kit';
import { LOCAL_NAV, VALIDACIONES, type Validacion } from '@/data/panelMock';

const COLUMNS: Column<Validacion>[] = [
  { key: 'hora', label: 'Hora', w: '12%', mono: true, bold: true },
  {
    key: 'miembro',
    label: 'Miembro',
    w: '26%',
    render: (value) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={value} size={30} />
        <span className="text-[13px] font-bold">{value}</span>
      </div>
    ),
  },
  { key: 'cod', label: 'Código', w: '20%', mono: true, muted: true },
  { key: 'ben', label: 'Beneficio', w: '26%', muted: true },
  {
    key: 'estado',
    label: 'Estado',
    w: '16%',
    align: 'right',
    render: (estado) =>
      estado === 'ok' ? (
        <Badge tone="ok">Validado</Badge>
      ) : estado === 'dup' ? (
        <Badge tone="warn">Repetido</Badge>
      ) : (
        <Badge tone="bad">Rechazado</Badge>
      ),
  },
];

export default function LocalHistorial() {
  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Café Central"
      userRole="Comercio adherido"
      topbarTitle="Historial de validaciones"
      topbarActions={
        <>
          <Search placeholder="Buscar miembro o código…" />
          <PButton icon="download" variant="outline">
            Exportar CSV
          </PButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* ── Filtros ── */}
        <div className="flex flex-wrap items-center gap-2">
          <PChip icon="filter" active>
            Todos
          </PChip>
          <PChip>Validados</PChip>
          <PChip>Rechazados</PChip>
          <PChip>Repetidos</PChip>
          <div className="hidden flex-1 lg:block" />
          <PChip icon="cal">Hoy · 18 jun</PChip>
        </div>

        {/* ── Tabla de validaciones ── */}
        <PCard pad={0}>
          <div className="overflow-x-auto">
            <Table columns={COLUMNS} rows={VALIDACIONES} dense />
          </div>
          <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
            <span className="text-xs text-mute">Mostrando 9 de 400 validaciones</span>
            <div className="flex items-center gap-1.5">
              <PChip>Anterior</PChip>
              <PChip active>1</PChip>
              <PChip>2</PChip>
              <PChip>3</PChip>
              <PChip>Siguiente</PChip>
            </div>
          </div>
        </PCard>
      </div>
    </PanelShell>
  );
}
