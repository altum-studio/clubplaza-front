// pages/admin/AdminLocales.tsx
// Panel Admin · Locales adheridos. KPIs + búsqueda + filtros + tabla con datos
// reales de la API y ABM funcional (alta / edición / baja) vía modal.

import { useMemo, useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, type Column, LogoBox, PButton, PCard, PChip, Stat, Table } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { LocalFormModal } from '@/components/panel/LocalFormModal';
import { ConfirmDialog, RowMenu } from '@/components/panel/RowMenu';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiLocal } from '@/types';
import { ADMIN_NAV } from '@/data/panelMock';

type Filtro = 'todos' | 'activos' | 'inactivos';
type LocalRow = ApiLocal & { __benef: number };

export default function AdminLocales() {
  // El backend no incluye el conteo de beneficios por local → lo calculamos
  // trayendo la lista de promos y contando por local_id.
  const state = useAsync(
    () =>
      Promise.all([api.locales.list({ limit: 50 }), api.promos.list({ limit: 500 })]).then(
        ([l, p]) => {
          const benef = new Map<string, number>();
          for (const pr of p.data) benef.set(pr.local_id, (benef.get(pr.local_id) ?? 0) + 1);
          return { locales: l.data, count: l.count, benef, totalBenef: p.count };
        },
      ),
    [],
  );
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  // Modal de alta/edición. `editing` null = alta.
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiLocal | null>(null);
  const [del, setDel] = useState<ApiLocal | null>(null);

  const openAlta = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (l: ApiLocal) => {
    setEditing(l);
    setModalOpen(true);
  };

  const columns = useMemo<Column<LocalRow>[]>(
    () => [
      {
        key: 'nombre',
        label: 'Local',
        w: '30%',
        render: (_v, r) => (
          <div className="flex items-center gap-[11px]">
            {r.logo_url ? (
              <img src={r.logo_url} className="h-9 w-9 rounded-full border border-line object-cover" />
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
      { key: 'bene', label: 'Beneficios', w: '14%', align: 'center', bold: true, render: (_v, r) => r.__benef },
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
          <div className="inline-flex justify-end">
            <RowMenu
              items={[
                { label: 'Editar', icon: 'edit', onClick: () => openEdit(r) },
                { label: 'Eliminar', icon: 'trash', danger: true, onClick: () => setDel(r) },
              ]}
            />
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
          const rows: LocalRow[] = page.locales
            .filter((l) => {
              const okQuery = !q || l.nombre.toLowerCase().includes(q);
              const okFiltro = filtro === 'todos' || (filtro === 'activos' ? l.activo : !l.activo);
              return okQuery && okFiltro;
            })
            .map((l) => ({ ...l, __benef: page.benef.get(l.id) ?? 0 }));
          const activos = page.locales.filter((l) => l.activo).length;

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Locales" value={String(page.count)} icon="store" />
                <Stat live label="Activos" value={String(activos)} icon="check" />
                <Stat live label="Inactivos" value={String(page.count - activos)} icon="store" />
                <Stat live label="Beneficios totales" value={String(page.totalBenef)} icon="tag" />
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
                  title={page.locales.length === 0 ? 'No hay locales todavía' : 'Sin resultados'}
                  hint={
                    page.locales.length === 0
                      ? 'Cargá el primero con “Alta de local”.'
                      : 'Probá con otro nombre o filtro.'
                  }
                  action={
                    page.locales.length === 0 ? (
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

      <ConfirmDialog
        open={!!del}
        title="Eliminar local"
        message={`¿Seguro que querés eliminar "${del?.nombre ?? ''}"? Se eliminan también sus beneficios. Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (del) {
            await api.locales.remove(del.id);
            state.reload();
          }
        }}
        onClose={() => setDel(null)}
      />
    </PanelShell>
  );
}
