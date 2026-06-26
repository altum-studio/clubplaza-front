// pages/panel/LocalValidar.tsx
// Panel Local · Validar credencial. El selector de "Beneficio a aplicar" sale de
// los beneficios REALES del local (api.promos.mine). El escaneo de QR / búsqueda
// de miembro y el registro del canje requieren endpoints que el backend todavía
// no tiene (buscar miembro por código + canjes), así que esa parte queda marcada.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, PButton, PCard } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { SelectInput } from '@/components/panel/FormControls';
import { DataView } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import { LOCAL_NAV } from '@/data/panelMock';
import { diasLabel, limiteLabel } from '@/lib/opciones';

export default function LocalValidar() {
  const state = useAsync(
    () =>
      Promise.all([api.locales.mine().catch(() => null), api.promos.mine({ limit: 200 })]).then(
        ([local, promos]) => ({ local, promos: promos.data }),
      ),
    [],
  );

  const [benId, setBenId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [searched, setSearched] = useState<string | null>(null);

  return (
    <PanelShell
      role="Local"
      nav={LOCAL_NAV}
      userName="Comercio"
      userRole="Comercio adherido"
      topbarTitle="Validar credencial"
    >
      <DataView state={state}>
        {(d) => {
          const activos = d.promos.filter((p) => p.activa);
          const benOptions = activos.map((p) => ({ value: p.id, label: p.titulo }));
          const benSel = activos.find((p) => p.id === benId);

          return (
            <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
              {/* IZQUIERDA — beneficio + escáner/código */}
              <PCard
                title="Validar credencial"
                sub="Elegí el beneficio y escaneá o ingresá el código del miembro"
              >
                <div className="flex flex-col gap-4">
                  {/* Beneficio a aplicar — REAL, los beneficios activos del local */}
                  {activos.length === 0 ? (
                    <div className="rounded-[10px] bg-warn-soft px-3.5 py-3 text-[12.5px] font-semibold text-warn">
                      Este local no tiene beneficios activos. Cargá uno en la sección “Beneficios”.
                    </div>
                  ) : (
                    <>
                      <SelectInput
                        label="Beneficio a aplicar"
                        value={benId}
                        onChange={setBenId}
                        options={benOptions}
                        placeholder="Elegí el beneficio"
                      />
                      {benSel && (
                        <div className="-mt-1 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11.5px] text-mute">
                          <span>Días: {diasLabel(benSel.dias)}</span>
                          <span>{limiteLabel(benSel.limite_cantidad, benSel.limite_periodo)}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Visor del escáner (cámara real: pendiente de integración) */}
                  <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-[14px] bg-brand-dark">
                    <div className="relative h-[160px] w-[160px]">
                      <div className="absolute left-0 top-0 h-[32px] w-[32px] border-l-[3px] border-t-[3px] border-white" />
                      <div className="absolute right-0 top-0 h-[32px] w-[32px] border-r-[3px] border-t-[3px] border-white" />
                      <div className="absolute bottom-0 left-0 h-[32px] w-[32px] border-b-[3px] border-l-[3px] border-white" />
                      <div className="absolute bottom-0 right-0 h-[32px] w-[32px] border-b-[3px] border-r-[3px] border-white" />
                      <div className="absolute left-2 right-2 top-1/2 h-[2px] bg-[#23d366] shadow-[0_0_12px_#23d366]" />
                    </div>
                    <div className="absolute inset-x-0 bottom-3.5 text-center text-[12.5px] text-white/80">
                      Apuntá la cámara al QR de la credencial
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-line" />
                    <span className="text-[11.5px] font-semibold text-mute">
                      o ingresá el código manualmente
                    </span>
                    <div className="h-px flex-1 bg-line" />
                  </div>

                  {/* Entrada manual de código (REAL) */}
                  <div className="flex gap-2.5">
                    <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-line bg-white px-[13px]">
                      <Icon name="qr" size={17} className="text-mute" />
                      <input
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                        placeholder="Ej. A7K2QM"
                        className="h-[42px] w-full bg-transparent font-mono text-[13.5px] tracking-[1px] text-ink outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-faint"
                      />
                    </div>
                    <PButton
                      className="flex-shrink-0"
                      onClick={() => setSearched(codigo.trim())}
                    >
                      Buscar
                    </PButton>
                  </div>
                </div>
              </PCard>

              {/* DERECHA — resultado */}
              <PCard title="Miembro" sub="Verificá identidad con el DNI antes de confirmar">
                {!searched ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fill">
                      <Icon name="user" size={22} className="text-faint" />
                    </span>
                    <p className="max-w-xs text-[13px] text-graytext">
                      Elegí el beneficio y escaneá o ingresá el código del miembro para validar.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between rounded-[12px] bg-fill px-4 py-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-mute">
                          Código ingresado
                        </div>
                        <div className="font-mono text-[18px] font-bold tracking-[2px] text-ink">
                          {searched || '—'}
                        </div>
                      </div>
                      {benSel && <Badge tone="ok">{benSel.titulo}</Badge>}
                    </div>

                    {/* Falta backend para esto */}
                    <div className="flex items-start gap-2 rounded-[10px] bg-warn-soft px-3.5 py-3">
                      <Icon name="clock" size={18} className="mt-0.5 flex-shrink-0 text-warn" />
                      <p className="text-[12.5px] font-medium text-warn">
                        Para mostrar el miembro y registrar el canje el backend necesita dos
                        endpoints que todavía no existen: <b>buscar miembro por código</b> y{' '}
                        <b>registrar canje</b>. Apenas estén, acá aparece el miembro y se habilita
                        “Confirmar canje”.
                      </p>
                    </div>

                    <div className="flex gap-2.5">
                      <PButton variant="soft" full onClick={() => setSearched(null)}>
                        Cancelar
                      </PButton>
                      <PButton variant="primary" icon="check" full className="cursor-not-allowed opacity-50">
                        Confirmar canje
                      </PButton>
                    </div>
                  </div>
                )}
              </PCard>
            </div>
          );
        }}
      </DataView>
    </PanelShell>
  );
}
