// components/panel/FormControls.tsx
// Controles de formulario reales para los modales del panel (el `Field` del kit
// es solo de lectura). Inputs, select, pickers de archivo (SVG/imagen), selector
// de días y editor de horarios.

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { api, humanizeError } from '@/lib/api';
import { Icon } from './Icon';
import { Toggle } from './kit';
import type { HorarioDia } from '@/types';
import { DIAS_ORDEN, DIAS_SEMANA } from '@/lib/opciones';

const INPUT =
  'w-full rounded-[10px] border border-line bg-white px-[13px] py-2.5 text-[13.5px] text-ink outline-none placeholder:text-faint focus:border-brand';

function Labeled({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-graytext">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-mute">{hint}</span>}
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <Labeled label={label} hint={hint}>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    </Labeled>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Labeled label={label}>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    </Labeled>
  );
}

export function SelectInput<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: T | '';
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}) {
  return (
    <Labeled label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={cn(INPUT, 'appearance-none pr-9', value ? 'text-ink' : 'text-faint')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-ink">
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevD" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute" />
      </div>
    </Labeled>
  );
}

// Picker de archivo que SUBE a /api/upload y guarda la URL devuelta.
// (logo → SVG ≤ 512 KB; banner → PNG/JPG/WebP/SVG ≤ 2 MB.)
function FilePicker({
  label,
  value,
  onChange,
  hint,
  spec,
  tipo,
  accept,
  buttonLabel,
  round = false,
  validate,
}: {
  label: string;
  value: string; // URL
  onChange: (v: string) => void;
  hint?: string;
  spec?: string; // resolución recomendada (se muestra debajo del recuadro)
  tipo: 'logo' | 'banner';
  accept: string;
  buttonLabel: string;
  round?: boolean;
  validate: (f: File) => string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setErr(null);
    const v = validate(file);
    if (v) {
      setErr(v);
      return;
    }
    setUploading(true);
    try {
      onChange(await api.upload(file, tipo));
    } catch (e) {
      setErr(humanizeError(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Labeled label={label} hint={hint}>
      <div className="flex items-start gap-3">
        <div className="flex flex-shrink-0 flex-col items-center gap-1">
          <div
            className={cn(
              'flex items-center justify-center overflow-hidden border',
              round ? 'h-16 w-16 rounded-full border-line bg-white' : 'h-16 w-28 rounded-[10px] border-dashed border-line bg-fill',
            )}
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
            ) : value ? (
              <img src={value} alt="" className={cn('h-full w-full', round ? 'object-contain' : 'object-cover')} />
            ) : (
              <Icon name="upload" size={18} className="text-faint" />
            )}
          </div>
          {spec && (
            <span className="block max-w-[7.5rem] text-center text-[10px] font-medium leading-tight text-mute">
              {spec}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-graytext hover:bg-fill',
              uploading && 'pointer-events-none opacity-60',
            )}
          >
            <Icon name="upload" size={14} />
            {uploading ? 'Subiendo…' : value ? 'Cambiar' : buttonLabel}
            <input type="file" accept={accept} className="hidden" disabled={uploading} onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {value && !uploading && (
            <button type="button" onClick={() => onChange('')} className="text-left text-[11px] font-semibold text-bad hover:underline">
              Quitar
            </button>
          )}
        </div>
      </div>
      {err && <p className="mt-1.5 text-[11px] font-medium text-bad">{err}</p>}
    </Labeled>
  );
}

// Banner: PNG/JPG/WebP/SVG hasta 2 MB.
export function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FilePicker
      label={label}
      value={value}
      onChange={onChange}
      hint="PNG/JPG/WebP · máx 2 MB"
      spec="1200 × 600 px (2:1)"
      tipo="banner"
      accept="image/png,image/jpeg,image/webp,image/svg+xml"
      buttonLabel="Subir imagen"
      validate={(f) => {
        if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) return 'Formato no válido (PNG, JPG, WebP o SVG).';
        if (f.size > 2 * 1024 * 1024) return 'La imagen supera los 2 MB.';
        return null;
      }}
    />
  );
}

// Logo: SVG únicamente, hasta 512 KB.
export function SvgPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FilePicker
      label={label}
      value={value}
      onChange={onChange}
      hint="SVG · máx 512 KB"
      spec="Cuadrado · 1:1"
      tipo="logo"
      accept="image/svg+xml,.svg"
      buttonLabel="Subir SVG"
      round
      validate={(f) => {
        if (!/svg/i.test(f.type) && !f.name.toLowerCase().endsWith('.svg')) return 'El logo debe ser un archivo SVG.';
        if (f.size > 512 * 1024) return 'El logo supera los 512 KB.';
        return null;
      }}
    />
  );
}

// Selector de días válidos (chips Lun→Dom).
export function DaysPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const toggle = (d: number) => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-graytext">Días válidos</span>
      <div className="flex flex-wrap gap-1.5">
        {DIAS_ORDEN.map((d) => {
          const on = value.includes(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                on ? 'bg-brand text-white' : 'border border-line bg-white text-graytext hover:bg-fill',
              )}
            >
              {DIAS_SEMANA[d].corto}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Editor de horarios (un rango por día en el form; el modelo soporta más).
export function HorariosEditor({ value, onChange }: { value: HorarioDia[]; onChange: (v: HorarioDia[]) => void }) {
  const byDia = (dia: number): HorarioDia => value.find((h) => h.dia === dia) ?? { dia, cerrado: true, rangos: [] };

  const update = (dia: number, patch: Partial<HorarioDia>) => {
    const next = DIAS_ORDEN.map((d) => {
      const cur = byDia(d);
      return d === dia ? { ...cur, ...patch } : cur;
    });
    onChange(next);
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-graytext">Horarios de apertura</span>
      <div className="flex flex-col divide-y divide-line-soft rounded-[10px] border border-line">
        {DIAS_ORDEN.map((d) => {
          const h = byDia(d);
          const [desde, hasta] = h.rangos[0] ?? ['10:00', '21:00'];
          return (
            <div key={d} className="flex items-center gap-2 px-3 py-2">
              <span className="w-9 text-[12.5px] font-bold text-ink">{DIAS_SEMANA[d].corto}</span>
              {h.cerrado ? (
                <span className="flex-1 text-[12.5px] text-mute">Cerrado</span>
              ) : (
                <div className="flex flex-1 items-center gap-1.5">
                  <input
                    type="time"
                    value={desde}
                    onChange={(e) => update(d, { rangos: [[e.target.value, hasta]] })}
                    className="rounded-lg border border-line px-2 py-1 text-[12.5px] text-ink outline-none focus:border-brand"
                  />
                  <span className="text-mute">a</span>
                  <input
                    type="time"
                    value={hasta}
                    onChange={(e) => update(d, { rangos: [[desde, e.target.value]] })}
                    className="rounded-lg border border-line px-2 py-1 text-[12.5px] text-ink outline-none focus:border-brand"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => update(d, { cerrado: !h.cerrado, rangos: h.cerrado ? [['10:00', '21:00']] : [] })}
                className="flex items-center gap-2"
                aria-label={h.cerrado ? 'Abrir' : 'Cerrar'}
              >
                <Toggle on={!h.cerrado} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
