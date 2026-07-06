// pages/panel/LocalMiLocal.tsx
// Panel Local · Mi local. El comercio ve y edita sus propios datos (descripción,
// horarios, logo, banner, rubro, nombre) contra GET/PATCH /api/locales/mine/mi-local.
// Reutiliza LocalFormModal (sin la opción de eliminar).

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, LogoBox, PButton, PCard } from '@/components/panel/kit';
import { DataView } from '@/components/panel/DataState';
import { LocalFormModal } from '@/components/panel/LocalFormModal';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';
import { CATEGORIA_LABEL } from '@/lib/categorias';
import { DIAS_ORDEN, DIAS_SEMANA, rangosLabel } from '@/lib/opciones';

export default function LocalMiLocal() {
  const state = useAsync(() => api.locales.mine(), []);
  const [editing, setEditing] = useState(false);

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Mi local"
      topbarActions={
        state.data ? (
          <PButton icon="edit" onClick={() => setEditing(true)}>
            Editar
          </PButton>
        ) : undefined
      }
    >
      <DataView state={state}>
        {(local) => (
          <div className="flex flex-col gap-4 lg:max-w-2xl">
            {/* Cabecera: banner + logo + nombre */}
            <PCard pad={0}>
              {local.banner_url ? (
                <img src={local.banner_url} alt="" className="h-32 w-full object-cover" />
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-brand to-brand-dark" />
              )}
              <div className="flex items-center gap-3.5 p-4">
                {local.logo_url ? (
                  <img
                    src={local.logo_url}
                    alt=""
                    className="h-14 w-14 rounded-full border border-line object-cover"
                  />
                ) : (
                  <LogoBox size={56} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[17px] font-extrabold text-ink">{local.nombre}</h2>
                    {!local.activo && <Badge tone="mute">Pausado</Badge>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-mute">
                    {local.rubro && (
                      <span className="font-semibold text-brand">{CATEGORIA_LABEL[local.rubro]}</span>
                    )}
                    {local.nro_local && <span>· Local {local.nro_local}</span>}
                  </div>
                </div>
              </div>
            </PCard>

            {/* Descripción */}
            <PCard title="Descripción">
              {local.descripcion ? (
                <p className="text-[13.5px] leading-relaxed text-graytext">{local.descripcion}</p>
              ) : (
                <p className="text-[13px] text-mute">
                  Sin descripción. Tocá “Editar” para agregar una.
                </p>
              )}
            </PCard>

            {/* Horarios */}
            <PCard title="Horarios">
              {local.horarios && local.horarios.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {DIAS_ORDEN.map((d) => {
                    const h = local.horarios!.find((x) => x.dia === d);
                    const cerrado = !h || h.cerrado || h.rangos.length === 0;
                    return (
                      <li key={d} className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-ink">{DIAS_SEMANA[d].label}</span>
                        <span className={cerrado ? 'text-mute' : 'text-graytext'}>
                          {h ? rangosLabel(h) : 'Cerrado'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[13px] text-mute">Sin horarios cargados.</p>
              )}
            </PCard>
          </div>
        )}
      </DataView>

      {state.data && (
        <LocalFormModal
          open={editing}
          local={state.data}
          canDelete={false}
          onClose={() => setEditing(false)}
          onSaved={state.reload}
        />
      )}
    </PanelShell>
  );
}
