// components/puntos/kit.tsx
// Primitivas del sistema de puntos (dirección A: barra lineal + camino vertical).
// Referencia: "ClubPlaza Spec Sistema de Puntos". Todos los números llegan como
// placeholders (00) desde usePuntos.

import type { ReactNode } from 'react';
import { Check, ChevronRight, Store, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NivelEstado, PtCupon, PtMovimiento } from '@/hooks/usePuntos';

// Degradado obligatorio de marca (nunca verde plano).
export const PT_GRADIENT = 'linear-gradient(158deg, #23753a 0%, #17502a 100%)';

// Los números se muestran siempre con dos dígitos (00, 05, 12…).
export const pad = (n: number) => String(n).padStart(2, '0');

// ─────────────────────────── Barra de progreso ───────────────────────────
export function PtBar({
  pct = 0,
  onGreen = false,
  className,
}: {
  pct?: number;
  onGreen?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('h-[7px] w-full overflow-hidden rounded-full lg:h-[9px]', className)}
      style={{ background: onGreen ? 'rgba(255,255,255,0.20)' : '#ecf1ed' }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: onGreen ? '#ffffff' : '#23753a' }}
      />
    </div>
  );
}

// ─────────────────────────── Label de sección ───────────────────────────
export function PtSection({
  label,
  action,
  onGreen = false,
  className,
}: {
  label: string;
  action?: ReactNode;
  onGreen?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span
        className="text-[11px] font-extrabold uppercase tracking-[1.2px]"
        style={{ color: onGreen ? '#5ca872' : '#474c54' }}
      >
        {label}
      </span>
      {action}
    </div>
  );
}

// ─────────────────────────── Cupón de beneficio ───────────────────────────
// Tarjeta del beneficio exclusivo de un nivel. `activo` → tocable (abre pop-up);
// `usado` → apagado.
export function PtCoupon({ cupon, onOpen }: { cupon: PtCupon; onOpen?: () => void }) {
  const activo = cupon.estado === 'activo';
  return (
    <button
      type="button"
      disabled={!activo}
      onClick={activo ? onOpen : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-[12px] border border-line p-3 text-left',
        activo ? 'cursor-pointer bg-fill hover:bg-fill-deep' : 'bg-fill/60',
      )}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white">
        <Ticket size={16} className={activo ? 'text-brand' : 'text-mute'} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-[12.5px] font-bold', activo ? 'text-ink' : 'text-graytext')}>
          {cupon.titulo}
        </div>
        <div className="text-[11px] text-mute">{activo ? 'Ver beneficio' : 'Ya usado'}</div>
      </div>
      {activo && <ChevronRight size={16} className="flex-shrink-0 text-mute" />}
    </button>
  );
}

// ─────────────────────────── Nodo del camino ───────────────────────────
export function PtPathNode({
  n,
  estado,
  subtitle,
  isLast = false,
  cupon,
  onOpenCupon,
}: {
  n: number;
  estado: NivelEstado;
  subtitle: string;
  isLast?: boolean;
  cupon?: PtCupon | null;
  onOpenCupon?: () => void;
}) {
  const lineColor = estado === 'done' ? '#23753a' : '#dce4dd';
  return (
    <div className="flex gap-3">
      {/* Marcador + línea vertical de conexión */}
      <div className="flex flex-col items-center">
        <Marker n={n} estado={estado} />
        {!isLast && <div className="w-[2.5px] flex-1" style={{ background: lineColor }} />}
      </div>

      {/* Contenido */}
      <div className={cn('min-w-0 flex-1', isLast ? 'pb-1' : 'pb-4')}>
        <div className="flex items-center gap-2">
          <span className={cn('text-[14.5px] text-ink', estado === 'current' ? 'font-extrabold' : 'font-bold')}>
            Nivel {n}
          </span>
          {estado === 'current' && (
            <span className="rounded-[5px] bg-brand px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.5px] text-white">
              Estás acá
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12.5px] text-graytext">{subtitle}</p>
        {cupon && <div className="mt-2.5">{<PtCoupon cupon={cupon} onOpen={onOpenCupon} />}</div>}
      </div>
    </div>
  );
}

function Marker({ n, estado }: { n: number; estado: NivelEstado }) {
  if (estado === 'done') {
    return (
      <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-brand">
        <Check size={18} className="text-white" strokeWidth={3} />
      </span>
    );
  }
  if (estado === 'current') {
    return (
      <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border-[2.5px] border-brand bg-transparent text-[13px] font-extrabold text-brand">
        {n}
      </span>
    );
  }
  return (
    <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-[#e4eae5] text-[13px] font-bold text-[#9aa39c]">
      {n}
    </span>
  );
}

// ─────────────────────────── Fila de historial ───────────────────────────
export function PtHistoryRow({ mov, last = false }: { mov: PtMovimiento; last?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 py-3', !last && 'border-b border-[#e4eae5]')}>
      <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-fill">
        <Store size={16} className="text-graytext" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-bold text-ink">{mov.titulo}</div>
        <div className="truncate text-[11.5px] text-graytext">
          {mov.local} · {mov.rubro}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-[13.5px] font-extrabold text-brand">+{pad(mov.puntos)}</div>
        <div className="text-[11px] text-[#9aa39c]">{mov.momento}</div>
      </div>
    </div>
  );
}
