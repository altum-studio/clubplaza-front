// components/panel/LocalFormModal.tsx
// Alta / edición de un local contra la API real (POST/PATCH/DELETE /api/locales),
// con todos los campos del modelo nuevo: nº de local, rubro, logo SVG, banner y
// horarios. Al guardar/eliminar con éxito avisa con onSaved() para recargar.

import { useEffect, useState } from 'react';
import { api, humanizeError } from '@/lib/api';
import type { ApiLocal, Categoria, HorarioDia } from '@/types';
import { PanelModal } from './PanelModal';
import { PButton, Toggle } from './kit';
import {
  HorariosEditor,
  ImagePicker,
  SelectInput,
  SvgPicker,
  TextArea,
  TextInput,
} from './FormControls';
import { DEFAULT_HORARIOS, RUBRO_OPTIONS } from '@/lib/opciones';

export function LocalFormModal({
  open,
  local,
  onClose,
  onSaved,
}: {
  open: boolean;
  local: ApiLocal | null; // null = alta
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!local;
  const [nombre, setNombre] = useState('');
  const [nroLocal, setNroLocal] = useState('');
  const [rubro, setRubro] = useState<Categoria | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [horarios, setHorarios] = useState<HorarioDia[]>(DEFAULT_HORARIOS);
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNombre(local?.nombre ?? '');
    setNroLocal(local?.nro_local ?? local?.piso ?? '');
    setRubro(local?.rubro ?? '');
    setDescripcion(local?.descripcion ?? '');
    setLogoUrl(local?.logo_url ?? '');
    setBannerUrl(local?.banner_url ?? '');
    setHorarios(local?.horarios ?? DEFAULT_HORARIOS);
    setActivo(local?.activo ?? true);
    setError(null);
    setConfirmDel(false);
  }, [open, local]);

  const submit = async () => {
    if (!nombre.trim()) return setError('El nombre es obligatorio');
    if (!rubro) return setError('Elegí un rubro');
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: nombre.trim(),
        nro_local: nroLocal.trim() || null,
        rubro,
        descripcion: descripcion.trim() || null,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        horarios,
        activo,
      };
      if (isEdit) await api.locales.update(local!.id, payload);
      else await api.locales.create(payload);
      onSaved();
      onClose();
    } catch (e) {
      setError(humanizeError(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!local) return;
    setSaving(true);
    setError(null);
    try {
      await api.locales.remove(local.id);
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
      title={isEdit ? 'Editar local' : 'Alta de local'}
      onClose={onClose}
      footer={
        <>
          <PButton variant="soft" onClick={onClose}>
            Cancelar
          </PButton>
          <PButton icon="check" onClick={submit}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear local'}
          </PButton>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex gap-3">
          <div className="flex-[2]">
            <TextInput label="Nombre *" value={nombre} onChange={setNombre} placeholder="Ej. Café Central" />
          </div>
          <div className="flex-1">
            <TextInput label="Nº de local" value={nroLocal} onChange={setNroLocal} placeholder="L.16" />
          </div>
        </div>

        <SelectInput
          label="Rubro *"
          value={rubro}
          onChange={setRubro}
          options={RUBRO_OPTIONS}
          placeholder="Elegí un rubro"
        />

        <TextArea label="Descripción" value={descripcion} onChange={setDescripcion} placeholder="Breve descripción del local" />

        <div className="flex flex-wrap gap-5">
          <SvgPicker label="Logo (SVG)" value={logoUrl} onChange={setLogoUrl} hint="Archivo .svg" />
          <div className="min-w-[200px] flex-1">
            <ImagePicker label="Banner del local" value={bannerUrl} onChange={setBannerUrl} hint="PNG/JPG/WebP" />
          </div>
        </div>

        <HorariosEditor value={horarios} onChange={setHorarios} />

        <button
          type="button"
          onClick={() => setActivo((a) => !a)}
          className="flex items-center justify-between rounded-[10px] bg-fill px-3.5 py-3 text-left"
        >
          <div>
            <div className="text-[13px] font-bold text-ink">Local activo</div>
            <div className="text-[11.5px] text-mute">Visible para los miembros</div>
          </div>
          <Toggle on={activo} />
        </button>

        {error && (
          <p className="rounded-[10px] bg-bad-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-bad">{error}</p>
        )}

        {isEdit && (
          <div className="mt-1 border-t border-line-soft pt-3.5">
            {confirmDel ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-bad">¿Eliminar este local?</span>
                <div className="flex gap-2">
                  <PButton size="sm" variant="soft" onClick={() => setConfirmDel(false)}>
                    No
                  </PButton>
                  <PButton size="sm" variant="danger" icon="trash" onClick={remove}>
                    Sí, eliminar
                  </PButton>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDel(true)} className="text-[12.5px] font-bold text-bad hover:underline">
                Eliminar local
              </button>
            )}
          </div>
        )}
      </div>
    </PanelModal>
  );
}
