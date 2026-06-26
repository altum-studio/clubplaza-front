// pages/admin/AdminBeneficios.tsx
// Panel Admin · Beneficios. SIN aprobación: los locales publican directo.
// Vista = lista de locales; cada uno se despliega (flecha) y muestra sus
// beneficios. El admin carga un beneficio desde el botón de arriba.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, LogoBox, PButton, PCard } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { BeneficioFormModal } from '@/components/panel/BeneficioFormModal';
import { ConfirmDialog, RowMenu } from '@/components/panel/RowMenu';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { ADMIN_NAV } from '@/data/panelMock';
import type { ApiLocal, ApiPromo } from '@/types';

export default function AdminBeneficios() {
  const state = useAsync(
    () =>
      Promise.all([api.locales.list({ limit: 200 }), api.promos.list({ limit: 500 })]).then(
        ([l, p]) => ({ locales: l.data, promos: p.data, publicados: p.count }),
      ),
    [],
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPromo | null>(null);
  const [lockedLocal, setLockedLocal] = useState<ApiLocal | null>(null);
  const [del, setDel] = useState<ApiPromo | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  // Alta general (elegís el local en el modal).
  const openAlta = () => {
    setEditing(null);
    setLockedLocal(null);
    setOpen(true);
  };
  // Alta desde un local desplegado: ese local ya viene fijado.
  const openAltaForLocal = (l: ApiLocal) => {
    setEditing(null);
    setLockedLocal(l);
    setOpen(true);
  };
  const openEdit = (p: ApiPromo) => {
    setEditing(p);
    setLockedLocal(null);
    setOpen(true);
  };

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Beneficios"
      topbarActions={
        <>
          <span className="inline-flex items-center whitespace-nowrap rounded-lg border border-line bg-white px-3 py-[7px] text-[12.5px] font-semibold text-graytext">
            Publicados · {state.data?.publicados ?? 0}
          </span>
          <PButton icon="plus" onClick={openAlta}>
            Cargar beneficio
          </PButton>
        </>
      }
    >
      <DataView state={state}>
        {(d) => {
          if (d.locales.length === 0) {
            return (
              <PanelEmpty
                icon="store"
                title="No hay locales todavía"
                hint="Cuando existan locales vas a poder cargarles beneficios."
              />
            );
          }
          const byLocal = new Map<string, ApiPromo[]>();
          for (const p of d.promos) {
            const arr = byLocal.get(p.local_id) ?? [];
            arr.push(p);
            byLocal.set(p.local_id, arr);
          }

          return (
            <PCard pad={0}>
              {d.locales.map((l, i) => {
                const promos = byLocal.get(l.id) ?? [];
                const isOpen = expanded.has(l.id);
                return (
                  <div key={l.id} className={i === d.locales.length - 1 ? '' : 'border-b border-line-soft'}>
                    {/* Fila del local (clickeable para desplegar sus beneficios) */}
                    <button
                      type="button"
                      onClick={() => toggle(l.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fill"
                    >
                      <Icon name={isOpen ? 'chevD' : 'chevR'} size={16} className="text-mute" />
                      {l.logo_url ? (
                        <img src={l.logo_url} className="h-9 w-9 rounded-full border border-line object-cover" />
                      ) : (
                        <LogoBox size={36} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-bold text-ink">{l.nombre}</div>
                        <div className="text-[11.5px] text-mute">
                          {promos.length === 1 ? '1 beneficio' : `${promos.length} beneficios`}
                          {l.nro_local ? ` · ${l.nro_local}` : ''}
                        </div>
                      </div>
                      {!l.activo && (
                        <Badge tone="mute" dot={false}>
                          Inactivo
                        </Badge>
                      )}
                    </button>

                    {/* Beneficios del local (desplegados) */}
                    {isOpen && (
                      <div className="bg-fill/50 px-4 pb-3 pl-[52px]">
                        {promos.length === 0 ? (
                          <div className="py-2 text-[12.5px] text-mute">Este local no tiene beneficios todavía.</div>
                        ) : (
                          promos.map((p) => (
                            <div
                              key={p.id}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white"
                            >
                              <button
                                type="button"
                                onClick={() => openEdit(p)}
                                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                              >
                                <Icon name="tag" size={15} className="text-mute" />
                                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{p.titulo}</span>
                              </button>
                              <Badge tone={p.activa ? 'ok' : 'mute'} dot={false}>
                                {p.activa ? 'Publicado' : 'Inactivo'}
                              </Badge>
                              <RowMenu
                                items={[
                                  { label: 'Editar', icon: 'edit', onClick: () => openEdit(p) },
                                  { label: 'Eliminar', icon: 'trash', danger: true, onClick: () => setDel(p) },
                                ]}
                              />
                            </div>
                          ))
                        )}
                        <button
                          type="button"
                          onClick={() => openAltaForLocal(l)}
                          className="mt-1 flex items-center gap-1.5 py-2 text-[12.5px] font-bold text-brand hover:underline"
                        >
                          <Icon name="plus" size={14} /> Agregar beneficio
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </PCard>
          );
        }}
      </DataView>

      <BeneficioFormModal
        open={open}
        promo={editing}
        mode="admin"
        locales={state.data?.locales ?? []}
        lockedLocalId={lockedLocal?.id}
        onClose={() => setOpen(false)}
        onSaved={state.reload}
      />

      <ConfirmDialog
        open={!!del}
        title="Eliminar beneficio"
        message={`¿Seguro que querés eliminar "${del?.titulo ?? ''}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (del) {
            await api.promos.remove(del.id);
            state.reload();
          }
        }}
        onClose={() => setDel(null)}
      />
    </PanelShell>
  );
}
