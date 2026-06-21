// components/panel/LocalFormModal.tsx
// Alta / edición de un local contra la API real (POST/PATCH/DELETE /api/locales).
// Inputs reales (el `Field` del kit es solo de lectura). Al guardar/eliminar
// con éxito avisa con onSaved() para que la lista recargue.

import { useEffect, useState } from 'react';
import { api, humanizeError } from '@/lib/api';
import type { ApiLocal } from '@/types';
import { PanelModal } from './PanelModal';
import { PButton, Toggle } from './kit';

function Input({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  const cls =
    'w-full rounded-[10px] border border-line bg-white px-[13px] py-2.5 text-[13.5px] text-ink outline-none placeholder:text-faint focus:border-brand';
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-graytext">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}

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
  const [descripcion, setDescripcion] = useState('');
  const [piso, setPiso] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  // Reset al abrir / cambiar de local.
  useEffect(() => {
    if (!open) return;
    setNombre(local?.nombre ?? '');
    setDescripcion(local?.descripcion ?? '');
    setPiso(local?.piso ?? '');
    setLogoUrl(local?.logo_url ?? '');
    setActivo(local?.activo ?? true);
    setError(null);
    setConfirmDel(false);
  }, [open, local]);

  const submit = async () => {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        piso: piso.trim() || null,
        logo_url: logoUrl.trim() || null,
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
        <Input label="Nombre *" value={nombre} onChange={setNombre} placeholder="Ej. Café Central" />
        <Input
          label="Descripción"
          value={descripcion}
          onChange={setDescripcion}
          placeholder="Breve descripción del local"
          textarea
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Piso" value={piso} onChange={setPiso} placeholder="Ej. 1, PB, 2" />
          </div>
          <div className="flex-[2]">
            <Input
              label="Logo (URL)"
              value={logoUrl}
              onChange={setLogoUrl}
              placeholder="https://…"
              type="url"
            />
          </div>
        </div>

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
          <p className="rounded-[10px] bg-bad-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-bad">
            {error}
          </p>
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
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="text-[12.5px] font-bold text-bad hover:underline"
              >
                Eliminar local
              </button>
            )}
          </div>
        )}
      </div>
    </PanelModal>
  );
}
