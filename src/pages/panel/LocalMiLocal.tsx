// pages/panel/LocalMiLocal.tsx
// Panel Local · Mi local. El comercio ve y edita los datos del LOCAL ACTIVO
// (descripción, horarios, logo, banner, rubro, nombre). El local activo sale del
// switcher (multi-local). Reutiliza LocalFormModal (sin opción de eliminar).

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, LogoBox, PButton, PCard } from '@/components/panel/kit';
import { PanelEmpty, PanelLoading } from '@/components/panel/DataState';
import { LocalFormModal } from '@/components/panel/LocalFormModal';
import { useLocalScope } from '@/hooks/useLocalScope';
import { LOCAL_NAV } from '@/data/panelMock';
import { CATEGORIA_LABEL } from '@/lib/categorias';
import { DIAS_ORDEN, DIAS_SEMANA, rangosLabel } from '@/lib/opciones';

export default function LocalMiLocal() {
  const { activeLocal, loading, reload } = useLocalScope();
  const [editing, setEditing] = useState(false);

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Mi local"
      topbarActions={
        activeLocal ? (
          <PButton icon="edit" onClick={() => setEditing(true)}>
            Editar
          </PButton>
        ) : undefined
      }
    >
      {loading && !activeLocal ? (
        <PanelLoading />
      ) : !activeLocal ? (
        <PanelEmpty
          icon="store"
          title="Sin local asignado"
          hint="Tu cuenta todavía no tiene un local asignado. Contactá al administrador."
        />
      ) : (
        <div className="mx-auto flex w-full flex-col gap-4 lg:max-w-2xl">
          {/* Cabecera: banner + logo + nombre */}
          <PCard pad={0}>
            {activeLocal.banner_url ? (
              <img src={activeLocal.banner_url} alt="" className="h-32 w-full object-cover" />
            ) : (
              <div className="h-32 w-full bg-gradient-to-br from-brand to-brand-dark" />
            )}
            <div className="flex items-center gap-3.5 p-4">
              {activeLocal.logo_url ? (
                <img
                  src={activeLocal.logo_url}
                  alt=""
                  className="h-14 w-14 rounded-full border border-line object-cover"
                />
              ) : (
                <LogoBox size={56} />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-[17px] font-extrabold text-ink">{activeLocal.nombre}</h2>
                  {!activeLocal.activo && <Badge tone="mute">Pausado</Badge>}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-mute">
                  {activeLocal.rubro && (
                    <span className="font-semibold text-brand">{CATEGORIA_LABEL[activeLocal.rubro]}</span>
                  )}
                  {activeLocal.nro_local && <span>· Local {activeLocal.nro_local}</span>}
                </div>
              </div>
            </div>
          </PCard>

          {/* Descripción */}
          <PCard title="Descripción">
            {activeLocal.descripcion ? (
              <p className="text-[13.5px] leading-relaxed text-graytext">{activeLocal.descripcion}</p>
            ) : (
              <p className="text-[13px] text-mute">Sin descripción. Tocá “Editar” para agregar una.</p>
            )}
          </PCard>

          {/* Horarios */}
          <PCard title="Horarios">
            {activeLocal.horarios && activeLocal.horarios.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {DIAS_ORDEN.map((d) => {
                  const h = activeLocal.horarios!.find((x) => x.dia === d);
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

      {activeLocal && (
        <LocalFormModal
          open={editing}
          local={activeLocal}
          canDelete={false}
          onClose={() => setEditing(false)}
          onSaved={reload}
        />
      )}
    </PanelShell>
  );
}
