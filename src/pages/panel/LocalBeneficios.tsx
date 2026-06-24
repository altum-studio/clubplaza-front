// pages/panel/LocalBeneficios.tsx
// Panel Local · Mis beneficios. Lista de beneficios del comercio + alta/edición
// vía BeneficioFormModal. Métricas (canjes) detrás de METRICS_SOON.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import {
  Badge,
  LogoBox,
  PButton,
  PCard,
  PChip,
  Table,
  type Column,
} from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { BeneficioFormModal } from '@/components/panel/BeneficioFormModal';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiPromo } from '@/types';
import { LOCAL_NAV } from '@/data/panelMock';

function buildColumns(onEdit: (p: ApiPromo) => void): Column<ApiPromo>[] {
  return [
    {
      key: 'titulo',
      label: 'Beneficio',
      w: '44%',
      render: (_v, promo) => (
        <div className="flex items-center gap-[11px]">
          {promo.locales?.logo_url ? (
            <img
              src={promo.locales.logo_url}
              alt=""
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <LogoBox size={36} />
          )}
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-ink">{promo.titulo}</div>
            <div className="truncate text-[11px] text-mute">
              {promo.fecha_inicio && promo.fecha_fin
                ? `${promo.fecha_inicio} – ${promo.fecha_fin}`
                : promo.descripcion ?? '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'canjes',
      label: 'Canjes',
      w: '18%',
      align: 'center',
      bold: true,
      render: () => <span className="font-bold text-faint">—</span>,
    },
    {
      key: 'estado',
      label: 'Estado',
      w: '20%',
      align: 'center',
      render: (_v, promo) =>
        promo.activa ? <Badge tone="ok">Activo</Badge> : <Badge tone="mute">Pausado</Badge>,
    },
    {
      key: 'acc',
      label: '',
      w: '18%',
      align: 'right',
      render: (_v, promo) => (
        <div className="inline-flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(promo)}
            aria-label="Editar beneficio"
            className="text-graytext transition-colors hover:text-ink"
          >
            <Icon name="edit" size={17} />
          </button>
          <Icon name="dots" size={17} className="text-graytext" />
        </div>
      ),
    },
  ];
}

export default function LocalBeneficios() {
  const state = useAsync(() => api.promos.mine({ limit: 50 }), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPromo | null>(null);

  const openNuevo = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: ApiPromo) => {
    setEditing(p);
    setModalOpen(true);
  };

  const columns = buildColumns(openEdit);

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Café Central"
      userRole="Comercio adherido"
      topbarTitle="Mis beneficios"
      topbarActions={
        <PButton icon="plus" onClick={openNuevo}>
          Nuevo beneficio
        </PButton>
      }
    >
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.5fr_1fr]">
        {/* ── Lista de beneficios ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <PChip active>Todos · 4</PChip>
            <PChip>Activos · 2</PChip>
            <PChip>Pausados · 1</PChip>
            <PChip>Borradores · 1</PChip>
          </div>

          <PCard pad={0}>
            <DataView state={state}>
              {(page) =>
                page.data.length === 0 ? (
                  <PanelEmpty
                    icon="tag"
                    title="Todavía no cargaste beneficios"
                    hint="Creá el primero con “Nuevo beneficio”."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table columns={columns} rows={page.data} />
                  </div>
                )
              }
            </DataView>
          </PCard>
        </div>

        {/* ── Ayuda para editar / crear ── */}
        <PCard title="Editar un beneficio">
          <div className="flex flex-col gap-3.5">
            <p className="text-[13px] text-graytext">
              Tocá un beneficio de la lista para editarlo, o creá uno nuevo.
            </p>
            <PButton icon="plus" onClick={openNuevo}>
              Nuevo beneficio
            </PButton>
          </div>
        </PCard>
      </div>

      <BeneficioFormModal
        open={modalOpen}
        promo={editing}
        mode="local"
        onClose={() => setModalOpen(false)}
        onSaved={state.reload}
      />
    </PanelShell>
  );
}
