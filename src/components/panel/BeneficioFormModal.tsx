// components/panel/BeneficioFormModal.tsx
// Alta / edición de un beneficio (promo) contra la API real. Sirve para el panel
// Admin (elige el local) y el panel Local (usa su propio local). Incluye los
// campos del modelo nuevo: tipo, valor, días, vigencia (fecha o indefinido),
// límite de uso y banner. El rubro se toma automáticamente del local.

import { useEffect, useMemo, useState } from 'react';
import { api, bodyTooLarge, humanizeError } from '@/lib/api';
import type { ApiLocal, ApiPromo, LimitePeriodo, TipoBeneficio } from '@/types';
import { PanelModal } from './PanelModal';
import { PButton, Toggle } from './kit';
import { DaysPicker, ImagePicker, SelectInput, TextArea, TextInput } from './FormControls';
import { CATEGORIA_LABEL } from '@/lib/categorias';
import { LIMITE_PERIODO, TIPO_BENEFICIO, VIGENCIA_INDEF_HASTA, esVigenciaIndefinida } from '@/lib/opciones';

export function BeneficioFormModal({
  open,
  promo,
  mode,
  locales = [],
  lockedLocalId,
  onClose,
  onSaved,
}: {
  open: boolean;
  promo: ApiPromo | null; // null = alta
  mode: 'admin' | 'local'; // admin elige local; local usa el propio
  locales?: ApiLocal[]; // solo admin: lista para el select
  // Si se carga desde un local desplegado, ese local viene fijado (no se elige).
  lockedLocalId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!promo;
  const [localId, setLocalId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoBeneficio | ''>('');
  const [valor, setValor] = useState('');
  const [precioAnterior, setPrecioAnterior] = useState('');
  const [precioNuevo, setPrecioNuevo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dias, setDias] = useState<number[]>([1, 2, 3, 4, 5]);
  const [indefinida, setIndefinida] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [limiteCantidad, setLimiteCantidad] = useState('1');
  const [limitePeriodo, setLimitePeriodo] = useState<LimitePeriodo>('dia');
  const [bannerUrl, setBannerUrl] = useState('');
  const [activa, setActiva] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLocalId(promo?.local_id ?? lockedLocalId ?? '');
    setTitulo(promo?.titulo ?? '');
    setTipo(promo?.tipo ?? '');
    setValor(promo?.valor != null ? String(promo.valor) : '');
    setPrecioAnterior(promo?.precio_anterior != null ? String(promo.precio_anterior) : '');
    setPrecioNuevo(promo?.precio_nuevo != null ? String(promo.precio_nuevo) : '');
    setDescripcion(promo?.descripcion ?? '');
    setDias(promo?.dias ?? [1, 2, 3, 4, 5]);
    const d = promo?.vigencia_desde ?? promo?.fecha_inicio ?? '';
    const h = promo?.vigencia_hasta ?? promo?.fecha_fin ?? '';
    // Si viene con la fecha centinela (o sin fechas), arranca como "indefinido".
    const indef = isEdit ? esVigenciaIndefinida(h) : false;
    setIndefinida(indef);
    setDesde(indef ? '' : d);
    setHasta(indef ? '' : h);
    setLimiteCantidad(promo?.limite_cantidad != null ? String(promo.limite_cantidad) : '1');
    setLimitePeriodo(promo?.limite_periodo ?? 'dia');
    setBannerUrl(promo?.banner_url ?? promo?.imagen_url ?? '');
    setActiva(promo?.activa ?? true);
    setError(null);
  }, [open, promo, isEdit, lockedLocalId]);

  const tipoDef = TIPO_BENEFICIO.find((t) => t.value === tipo);
  const esDescuentoFijo = tipo === 'descuento_fijo'; // usa precio anterior/nuevo
  const localOptions = useMemo(
    () => locales.map((l) => ({ value: l.id, label: l.nro_local ? `${l.nombre} · ${l.nro_local}` : l.nombre })),
    [locales],
  );
  // Rubro automático: del local elegido (admin) o de la promo en edición.
  const rubro = useMemo(() => {
    if (mode === 'admin') return locales.find((l) => l.id === localId)?.rubro ?? null;
    return promo?.rubro ?? null;
  }, [mode, locales, localId, promo]);

  const submit = async () => {
    if (mode === 'admin' && !localId) return setError('Elegí un local');
    if (!titulo.trim()) return setError('El título es obligatorio');
    if (!tipo) return setError('Elegí el tipo de beneficio');
    // El backend exige `valor` para estos tipos (ver guía de integración §6).
    if (['descuento', 'cuotas'].includes(tipo) && !valor)
      return setError('Ingresá el valor (porcentaje o nº de cuotas)');
    if (esDescuentoFijo && (!precioAnterior || !precioNuevo))
      return setError('Ingresá el precio anterior y el precio nuevo');
    if (dias.length === 0) return setError('Elegí al menos un día válido');
    if (!indefinida && (!desde || !hasta)) return setError('Completá la vigencia o marcá "indefinido"');

    // El backend exige vigencia siempre. "Sin vencimiento" → fecha centinela
    // lejana (desde hoy) que el front muestra como indefinido.
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
      hoy.getDate(),
    ).padStart(2, '0')}`;

    const base = {
      titulo: titulo.trim(),
      tipo,
      // Para 'descuento_fijo' guardamos el precio nuevo también en `valor` (compat
      // con el backend actual) + los dos precios en sus campos.
      valor: esDescuentoFijo
        ? Number(precioNuevo) || null
        : tipoDef?.usaValor && valor
          ? Number(valor)
          : null,
      precio_anterior: esDescuentoFijo && precioAnterior ? Number(precioAnterior) : null,
      precio_nuevo: esDescuentoFijo && precioNuevo ? Number(precioNuevo) : null,
      descripcion: descripcion.trim() || null,
      dias,
      vigencia_desde: indefinida ? hoyStr : desde,
      vigencia_hasta: indefinida ? VIGENCIA_INDEF_HASTA : hasta,
      limite_cantidad: limitePeriodo === 'ilimitado' ? null : Number(limiteCantidad) || 1,
      limite_periodo: limitePeriodo,
      banner_url: bannerUrl || null,
      activa,
    };
    if (bodyTooLarge(mode === 'admin' && !isEdit ? { local_id: localId, ...base } : base))
      return setError(
        'El banner es muy pesado para guardarlo así (~90 KB máx). Usá una imagen más liviana. Para archivos pesados hace falta habilitar el upload de archivos en el backend.',
      );

    setSaving(true);
    setError(null);
    try {
      if (isEdit) await api.promos.update(promo!.id, base);
      else if (mode === 'admin') await api.promos.create({ local_id: localId, ...base });
      // Modo local: local activo del switcher (multi-local) va en el body.
      else await api.promos.createMine(localId ? { ...base, local_id: localId } : base);
      onSaved();
      onClose();
    } catch (e) {
      setError(humanizeError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelModal
      open={open}
      title={isEdit ? 'Editar beneficio' : 'Cargar beneficio'}
      onClose={onClose}
      footer={
        <>
          <PButton variant="soft" onClick={onClose}>
            Cancelar
          </PButton>
          <PButton icon="check" onClick={submit}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Publicar beneficio'}
          </PButton>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        {mode === 'admin' && !isEdit && !lockedLocalId && (
          <SelectInput label="Local *" value={localId} onChange={setLocalId} options={localOptions} placeholder="Elegí el local" />
        )}
        {mode === 'admin' && !isEdit && lockedLocalId && (
          <div className="flex items-center gap-2 rounded-[10px] bg-fill px-3.5 py-2.5">
            <span className="text-[12.5px] font-semibold text-graytext">Local</span>
            <span className="text-[12.5px] font-bold text-ink">
              {locales.find((l) => l.id === localId)?.nombre ?? ''}
            </span>
          </div>
        )}

        {rubro && (
          <div className="flex items-center gap-2 rounded-[10px] bg-fill px-3.5 py-2.5">
            <span className="text-[12.5px] font-semibold text-graytext">Rubro</span>
            <span className="text-[12.5px] font-bold text-brand">{CATEGORIA_LABEL[rubro]}</span>
            <span className="text-[11px] text-mute">· automático del local</span>
          </div>
        )}

        <TextInput label="Título *" value={titulo} onChange={setTitulo} placeholder="Ej. 2x1 en cafetería" />

        <div className="flex gap-3">
          <div className="flex-1">
            <SelectInput label="Tipo *" value={tipo} onChange={setTipo} options={TIPO_BENEFICIO} placeholder="Elegí el tipo" />
          </div>
          {tipoDef?.usaValor && !esDescuentoFijo && (
            <div className="w-32">
              <TextInput label="Valor" value={valor} onChange={setValor} placeholder="Ej. 20" type="number" />
            </div>
          )}
        </div>

        {/* Descuento $: precio anterior (tachado) + precio nuevo */}
        {esDescuentoFijo && (
          <div className="flex gap-3">
            <div className="flex-1">
              <TextInput
                label="Precio anterior *"
                value={precioAnterior}
                onChange={setPrecioAnterior}
                placeholder="Ej. 10000"
                type="number"
              />
            </div>
            <div className="flex-1">
              <TextInput
                label="Precio nuevo *"
                value={precioNuevo}
                onChange={setPrecioNuevo}
                placeholder="Ej. 7000"
                type="number"
              />
            </div>
          </div>
        )}

        <TextArea label="Descripción" value={descripcion} onChange={setDescripcion} placeholder="Cómo se usa el beneficio" />

        <DaysPicker value={dias} onChange={setDias} />

        {/* Vigencia: fecha o indefinido */}
        <div className="rounded-[10px] border border-line p-3">
          <button type="button" onClick={() => setIndefinida((v) => !v)} className="flex w-full items-center justify-between">
            <div className="text-left">
              <div className="text-[13px] font-bold text-ink">Sin vencimiento (indefinido)</div>
              <div className="text-[11.5px] text-mute">El beneficio no caduca por fecha</div>
            </div>
            <Toggle on={indefinida} />
          </button>
          {!indefinida && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <TextInput label="Vigente desde" value={desde} onChange={setDesde} type="date" />
              </div>
              <div className="min-w-0">
                <TextInput label="Vigente hasta" value={hasta} onChange={setHasta} type="date" />
              </div>
            </div>
          )}
        </div>

        {/* Límite de uso */}
        <div className="flex gap-3">
          <div className="flex-1">
            <SelectInput label="Límite de uso" value={limitePeriodo} onChange={setLimitePeriodo} options={LIMITE_PERIODO} />
          </div>
          {limitePeriodo !== 'ilimitado' && (
            <div className="w-28">
              <TextInput label="Cantidad" value={limiteCantidad} onChange={setLimiteCantidad} type="number" />
            </div>
          )}
        </div>

        <ImagePicker label="Banner del beneficio" value={bannerUrl} onChange={setBannerUrl} />

        <button
          type="button"
          onClick={() => setActiva((a) => !a)}
          className="flex items-center justify-between rounded-[10px] bg-fill px-3.5 py-3 text-left"
        >
          <div>
            <div className="text-[13px] font-bold text-ink">Beneficio activo</div>
            <div className="text-[11.5px] text-mute">Visible para los miembros</div>
          </div>
          <Toggle on={activa} />
        </button>

        {error && <p className="rounded-[10px] bg-bad-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-bad">{error}</p>}
      </div>
    </PanelModal>
  );
}
