// pages/admin/AdminLocales.tsx
// Panel Admin · Locales adheridos. KPIs + búsqueda + filtros + tabla con datos
// reales de la API y ABM funcional (alta / edición / baja) vía modal.

import { useMemo, useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, type Column, LogoBox, PButton, PCard, PChip, Stat, Table } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { LocalFormModal } from '@/components/panel/LocalFormModal';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiLocal } from '@/types';
import { ADMIN_NAV } from '@/data/panelMock';

const benCount = (l: ApiLocal) =>
  Array.isArray(l.promos) && l.promos[0] && 'count' in l.promos[0]
    ? (l.promos[0] as { count: number }).count
    : (l.promos_count ?? 0);

type Filtro = 'todos' | 'activos' | 'inactivos';

export default function AdminLocales() {
  const state = useAsync(() => api.locales.list({ limit: 50 }), []);
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  // Modal de alta/edición. `editing` null = alta.
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiLocal | null>(null);

  const openAlta = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (l: ApiLocal) => {
    setEditing(l);
    setModalOpen(true);
  };

  const columns = useMemo<Column<ApiLocal>[]>(
    () => [
      {
        key: 'nombre',
        label: 'Local',
        w: '30%',
        render: (_v, r) => (
          <div className="flex items-center gap-[11px]">
            {r.logo_url ? (
              <img src={r.logo_url} className="h-9 w-9 rounded-[9px] border border-line object-cover" />
            ) : (
              <LogoBox size={36} />
            )}
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-ink">{r.nombre}</div>
              <div className="truncate text-[11px] text-mute">
                {r.piso ? `Piso ${r.piso}` : (r.descripcion ?? '—')}
              </div>
            </div>
          </div>
        ),
      },
      { key: 'bene', label: 'Beneficios', w: '14%', align: 'center', bold: true, render: (_v, r) => benCount(r) },
      {
        key: 'canjes',
        label: 'Canjes',
        w: '14%',
        align: 'center',
        bold: true,
        render: () => <span className="font-bold text-faint">—</span>,
      },
      {
        key: 'estado',
        label: 'Estado',
        w: '18%',
        align: 'center',
        render: (_v, r) =>
          r.activo ? <Badge tone="ok">Activo</Badge> : <Badge tone="mute">Inactivo</Badge>,
      },
      {
        key: 'acc',
        label: 'Acciones',
        w: '24%',
        align: 'right',
        render: (_v, r) => (
          <div className="inline-flex items-center gap-2">
            <PButton size="sm" variant="outline" onClick={() => openEdit(r)}>
              Editar
            </PButton>
            <button
              type="button"
              aria-label="Editar local"
              onClick={() => openEdit(r)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line hover:bg-fill"
            >
              <Icon name="dots" size={16} className="text-graytext" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Locales adheridos"
      topbarActions={
        <>
          <div className="flex h-[38px] items-center gap-2 rounded-[9px] border border-line bg-white px-3">
            <Icon name="search" size={16} className="text-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar local…"
              className="w-[150px] bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
            />
          </div>
          <PButton icon="plus" onClick={openAlta}>
            Alta de local
          </PButton>
        </>
      }
    >
      <DataView state={state}>
        {(page) => {
          const q = query.trim().toLowerCase();
          const rows = page.data.filter((l) => {
            const okQuery = !q || l.nombre.toLowerCase().includes(q);
            const okFiltro = filtro === 'todos' || (filtro === 'activos' ? l.activo : !l.activo);
            return okQuery && okFiltro;
          });
          const activos = page.data.filter((l) => l.activo).length;

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Locales" value={String(page.count)} icon="store" />
                <Stat live label="Activos" value={String(activos)} icon="check" />
                <Stat label="Solicitudes" icon="clock" />
                <Stat label="Beneficios totales" icon="tag" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <PChip active={filtro === 'todos'} onClick={() => setFiltro('todos')}>
                  Todos · {page.count}
                </PChip>
                <PChip active={filtro === 'activos'} onClick={() => setFiltro('activos')}>
                  Activos · {activos}
                </PChip>
                <PChip active={filtro === 'inactivos'} onClick={() => setFiltro('inactivos')}>
                  Baja · {page.count - activos}
                </PChip>
                <div className="hidden flex-1 lg:block" />
                <PButton variant="outline" icon="plus" onClick={openAlta}>
                  Alta de local
                </PButton>
              </div>

              {rows.length === 0 ? (
                <PanelEmpty
                  icon="store"
                  title={page.data.length === 0 ? 'No hay locales todavía' : 'Sin resultados'}
                  hint={
                    page.data.length === 0
                      ? 'Cargá el primero con “Alta de local”.'
                      : 'Probá con otro nombre o filtro.'
                  }
                  action={
                    page.data.length === 0 ? (
                      <PButton icon="plus" onClick={openAlta}>
                        Alta de local
                      </PButton>
                    ) : undefined
                  }
                />
              ) : (
                <PCard pad={0}>
                  <div className="overflow-x-auto">
                    <div className="min-w-[760px]">
                      <Table columns={columns} rows={rows} dense />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-4 py-3">
                    <span className="text-xs text-mute">
                      Mostrando {rows.length} de {page.count} locales
                    </span>
                  </div>
                </PCard>
              )}
            </div>
          );
        }}
      </DataView>

      <LocalFormModal
        open={modalOpen}
        local={editing}
        onClose={() => setModalOpen(false)}
        onSaved={state.reload}
      />
    </PanelShell>
  );
}
