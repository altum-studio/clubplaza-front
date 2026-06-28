// pages/panel/LocalValidar.tsx
// Panel Local · Validar credencial. Flujo real contra la API:
//  1. El comercio elige el beneficio a aplicar (sus promos activas).
//  2. Ingresa/escanea el código del miembro → POST /escaneos (valida + nº de
//     beneficios activos) + GET /usuarios/codigo/:codigo (ficha con DNI).
//  3. Confirma → POST /canjes { codigo, promo_id }.
// El visor de cámara queda como placeholder; la entrada manual del código ya
// opera el flujo completo.

import { useState } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { Badge, PButton, PCard } from '@/components/panel/kit';
import { Icon } from '@/components/panel/Icon';
import { SelectInput } from '@/components/panel/FormControls';
import { QrScanner } from '@/components/panel/QrScanner';
import { DataView } from '@/components/panel/DataState';
import { useAsync } from '@/hooks/useAsync';
import { api, ApiError, humanizeError } from '@/lib/api';
import type { EscaneoResult, MiembroPorCodigo } from '@/types';
import { LOCAL_NAV } from '@/data/panelMock';
import { diasLabel, limiteLabel } from '@/lib/opciones';

type Lookup = { codigo: string; esc: EscaneoResult; miembro: MiembroPorCodigo | null };
type CanjeMsg = { ok: boolean; text: string };

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
  const [buscando, setBuscando] = useState(false);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [canjeando, setCanjeando] = useState(false);
  const [canjeMsg, setCanjeMsg] = useState<CanjeMsg | null>(null);

  const reset = () => {
    setLookup(null);
    setLookupErr(null);
    setCanjeMsg(null);
  };

  // La cámara escanea mientras no haya un resultado a la vista (al encontrar
  // miembro o error se pausa; vuelve a escanear al resetear).
  const scanActive = !lookup && !lookupErr && !buscando;

  async function buscar(override?: string) {
    const cod = (override ?? codigo).trim().toUpperCase();
    if (!cod) return;
    if (override) setCodigo(cod); // si vino del escáner, reflejarlo en el input
    setBuscando(true);
    reset();
    try {
      // El escaneo valida y registra; la ficha (DNI) es complementaria y opcional.
      const [esc, miembro] = await Promise.all([
        api.escaneos.create(cod),
        api.usuarios.byCodigo(cod).catch(() => null),
      ]);
      setLookup({ codigo: cod, esc, miembro });
    } catch (e) {
      // 404 "Miembro no encontrado" / 409 "El miembro está inactivo" son mensajes
      // reales del backend; el resto se muestra amigable.
      setLookupErr(e instanceof ApiError ? e.message : humanizeError(e));
    } finally {
      setBuscando(false);
    }
  }

  async function confirmar() {
    if (!benId || !lookup) return;
    setCanjeando(true);
    setCanjeMsg(null);
    try {
      await api.canjes.create({ codigo: lookup.codigo, promo_id: benId });
      setCanjeMsg({ ok: true, text: 'Canje registrado. ¡Listo!' });
    } catch (e) {
      setCanjeMsg({ ok: false, text: e instanceof ApiError ? e.message : humanizeError(e) });
    } finally {
      setCanjeando(false);
    }
  }

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
                sub="Escaneá el QR o ingresá el código del miembro"
              >
                <div className="flex flex-col gap-4">
                  {/* Visor del escáner (cámara en vivo, embebida) */}
                  <QrScanner active={scanActive} onDetect={(t) => buscar(t)} />

                  {/* Divisor */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-line" />
                    <span className="text-[11.5px] font-semibold text-mute">
                      o ingresá el código manualmente
                    </span>
                    <div className="h-px flex-1 bg-line" />
                  </div>

                  {/* Entrada manual de código (REAL) */}
                  <form
                    className="flex gap-2.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      buscar();
                    }}
                  >
                    <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-line bg-white px-[13px]">
                      <Icon name="qr" size={17} className="text-mute" />
                      <input
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                        placeholder="Ej. A7K2QM"
                        className="h-[42px] w-full bg-transparent font-mono text-[13.5px] tracking-[1px] text-ink outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-faint"
                      />
                    </div>
                    <PButton type="submit" className="flex-shrink-0" disabled={buscando || !codigo.trim()}>
                      {buscando ? 'Buscando…' : 'Buscar'}
                    </PButton>
                  </form>
                </div>
              </PCard>

              {/* DERECHA — beneficio a aplicar + resultado del miembro */}
              <div className="flex flex-col gap-[18px]">
                {/* Beneficio a aplicar */}
                <PCard>
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
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11.5px] text-mute">
                          <span>Días: {diasLabel(benSel.dias)}</span>
                          <span>{limiteLabel(benSel.limite_cantidad, benSel.limite_periodo)}</span>
                        </div>
                      )}
                    </>
                  )}
                </PCard>

                {/* Resultado del miembro */}
                <PCard title="Miembro" sub="Verificá identidad con el DNI antes de confirmar">
                {lookupErr ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-2 rounded-[10px] bg-bad-soft px-3.5 py-3">
                      <Icon name="x" size={18} className="mt-0.5 flex-shrink-0 text-bad" />
                      <p className="text-[12.5px] font-semibold text-bad">{lookupErr}</p>
                    </div>
                    <PButton variant="soft" full onClick={reset}>
                      Probar otro código
                    </PButton>
                  </div>
                ) : !lookup ? (
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
                    {/* Ficha del miembro */}
                    <div className="flex items-center justify-between rounded-[12px] bg-fill px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-extrabold text-ink">
                          {lookup.miembro
                            ? `${lookup.miembro.nombre} ${lookup.miembro.apellido}`.trim()
                            : lookup.esc.socio.nombre}
                        </div>
                        <div className="mt-0.5 font-mono text-[12.5px] font-bold tracking-[1.5px] text-graytext">
                          {lookup.codigo}
                          {lookup.miembro?.dni && (
                            <span className="ml-2 font-sans font-normal tracking-normal text-mute">
                              DNI {lookup.miembro.dni}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge tone={lookup.esc.socio.activo ? 'ok' : 'mute'}>
                        {lookup.esc.socio.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] border border-line-soft px-4 py-2.5 text-[12.5px]">
                      <span className="text-mute">Beneficios activos hoy</span>
                      <span className="font-bold text-ink">{lookup.esc.beneficios_activos}</span>
                    </div>

                    {benSel ? (
                      <div className="rounded-[10px] bg-brand-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-brand">
                        A aplicar: {benSel.titulo}
                      </div>
                    ) : (
                      <div className="rounded-[10px] bg-warn-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-warn">
                        Elegí el beneficio a aplicar (arriba) antes de confirmar.
                      </div>
                    )}

                    {canjeMsg && (
                      <div
                        className={`flex items-start gap-2 rounded-[10px] px-3.5 py-3 text-[12.5px] font-semibold ${
                          canjeMsg.ok ? 'bg-brand-soft text-brand' : 'bg-bad-soft text-bad'
                        }`}
                      >
                        <Icon
                          name={canjeMsg.ok ? 'check' : 'x'}
                          size={18}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <p>{canjeMsg.text}</p>
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      <PButton variant="soft" full onClick={reset}>
                        {canjeMsg?.ok ? 'Nuevo' : 'Cancelar'}
                      </PButton>
                      <PButton
                        variant="primary"
                        icon="check"
                        full
                        onClick={confirmar}
                        disabled={!benId || canjeando || canjeMsg?.ok}
                      >
                        {canjeando ? 'Confirmando…' : 'Confirmar canje'}
                      </PButton>
                    </div>
                  </div>
                )}
                </PCard>
              </div>
            </div>
          );
        }}
      </DataView>
    </PanelShell>
  );
}
