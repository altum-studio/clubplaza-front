// components/panel/kit.tsx
// Kit de primitivas del PANEL web (Admin/Local), media fidelidad. Port del
// panel-kit.jsx de las referencias a React + Tailwind, usando los tokens de
// marca (brand, ink, graytext, line, fill, warn/info/bad…).
//
// Métricas: si METRICS_SOON es true, las primitivas de métrica (Stat, charts)
// se muestran en gris con sello "Próximamente" (decisión de producto: en la
// primera entrega las métricas son simulación, no datos reales).

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

// TODO BACKEND: cuando existan métricas reales, apagar este flag (o leerlo de
// una feature flag remota) para mostrar números en lugar de "Próximamente".
export const METRICS_SOON = true;

const BRAND = '#23753a';

// ─────────────────────────── botones ───────────────────────────
type PBtnVariant = 'primary' | 'dark' | 'outline' | 'soft' | 'ghost' | 'wa' | 'danger';
const PBTN_VARIANT: Record<PBtnVariant, string> = {
  primary: 'bg-brand text-white hover:bg-[#1f6834]',
  dark: 'bg-brand-dark text-white hover:bg-[#143f22]',
  outline: 'bg-white text-ink border border-line hover:bg-fill',
  soft: 'bg-fill text-graytext hover:bg-fill-deep',
  ghost: 'bg-transparent text-graytext hover:bg-fill',
  wa: 'bg-wa text-white hover:brightness-95',
  danger: 'bg-transparent text-bad border border-bad-soft hover:bg-bad-soft',
};
const PBTN_SIZE = {
  sm: 'h-8 px-3 text-[12.5px] rounded-lg',
  md: 'h-[38px] px-4 text-[13.5px] rounded-[9px]',
  lg: 'h-[46px] px-[22px] text-[15px] rounded-[10px]',
};
export function PButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  full = false,
  className,
  onClick,
}: {
  children?: ReactNode;
  variant?: PBtnVariant;
  size?: keyof typeof PBTN_SIZE;
  icon?: IconName;
  full?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-[7px] whitespace-nowrap font-semibold tracking-[0.1px] transition-colors',
        PBTN_SIZE[size],
        PBTN_VARIANT[variant],
        full && 'w-full',
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} strokeWidth={2} />}
      {children}
    </button>
  );
}

// ─────────────────────────── badges / chips ───────────────────────────
type Tone = 'ok' | 'warn' | 'info' | 'bad' | 'mute';
const TONE: Record<Tone, string> = {
  ok: 'bg-brand-soft text-brand',
  warn: 'bg-warn-soft text-warn',
  info: 'bg-info-soft text-info',
  bad: 'bg-bad-soft text-bad',
  mute: 'bg-fill text-graytext',
};
export function Badge({
  children,
  tone = 'ok',
  dot = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full text-[11.5px] font-bold tracking-[0.2px]',
        dot ? 'py-1 pl-2 pr-2.5' : 'px-2.5 py-1',
        TONE[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function PChip({
  children,
  active = false,
  icon,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  icon?: IconName;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-[7px] whitespace-nowrap rounded-lg px-[13px] py-[7px] text-[12.5px] transition-colors',
        active
          ? 'bg-brand font-semibold text-white'
          : 'border border-line bg-white font-medium text-graytext hover:bg-fill',
        className,
      )}
    >
      {icon && <Icon name={icon} size={15} className={active ? 'text-white' : 'text-graytext'} />}
      {children}
    </button>
  );
}

// ─────────────────────────── card contenedor ───────────────────────────
export function PCard({
  title,
  sub,
  actions,
  pad = 18,
  children,
  className,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  pad?: number;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_1px_2px_rgba(20,40,25,0.04)]',
        className,
      )}
    >
      {(title || actions) && (
        <div
          className={cn(
            'flex items-center justify-between px-[18px] py-[14px]',
            children && 'border-b border-line-soft',
          )}
        >
          <div>
            {title && <div className="text-[14.5px] font-bold text-ink">{title}</div>}
            {sub && <div className="mt-0.5 text-xs text-mute">{sub}</div>}
          </div>
          {actions}
        </div>
      )}
      {children && <div style={{ padding: pad }}>{children}</div>}
    </div>
  );
}

// ─────────────────────────── estado "Próximamente" ───────────────────────────
export function SoonTag({ small = false }: { small?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] rounded-full bg-fill font-bold tracking-[0.2px] text-mute',
        small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-[3px] text-[11px]',
      )}
    >
      <Icon name="clock" size={small ? 11 : 12} className="text-mute" />
      Próximamente
    </span>
  );
}

