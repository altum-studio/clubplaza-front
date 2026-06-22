// pages/admin/AdminBeneficios.tsx
// Panel Admin · Beneficios · aprobaciones (estado vacío / hub). Cola de revisión
// a la izquierda + estado vacío con accesos a cargar/revisar a la derecha.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, LogoBox, PButton, PCard, PChip } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { BeneficioFormModal } from '@/components/panel/BeneficioFormModal';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { ADMIN_NAV } from '@/data/panelMock';
import type { ApiPromo } from '@/types';

export default function AdminBeneficios() {
  const state = useAsync(() => api.promos.list({ limit: 50 }), []);
  const localesState = useAsync(() => api.locales.list({ limit: 100 }), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPromo | null>(null);
  const openAlta = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: ApiPromo) => {
    setEditing(p);
    setModalOpen(true);
  };

  return (
    <PanelShell
      role="Administrador"
      nav={ADMIN_NAV}
      userName="Ana Ruiz"
      userRole="Administradora"
      topbarTitle="Beneficios · aprobaciones"
      topbarActions={
        <>
          <PChip active>Pendientes · 7</PChip>
          <PChip>Publicados · 312</PChip>
          <PChip>Rechazados</PChip>
        </>
      }
    >
      <div className="grid min-h-[560px] grid-cols-1 items-stretch gap-4 lg:grid-cols-[340px_1fr]">
        {/* Beneficios */}
        <PCard title="Beneficios" sub={`${state.data?.count ?? 0} cargados`} pad={0}>
          <DataView state={state}>
            {(page) =>
              page.data.length === 0 ? (
                <div className="p-4">
                  <PanelEmpty
                    icon="tag"
                    title="No hay beneficios"
                    hint="Cargá el primero desde el botón."
                  />
                </div>
              ) : (
                <div>
                  {page.data.map((promo, i) => (
                    <div
                      key={promo.id}
                      onClick={() => openEdit(promo)}
                      className={`flex cursor-pointer items-center gap-[11px] px-4 py-[13px] hover:bg-fill ${
                        i === page.data.length - 1 ? '' : 'border-b border-line-soft'
                      }`}
                    >
                      {promo.locales?.logo_url ? (
                        <img
                          src={promo.locales.logo_url}
                          alt=""
                          className="h-[38px] w-[38px] rounded-[9px] border border-line object-cover"
                        />
                      ) : (
                        <LogoBox size={38} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold text-ink">{promo.titulo}</div>
                        <div className="truncate text-[11.5px] text-mute">
                          {promo.locales?.nombre ?? 'Local'}
                        </div>
                      </div>
                      <Badge tone={promo.activa ? 'ok' : 'mute'} dot={false}>
                        {promo.activa ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )
            }
          </DataView>
        </PCard>

        {/* Estado vacío */}
        <PCard className="h-full">
          <div className="flex h-full flex-col items-center justify-center gap-[18px] px-5 py-10 text-center">
            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-brand-soft">
              <Icon name="tag" size={42} className="text-brand" />
            </div>

            <div>
              <div className="text-[20px] font-extrabold tracking-[-0.3px]">
                Seleccioná un beneficio para revisarlo
              </div>
              <p className="mx-auto mt-2 max-w-[380px] text-[13.5px] leading-relaxed text-graytext">
                Elegí uno de los 7 beneficios de la cola para ver su detalle y aprobarlo, pedir
                cambios o rechazarlo. O cargá uno nuevo vos mismo.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <PButton
                variant="primary"
                icon="plus"
                size="lg"
                onClick={openAlta}
              >
                Cargar beneficio
              </PButton>
              <PButton variant="outline" icon="chevR" size="lg">
                Revisar el primero de la cola
              </PButton>
            </div>

            <div className="mt-4 flex w-full max-w-[420px] justify-center gap-7 border-t border-line-soft pt-5">
              <div>
                <div className="text-[22px] font-extrabold text-brand">7</div>
                <div className="text-[11.5px] font-semibold text-mute">Pendientes</div>
              </div>
              <div>
                <div className="text-[22px] font-extrabold text-ink">312</div>
                <div className="text-[11.5px] font-semibold text-mute">Publicados</div>
              </div>
              <div>
                <div className="text-[22px] font-extrabold text-ink">2 h</div>
                <div className="text-[11.5px] font-semibold text-mute">Espera promedio</div>
              </div>
            </div>
          </div>
        </PCard>
      </div>

      <BeneficioFormModal
        open={modalOpen}
        promo={editing}
        mode="admin"
        locales={localesState.data?.data ?? []}
        onClose={() => setModalOpen(false)}
        onSaved={state.reload}
      />
    </PanelShell>
  );
}
