// components/panel/FormControls.tsx
// Controles de formulario reales para los modales del panel (el `Field` del kit
// es solo de lectura). Inputs, select, pickers de archivo (SVG/imagen), selector
// de días y editor de horarios.

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
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

// Picker de imagen (banner): guarda un data URL y muestra preview.
export function ImagePicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string; // data URL o URL
  onChange: (v: string) => void;
  hint?: string;
}) {
  const read = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsDataURL(file);
  };
  return (
    <Labeled label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-line bg-fill">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name="upload" size={18} className="text-faint" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-graytext hover:bg-fill">
            <Icon name="upload" size={14} />
            {value ? 'Cambiar' : 'Subir imagen'}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => read(e.target.files?.[0])} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-left text-[11px] font-semibold text-bad hover:underline">
              Quitar
            </button>
          )}
        </div>
      </div>
    </Labeled>
  );
}

// Picker de logo SVG: guarda el markup (texto) y lo muestra inline.
export function SvgPicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string; // markup SVG
  onChange: (v: string) => void;
  hint?: string;
}) {
  const read = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsText(file);
  };
  return (
    <Labeled label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white [&_svg]:h-full [&_svg]:w-full"
          // SVG provisto por el comercio. TODO: sanitizar en el backend antes de servir.
          dangerouslySetInnerHTML={value ? { __html: value } : undefined}
        >
          {!value && <Icon name="upload" size={18} className="text-faint" />}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-graytext hover:bg-fill">
            <Icon name="upload" size={14} />
            {value ? 'Cambiar' : 'Subir SVG'}
            <input type="file" accept="image/svg+xml,.svg" className="hidden" onChange={(e) => read(e.target.files?.[0])} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-left text-[11px] font-semibold text-bad hover:underline">
              Quitar
            </button>
          )}
        </div>
      </div>
    </Labeled>
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
