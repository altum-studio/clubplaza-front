// components/panel/UsuarioFormModal.tsx
// Alta / edición de usuario (admin) contra /api/usuarios. Permite cambiar el rol,
// asignar un local (cuando el rol es "local"), activar/desactivar y eliminar.

import { useEffect, useState } from 'react';
import { api, humanizeError } from '@/lib/api';
import type { ApiLocal, Profile, Role } from '@/types';
import { PanelModal } from './PanelModal';
import { PButton, Toggle } from './kit';
import { Icon } from './Icon';
import { SelectInput, TextInput } from './FormControls';
import { ROLE_LABEL } from '@/lib/roles';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'comun', label: ROLE_LABEL.comun },
  { value: 'local', label: ROLE_LABEL.local },
  { value: 'admin', label: ROLE_LABEL.admin },
];

export function UsuarioFormModal({
  open,
  usuario,
  locales,
  onClose,
  onSaved,
}: {
  open: boolean;
  usuario: Profile | null; // null = alta
  locales: ApiLocal[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!usuario;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [rol, setRol] = useState<Role>('comun');
  const [localIds, setLocalIds] = useState<string[]>([]);
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail(usuario?.email ?? '');
    setPassword('');
    setNombre(usuario?.nombre ?? '');
    setApellido(usuario?.apellido ?? '');
    setDni(usuario?.dni ?? '');
    setTelefono(usuario?.telefono ?? '');
    setFechaNac(usuario?.fecha_nacimiento ?? '');
    setRol(usuario?.rol ?? 'comun');
    setLocalIds(usuario?.local_ids ?? (usuario?.local_id ? [usuario.local_id] : []));
    setActivo(usuario?.activo ?? true);
    setError(null);
    setConfirmDel(false);
  }, [open, usuario]);

  const toggleLocal = (id: string) =>
    setLocalIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const submit = async () => {
    if (!nombre.trim() || !apellido.trim()) return setError('Nombre y apellido son obligatorios');
    if (!isEdit) {
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.trim())) return setError('Email inválido');
      if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    }
    if (rol === 'local' && localIds.length === 0)
      return setError('Asigná al menos un local al rol Comercio');

    setSaving(true);
    setError(null);
    try {
      const base = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        telefono: telefono.trim(),
        fecha_nacimiento: fechaNac || undefined,
        rol,
        // local_ids = fuente de verdad (tabla intermedia); local_id = 1º por compat.
        local_ids: rol === 'local' ? localIds : [],
        local_id: rol === 'local' ? (localIds[0] ?? null) : null,
      };
      if (isEdit) {
        await api.usuarios.update(usuario!.id, { ...base, activo });
      } else {
        await api.usuarios.create({ ...base, email: email.trim(), password });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(humanizeError(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!usuario) return;
    setSaving(true);
    setError(null);
    try {
      await api.usuarios.remove(usuario.id);
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
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      onClose={onClose}
      footer={
        <>
          <PButton variant="soft" onClick={onClose}>
            Cancelar
          </PButton>
          <PButton icon="check" onClick={submit}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </PButton>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        {!isEdit && (
          <>
            <TextInput label="Email *" value={email} onChange={setEmail} placeholder="vos@email.com" type="email" />
            <TextInput
              label="Contraseña *"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              type="password"
            />
          </>
        )}
        {isEdit && (
          <div className="rounded-[10px] bg-fill px-3.5 py-2.5 text-[12.5px] text-graytext">
            {usuario!.email}
            <span className="ml-1 text-mute">· el email no se edita</span>
          </div>
        )}

        <div className="flex gap-3">
          <TextInput label="Nombre *" value={nombre} onChange={setNombre} placeholder="Juan" />
          <TextInput label="Apellido *" value={apellido} onChange={setApellido} placeholder="Pérez" />
        </div>
        <div className="flex gap-3">
          <TextInput label="DNI" value={dni} onChange={setDni} placeholder="30123456" />
          <TextInput label="Teléfono" value={telefono} onChange={setTelefono} placeholder="1122334455" />
        </div>
        <TextInput label="Fecha de nacimiento" value={fechaNac} onChange={setFechaNac} type="date" />

        <SelectInput label="Rol *" value={rol} onChange={setRol} options={ROLE_OPTIONS} />
        {rol === 'local' && (
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.4px] text-mute">
              Locales asignados *
            </div>
            <div className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-[10px] border border-line p-1.5">
              {locales.length === 0 ? (
                <div className="px-2 py-3 text-center text-[12.5px] text-mute">No hay locales.</div>
              ) : (
                locales.map((l) => {
                  const on = localIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleLocal(l.id)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                        on ? 'bg-brand-soft' : 'hover:bg-fill'
                      }`}
                    >
                      <span
                        className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border ${
                          on ? 'border-brand bg-brand text-white' : 'border-line'
                        }`}
                      >
                        {on && <Icon name="check" size={12} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                        {l.nombre}
                        {l.nro_local ? ` · ${l.nro_local}` : ''}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-1 text-[11px] text-mute">
              {localIds.length} seleccionado{localIds.length === 1 ? '' : 's'} · si asignás más de uno,
              el usuario puede switchear entre ellos.
            </div>
          </div>
        )}

        {isEdit && (
          <button
            type="button"
            onClick={() => setActivo((a) => !a)}
            className="flex items-center justify-between rounded-[10px] bg-fill px-3.5 py-3 text-left"
          >
            <div>
              <div className="text-[13px] font-bold text-ink">Usuario activo</div>
              <div className="text-[11.5px] text-mute">Si está inactivo no puede usar la app</div>
            </div>
            <Toggle on={activo} />
          </button>
        )}

        {error && (
          <p className="rounded-[10px] bg-bad-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-bad">{error}</p>
        )}

        {isEdit && (
          <div className="mt-1 border-t border-line-soft pt-3.5">
            {confirmDel ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-bad">¿Eliminar este usuario?</span>
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
                Eliminar usuario
              </button>
            )}
          </div>
        )}
      </div>
    </PanelModal>
  );
}
