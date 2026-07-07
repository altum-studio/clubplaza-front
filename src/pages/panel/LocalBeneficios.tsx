// pages/panel/LocalBeneficios.tsx
// Panel Local · Mis beneficios. Lista real (api.promos.mine) con filtros por
// estado, menú ⋯ (Editar / Eliminar), y preview a la derecha de cómo se ve el
// beneficio en la app del miembro al seleccionarlo.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, LogoBox, PButton, PCard, PChip, Table, type Column } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { BeneficioFormModal } from '@/components/panel/BeneficioFormModal';
import { ConfirmDialog, RowMenu } from '@/components/panel/RowMenu';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiPromo } from '@/types';
import { LOCAL_NAV } from '@/data/panelMock';
import { CATEGORIA_LABEL } from '@/lib/categorias';
import { diasLabel, limiteLabel, tipoBeneficioLabel, vigenciaLabel } from '@/lib/opciones';
import { BenefitValue } from '@/components/benefits/BenefitValue';

type Filtro = 'todos' | 'activos' | 'pausados';

// ── Preview: cómo ve el beneficio el miembro en la app ──
function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-mute">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

function BenefitPreview({
  promo,
  local,
}: {
  promo: ApiPromo;
  local: { nombre: string; logo_url: string | null };
}) {
  const desde = promo.vigencia_desde ?? promo.fecha_inicio ?? '';
  const hasta = promo.vigencia_hasta ?? promo.fecha_fin ?? '';
  return (
    <div className="overflow-hidden rounded-[14px] border border-line">
      {promo.banner_url ? (
        <img src={promo.banner_url} alt="" className="h-28 w-full object-cover" />
      ) : (
        <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-brand to-brand-dark text-[11px] font-semibold text-white/70">
          Sin banner
        </div>
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {local.logo_url ? (
            <img src={local.logo_url} alt="" className="h-6 w-6 rounded-full border border-line object-cover" />
          ) : (
            <LogoBox size={24} />
          )}
          <span className="truncate text-[11.5px] font-bold text-graytext">{local.nombre || 'Tu local'}</span>
          {promo.rubro && (
            <Badge tone="ok" dot={false} className="ml-auto">
              {CATEGORIA_LABEL[promo.rubro]}
            </Badge>
          )}
        </div>
        <h2 className="text-[20px] font-extrabold leading-tight text-brand">{promo.titulo}</h2>
        {promo.tipo && (
          <span className="mt-1.5 inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-bold text-brand">
            <BenefitValue
              tipo={promo.tipo}
              valor={promo.valor}
              precioAnterior={promo.precio_anterior}
              precioNuevo={promo.precio_nuevo}
            />
          </span>
        )}
        {promo.descripcion && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-graytext">{promo.descripcion}</p>
        )}
        <div className="mt-3 flex flex-col gap-1.5 border-t border-line-soft pt-3 text-[12px]">
          {promo.tipo && <PreviewRow label="Tipo" value={tipoBeneficioLabel(promo.tipo)} />}
          <PreviewRow label="Días válidos" value={diasLabel(promo.dias)} />
          <PreviewRow label="Vigencia" value={vigenciaLabel({ desde, hasta })} />
          <PreviewRow label="Límite de uso" value={limiteLabel(promo.limite_cantidad, promo.limite_periodo)} />
          <PreviewRow label="Estado" value={promo.activa ? 'Activo' : 'Pausado'} />
        </div>
      </div>
    </div>
  );
}

export default function LocalBeneficios() {
  const state = useAsync(
    () =>
      Promise.all([api.locales.mine().catch(() => null), api.promos.mine({ limit: 200 })]).then(
        ([local, promos]) => ({ local, promos: promos.data }),
      ),
    [],
  );

  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [selId, setSelId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPromo | null>(null);
  const [del, setDel] = useState<ApiPromo | null>(null);

  const openNuevo = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: ApiPromo) => {
    setEditing(p);
    setModalOpen(true);
  };

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Mis beneficios"
      topbarActions={
        <PButton icon="plus" onClick={openNuevo}>
          Nuevo beneficio
        </PButton>
      }
    >
      <DataView state={state}>
        {(d) => {
          const promos = d.promos;
          const activos = promos.filter((p) => p.activa).length;
          const pausados = promos.length - activos;
          const rows = promos.filter((p) =>
            filtro === 'todos' ? true : filtro === 'activos' ? p.activa : !p.activa,
          );
          const sel = promos.find((p) => p.id === selId) ?? null;
          const local = { nombre: d.local?.nombre ?? '', logo_url: d.local?.logo_url ?? null };

          const columns: Column<ApiPromo>[] = [
            {
              key: 'titulo',
              label: 'Beneficio',
              w: '48%',
              render: (_v, p) => (
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-ink">{p.titulo}</div>
                  <div className="truncate text-[11px] text-mute">{diasLabel(p.dias)}</div>
                </div>
              ),
            },
            {
              key: 'canjes',
              label: 'Canjes',
              w: '16%',
              align: 'center',
              bold: true,
              render: () => <span className="font-bold text-faint">—</span>,
            },
            {
              key: 'estado',
              label: 'Estado',
              w: '20%',
              align: 'center',
              render: (_v, p) =>
                p.activa ? <Badge tone="ok">Activo</Badge> : <Badge tone="mute">Pausado</Badge>,
            },
            {
              key: 'acc',
              label: '',
              w: '16%',
              align: 'right',
              render: (_v, p) => (
                <div className="inline-flex justify-end">
                  <RowMenu
                    items={[
                      { label: 'Editar', icon: 'edit', onClick: () => openEdit(p) },
                      { label: 'Eliminar', icon: 'trash', danger: true, onClick: () => setDel(p) },
                    ]}
                  />
                </div>
              ),
            },
          ];

          return (
            <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.5fr_1fr]">
              {/* ── Lista ── */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <PChip active={filtro === 'todos'} onClick={() => setFiltro('todos')}>
                    Todos · {promos.length}
                  </PChip>
                  <PChip active={filtro === 'activos'} onClick={() => setFiltro('activos')}>
                    Activos · {activos}
                  </PChip>
                  <PChip active={filtro === 'pausados'} onClick={() => setFiltro('pausados')}>
                    Pausados · {pausados}
                  </PChip>
                </div>

                <PCard pad={0}>
                  {promos.length === 0 ? (
                    <PanelEmpty
                      icon="tag"
                      title="Todavía no cargaste beneficios"
                      hint="Creá el primero con “Nuevo beneficio”."
                      action={
                        <PButton icon="plus" onClick={openNuevo}>
                          Nuevo beneficio
                        </PButton>
                      }
                    />
                  ) : rows.length === 0 ? (
                    <div className="p-8 text-center text-[13px] text-mute">
                      No hay beneficios {filtro === 'activos' ? 'activos' : 'pausados'}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-[540px]">
                        <Table columns={columns} rows={rows} dense onRowClick={(p) => setSelId(p.id)} />
                      </div>
                    </div>
                  )}
                </PCard>
              </div>

              {/* ── Preview (vista del miembro) ── */}
              <PCard title="Vista del miembro" sub="Cómo se ve el beneficio en la app">
                {sel ? (
                  <BenefitPreview promo={sel} local={local} />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                      <Icon name="eye" size={22} className="text-brand" />
                    </span>
                    <p className="max-w-xs text-[13px] text-graytext">
                      Tocá un beneficio de la lista para ver cómo se muestra en la app del miembro.
                    </p>
                    <PButton icon="plus" variant="outline" onClick={openNuevo}>
                      Nuevo beneficio
                    </PButton>
                  </div>
                )}
              </PCard>
            </div>
          );
        }}
      </DataView>

      <BeneficioFormModal
        open={modalOpen}
        promo={editing}
        mode="local"
        onClose={() => setModalOpen(false)}
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
