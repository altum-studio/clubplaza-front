// pages/admin/AdminUsuarios.tsx
// Panel Admin · Usuarios. Lista con datos reales de /api/usuarios + filtros por
// rol y búsqueda. ABM funcional (alta / edición de rol y datos / baja) por modal.

import { useMemo, useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Avatar, Badge, type Column, PButton, PCard, PChip, Stat, Table } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { UsuarioFormModal } from '@/components/panel/UsuarioFormModal';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { Profile, Role } from '@/types';
import { ADMIN_NAV } from '@/data/panelMock';
import { ROLE_LABEL } from '@/lib/roles';

function rolBadge(rol: Role) {
  if (rol === 'admin') return <Badge tone="info">Administrador</Badge>;
  if (rol === 'local') return <Badge tone="ok">Comercio</Badge>;
  return <Badge tone="mute">Miembro</Badge>;
}

type Filtro = 'todos' | Role;

export default function AdminUsuarios() {
  const state = useAsync(
    () =>
      Promise.all([api.usuarios.list({ limit: 200 }), api.locales.list({ limit: 200 })]).then(
        ([u, l]) => ({ usuarios: u.data, total: u.count, locales: l.data }),
      ),
    [],
  );

  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  const openNuevo = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (u: Profile) => {
    setEditing(u);
    setModalOpen(true);
  };

  const columns = useMemo<Column<Profile>[]>(
    () => [
      {
        key: 'nombre',
        label: 'Usuario',
        w: '34%',
        render: (_v, u) => (
          <div className="flex items-center gap-[11px]">
            <Avatar name={`${u.nombre} ${u.apellido}`} size={34} tone="mute" />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-ink">
                {u.nombre} {u.apellido}
              </div>
              <div className="truncate text-[11px] text-mute">{u.email}</div>
            </div>
          </div>
        ),
      },
      { key: 'rol', label: 'Rol', w: '18%', align: 'center', render: (_v, u) => rolBadge(u.rol) },
      {
        key: 'local',
        label: 'Locales',
        w: '20%',
        muted: true,
        render: (_v, u) => {
          if (u.rol !== 'local') return '—';
          const n = u.local_ids?.length ?? 0;
          if (n > 1) return `${n} locales`;
          return u.locales?.nombre ?? '— sin asignar';
        },
      },
      {
        key: 'activo',
        label: 'Estado',
        w: '12%',
        align: 'center',
        render: (_v, u) =>
          u.activo ? <Badge tone="ok">Activo</Badge> : <Badge tone="mute">Inactivo</Badge>,
      },
      {
        key: 'acc',
        label: 'Acciones',
        w: '16%',
        align: 'right',
        render: (_v, u) => (
          <PButton size="sm" variant="outline" onClick={() => openEdit(u)}>
            Editar
          </PButton>
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
      topbarTitle="Usuarios"
      topbarActions={
        <>
          <div className="flex h-[38px] items-center gap-2 rounded-[9px] border border-line bg-white px-3">
            <Icon name="search" size={16} className="text-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre, comercio o mail…"
              className="w-[150px] bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
            />
          </div>
          <PButton icon="plus" onClick={openNuevo}>
            Nuevo usuario
          </PButton>
        </>
      }
    >
      <DataView state={state}>
        {(d) => {
          const q = query.trim().toLowerCase();
          const count = (r: Role) => d.usuarios.filter((u) => u.rol === r).length;
          const localNames = new Map(d.locales.map((l) => [l.id, l.nombre]));
          // Comercios asociados a un usuario (local principal + tabla intermedia),
          // para poder buscar también por el nombre del comercio.
          const comercioOf = (u: Profile) =>
            [u.locales?.nombre, ...(u.local_ids ?? []).map((id) => localNames.get(id))]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
          const rows = d.usuarios.filter((u) => {
            const okFiltro = filtro === 'todos' || u.rol === filtro;
            const okQuery =
              !q ||
              `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              comercioOf(u).includes(q);
            return okFiltro && okQuery;
          });

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat live label="Usuarios" value={String(d.total)} icon="users" />
                <Stat live label="Miembros" value={String(count('comun'))} icon="user" />
                <Stat live label="Comercios" value={String(count('local'))} icon="store" />
                <Stat live label="Administradores" value={String(count('admin'))} icon="gear" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(['todos', 'comun', 'local', 'admin'] as Filtro[]).map((f) => (
                  <PChip key={f} active={filtro === f} onClick={() => setFiltro(f)}>
                    {f === 'todos' ? 'Todos' : ROLE_LABEL[f]}
                    {f !== 'todos' ? ` · ${count(f)}` : ` · ${d.usuarios.length}`}
                  </PChip>
                ))}
              </div>

              {rows.length === 0 ? (
                <PanelEmpty
                  icon="users"
                  title={d.usuarios.length === 0 ? 'No hay usuarios' : 'Sin resultados'}
                  hint={d.usuarios.length === 0 ? 'Creá el primero con “Nuevo usuario”.' : 'Probá con otro nombre o filtro.'}
                  action={
                    d.usuarios.length === 0 ? (
                      <PButton icon="plus" onClick={openNuevo}>
                        Nuevo usuario
                      </PButton>
                    ) : undefined
                  }
                />
              ) : (
                <PCard pad={0}>
                  <div className="overflow-x-auto">
                    <div className="min-w-[720px]">
                      <Table columns={columns} rows={rows} dense />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
                    <span className="text-xs text-mute">
                      Mostrando {rows.length} de {d.total} usuarios
                    </span>
                  </div>
                </PCard>
              )}
            </div>
          );
        }}
      </DataView>

      <UsuarioFormModal
        open={modalOpen}
        usuario={editing}
        locales={state.data?.locales ?? []}
        onClose={() => setModalOpen(false)}
        onSaved={state.reload}
      />
    </PanelShell>
  );
}
