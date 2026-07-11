// components/panel/AltasChart.tsx
// Gráfico de altas (línea + área) para el dashboard admin. Con eje Y numerado,
// tooltip al hover, scroll horizontal (paso fijo por punto cuando hay muchos) y
// que llena la caja (mide su contenedor). Datos: AltaBucket[] del backend.

import { useEffect, useRef, useState } from 'react';
import type { AltaBucket } from '@/types';

const BRAND = '#23753a';
const MES_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MES_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type Vista = 'mes' | 'semana';

function axisLabel(b: AltaBucket, vista: Vista): string {
  if (vista === 'mes') return MES_ABBR[Number(b.periodo.slice(5, 7)) - 1] ?? '';
  const d = new Date(`${b.periodo}T00:00:00`);
  return isNaN(d.getTime()) ? '' : DOW[d.getDay()];
}
function fullLabel(b: AltaBucket, vista: Vista): string {
  if (vista === 'mes') {
    return `${MES_FULL[Number(b.periodo.slice(5, 7)) - 1] ?? ''} ${b.periodo.slice(0, 4)}`;
  }
  const d = new Date(`${b.periodo}T00:00:00`);
  if (isNaN(d.getTime())) return b.periodo;
  return `${DOW[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function AltasChart({ buckets, vista }: { buckets: AltaBucket[]; vista: Vista }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 240 });
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = buckets.length;
  const padT = 14;
  const padB = 26;
  const H = Math.max(170, size.h);
  const chartH = H - padT - padB;
  const minStep = 62;
  const stepW = n > 0 ? Math.max(minStep, size.w / n) : size.w;
  const W = Math.max(size.w, n * stepW);

  const rawMax = Math.max(0, ...buckets.map((b) => b.count));
  const niceMax = Math.max(4, Math.ceil(rawMax / 4) * 4);
  const y = (v: number) => padT + chartH - (v / niceMax) * chartH;
  const x = (i: number) => stepW / 2 + i * stepW;
  const ticks = [...new Set([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f)))];

  const linePts = buckets.map((b, i) => `${x(i)},${y(b.count)}`).join(' ');
  const areaPts = n ? `${x(0)},${padT + chartH} ${linePts} ${x(n - 1)},${padT + chartH}` : '';

  return (
    <div className="flex h-full w-full" style={{ minHeight: 180 }}>
      {/* Eje Y (fijo) */}
      <div className="relative w-7 flex-shrink-0" style={{ height: H }}>
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute right-1 -translate-y-1/2 text-[10px] font-semibold text-faint"
            style={{ top: y(t) }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Área del gráfico (scroll horizontal) */}
      <div ref={ref} className="relative min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="relative" style={{ width: W, height: H }}>
          <svg width={W} height={H} className="block">
            <defs>
              <linearGradient id="altasGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity="0.18" />
                <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t) => (
              <line key={t} x1={0} x2={W} y1={y(t)} y2={y(t)} stroke="#eef1ee" strokeWidth={1} />
            ))}
            {n > 0 && (
              <>
                <polygon points={areaPts} fill="url(#altasGrad)" />
                <polyline
                  points={linePts}
                  fill="none"
                  stroke={BRAND}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {hover != null && (
                  <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + chartH} stroke={BRAND} strokeOpacity={0.2} strokeWidth={1} />
                )}
                {buckets.map((b, i) => (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={y(b.count)}
                    r={hover === i ? 4.5 : 3}
                    fill="#fff"
                    stroke={BRAND}
                    strokeWidth={2}
                  />
                ))}
                {buckets.map((b, i) => (
                  <text key={i} x={x(i)} y={H - 9} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#aeb3ae">
                    {axisLabel(b, vista)}
                  </text>
                ))}
                {/* Zonas de hover */}
                {buckets.map((_, i) => (
                  <rect
                    key={i}
                    x={i * stepW}
                    y={0}
                    width={stepW}
                    height={H}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  />
                ))}
              </>
            )}
          </svg>

          {hover != null && buckets[hover] && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-center shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
              style={{ left: x(hover), top: y(buckets[hover].count) - 10 }}
            >
              <div className="text-[14px] font-extrabold leading-none text-white">{buckets[hover].count}</div>
              <div className="mt-1 text-[10px] leading-none text-white/60">{fullLabel(buckets[hover], vista)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