export function SoonBox({ h = 150, label = 'Próximamente' }: { h?: number; label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-[10px] border border-dashed border-line"
      style={{
        height: h,
        background:
          'repeating-linear-gradient(45deg, #e8ece8 0 1px, transparent 1px 9px), #f4f6f4',
      }}
    >
      <Icon name="clock" size={16} className="text-faint" />
      <span className="text-xs font-bold text-mute">{label}</span>
    </div>
  );
}

// ─────────────────────────── KPI / stat card ───────────────────────────
export function Stat({
  label,
  value,
  unit,
  delta,
  trend = 'up',
  icon,
  spark,
  live = false,
}: {
  label: string;
  value?: ReactNode;
  unit?: string;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: IconName;
  spark?: number[];
  // `live`: dato REAL del backend (totales de la API) → se muestra aunque
  // METRICS_SOON esté activo (que sólo afecta a las métricas simuladas).
  live?: boolean;
}) {
  if (METRICS_SOON && !live) {
    return (
      <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-white p-4 shadow-[0_1px_2px_rgba(20,40,25,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-mute">{label}</span>
          {icon && (
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-fill">
              <Icon name={icon} size={17} className="text-faint" />
            </span>
          )}
        </div>
        <div className="h-[22px] w-[58px] rounded-[7px] bg-fill" />
        <SoonTag />
      </div>
    );
  }
  const dColor = trend === 'up' ? 'text-brand' : trend === 'down' ? 'text-bad' : 'text-mute';
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-white p-4 shadow-[0_1px_2px_rgba(20,40,25,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-graytext">{label}</span>
        {icon && (
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-brand-soft">
            <Icon name={icon} size={17} className="text-brand" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[30px] font-extrabold tracking-[-0.5px] text-ink">{value}</span>
        {unit && <span className="text-sm font-semibold text-mute">{unit}</span>}
      </div>
      {(delta || spark) && (
        <div className="flex items-center justify-between">
          {delta && (
            <div className={cn('flex items-center gap-0.5', dColor)}>
              <Icon name={trend === 'down' ? 'down' : 'up'} size={14} strokeWidth={2.2} />
              <span className="text-xs font-bold">{delta}</span>
              <span className="text-[11px] font-medium text-mute">vs. sem. ant.</span>
            </div>
          )}
          {spark && <Spark data={spark} />}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── charts (SVG/CSS simples) ───────────────────────────
export function Spark({ data, color = BRAND, w = 64, h = 22 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (METRICS_SOON) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 3) - 1.5}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bars({
  data,
  labels,
  h = 150,
  highlight,
}: {
  data: number[];
  labels?: string[];
  h?: number;
  highlight?: number;
}) {
  if (METRICS_SOON) return <SoonBox h={h} />;
  const max = Math.max(...data) || 1;
  return (
    <div className="flex items-end gap-2.5 px-0.5" style={{ height: h }}>
      {data.map((v, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-[6px]"
              style={{
                height: `${(v / max) * 100}%`,
                minHeight: 4,
                background: highlight === i ? BRAND : 'rgba(35,117,58,0.22)',
              }}
            />
          </div>
          {labels && (
            <span className={cn('text-[11px]', highlight === i ? 'font-bold text-ink' : 'font-medium text-mute')}>
              {labels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Area({ data, color = BRAND, h = 160 }: { data: number[]; color?: string; h?: number }) {
  const gid = useId().replace(/:/g, '');
  if (METRICS_SOON) return <SoonBox h={h} />;
  const w = 520;
  const max = Math.max(...data);
  const min = Math.min(...data) * 0.96;
  const rng = max - min || 1;
  const X = (i: number) => (i / (data.length - 1)) * w;
  const Y = (v: number) => h - ((v - min) / rng) * (h - 16) - 8;
  const line = data.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block w-full" style={{ height: h }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="#eef1ee" strokeWidth="1" />
      ))}
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={X(data.length - 1)} cy={Y(data[data.length - 1])} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function Donut({
  value = 72,
  size = 110,
  color = BRAND,
  label,
  sub,
}: {
  value?: number;
  size?: number;
  color?: string;
  label?: string;
  sub?: string;
}) {
  if (METRICS_SOON) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-1 rounded-full border-8 border-fill"
        style={{ width: size, height: size }}
      >
        <Icon name="clock" size={size * 0.2} className="text-faint" />
        <span className="font-bold text-mute" style={{ fontSize: size * 0.1 }}>
          Próximamente
        </span>
      </div>
    );
  }
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="rounded-full"
        style={{ width: size, height: size, background: `conic-gradient(${color} ${value * 3.6}deg, #dde4df 0)` }}
      />
      <div
        className="absolute flex flex-col items-center justify-center rounded-full bg-white"
        style={{ inset: size * 0.16 }}
      >
        <span className="font-extrabold text-ink" style={{ fontSize: size * 0.24 }}>
          {label ?? `${value}%`}
        </span>
        {sub && (
          <span className="font-semibold text-mute" style={{ fontSize: size * 0.1 }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────── tabla ───────────────────────────
export interface Column<R> {
  key: string;
  label: string;
  w?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  muted?: boolean;
  mono?: boolean;
  render?: (value: any, row: R) => ReactNode;
}
export function Table<R extends Record<string, any>>({
  columns,
  rows,
  dense = false,
}: {
  columns: Column<R>[];
  rows: R[];
  dense?: boolean;
}) {
  return (
    <div className="w-full overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.w, textAlign: c.align || 'left' }}
                className="border-b border-line bg-fill px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.4px] text-mute"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{ textAlign: c.align || 'left' }}
                  className={cn(
                    'truncate border-b border-line-soft align-middle text-[13px]',
                    dense ? 'px-[14px] py-2.5' : 'px-4 py-[13px]',
                    c.bold ? 'font-bold' : 'font-medium',
                    c.muted ? 'text-graytext' : 'text-ink',
                    c.mono && 'font-mono',
                  )}
                >
                  {c.render ? c.render(r[c.key], r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────── avatar / placeholders ───────────────────────────
const AV_TONE = {
  green: 'bg-brand-soft text-brand',
  info: 'bg-info-soft text-info',
  warn: 'bg-warn-soft text-warn',
  mute: 'bg-fill text-graytext',
};
export function Avatar({
  name = 'NN',
  size = 34,
  tone = 'green',
}: {
  name?: string;
  size?: number;
  tone?: keyof typeof AV_TONE;
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className={cn('flex flex-shrink-0 items-center justify-center rounded-full font-bold', AV_TONE[tone])}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// Placeholder de logo de comercio (se reemplaza por el asset real del local).
export function LogoBox({ size = 40, r = 9, className }: { size?: number; r?: number; className?: string }) {
  return (
    <div
      className={cn('flex flex-shrink-0 items-center justify-center border border-dashed border-line', className)}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: 'repeating-linear-gradient(45deg, rgba(35,117,58,0.10) 0 1px, transparent 1px 8px), #f4f6f4',
      }}
    />
  );
}

// Imagen placeholder ancha (banner de beneficio, visor, etc.).
export function ImagePh({
  h = 120,
  r = 12,
  label = 'imagen',
  dark = false,
  className,
}: {
  h?: number;
  r?: number;
  label?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center justify-center border border-dashed', dark ? 'border-white/25' : 'border-line', className)}
      style={{
        height: h,
        borderRadius: r,
        background: dark
          ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 10px), rgba(255,255,255,0.06)'
          : 'repeating-linear-gradient(45deg, rgba(35,117,58,0.10) 0 1px, transparent 1px 10px), #f4f6f4',
      }}
    >
      {label && (
        <span className={cn('font-mono text-[10px]', dark ? 'text-white/60' : 'text-faint')}>{label}</span>
      )}
    </div>
  );
}

// ─────────────────────────── form fields ───────────────────────────
export function Field({
  label,
  placeholder,
  value,
  icon,
  area = false,
  className,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  icon?: IconName;
  area?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      {label && <div className="mb-1.5 text-xs font-semibold text-graytext">{label}</div>}
      <div
        className={cn(
          'flex gap-[9px] rounded-[10px] border border-line bg-white px-[13px]',
          area ? 'min-h-[80px] items-start py-3' : 'h-[42px] items-center',
        )}
      >
        {icon && <Icon name={icon} size={17} className="text-mute" />}
        <span className={cn('text-[13.5px]', value ? 'font-medium text-ink' : 'text-faint')}>
          {value || placeholder}
        </span>
      </div>
    </div>
  );
}

export function Search({ placeholder = 'Buscar…', w = 260 }: { placeholder?: string; w?: number }) {
  return (
    <div
      className="flex h-[38px] items-center gap-2 rounded-[9px] border border-line bg-white px-3"
      style={{ width: w, maxWidth: '100%' }}
    >
      <Icon name="search" size={16} className="text-mute" />
      <span className="text-[13px] text-faint">{placeholder}</span>
    </div>
  );
}

export function Toggle({ on = true }: { on?: boolean }) {
  return (
    <div
      className={cn('relative h-[22px] w-[38px] flex-shrink-0 rounded-full transition-colors', on ? 'bg-brand' : 'bg-fill-deep')}
    >
      <div
        className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-all"
        style={{ left: on ? 18 : 2 }}
      />
    </div>
  );
}
