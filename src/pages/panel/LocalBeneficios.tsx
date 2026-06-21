// pages/panel/LocalBeneficios.tsx
// Panel Local · Mis beneficios. Lista de beneficios del comercio + editor de
// un beneficio. Métricas (canjes) detrás de METRICS_SOON.

import { PanelShell } from '@/components/panel/PanelShell';
import {
  Badge,
  Field,
  LogoBox,
  PButton,
  PCard,
  PChip,
  Table,
  Toggle,
  type Column,
} from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { DataView, PanelEmpty } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { ApiPromo } from '@/types';
import { DIAS, LOCAL_NAV } from '@/data/panelMock';

const COLUMNS: Column<ApiPromo>[] = [
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
            className="h-9 w-9 flex-shrink-0 rounded-[9px] object-cover"
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
    render: () => (
      <div className="inline-flex gap-1.5">
        <Icon name="edit" size={17} className="text-graytext" />
        <Icon name="dots" size={17} className="text-graytext" />
      </div>
    ),
  },
];

export default function LocalBeneficios() {
  const state = useAsync(() => api.promos.mine({ limit: 50 }), []);
  const first = state.data?.data[0];

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Café Central"
      userRole="Comercio adherido"
      topbarTitle="Mis beneficios"
      topbarActions={<PButton icon="plus">Nuevo beneficio</PButton>}
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
                    <Table columns={COLUMNS} rows={page.data} />
                  </div>
                )
              }
            </DataView>
          </PCard>
        </div>

        {/* ── Editor de beneficio ── */}
        <PCard
          title="Editar beneficio"
          sub="2x1 en cafetería"
          actions={<Badge tone="ok">Activo</Badge>}
        >
          <div className="flex flex-col gap-[14px]">
            <Field
              label="Título del beneficio"
              value={first?.titulo ?? '2x1 en cafetería'}
            />
            <div className="flex gap-3">
              <Field label="Tipo" value="2x1" icon="tag" />
              <Field label="Rubro" value="Gastronomía" icon="store" />
            </div>
            <Field
              label="Descripción para el miembro"
              area
              value={
                first
                  ? first.descripcion ?? ''
                  : 'Llevá dos cafés y pagá uno. Válido para café de especialidad.'
              }
            />

            <div>
              <div className="mb-1.5 text-xs font-semibold text-graytext">Días válidos</div>
              <div className="flex flex-wrap gap-1.5">
                {DIAS.map((d, i) => (
                  <PChip key={d} active={i < 5}>
                    {d}
                  </PChip>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[10px] bg-fill px-3.5 py-3">
              <div>
                <div className="text-[13px] font-semibold text-ink">
                  Límite: 1 uso por miembro por día
                </div>
                <div className="text-[11px] text-mute">
                  Evita usos repetidos en la misma jornada
                </div>
              </div>
              <Toggle on />
            </div>

            <Field label="Imagen del beneficio" value="logo-cafe-central.jpg" icon="upload" />

            <div className="flex gap-2.5">
              <PButton variant="soft" full>
                Pausar
              </PButton>
              <PButton variant="primary" icon="check" full>
                Guardar cambios
              </PButton>
            </div>
          </div>
        </PCard>
      </div>
    </PanelShell>
  );
}
