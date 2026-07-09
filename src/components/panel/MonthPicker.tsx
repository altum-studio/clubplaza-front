// components/panel/MonthPicker.tsx
// Selector de mes relativo a HOY: offset 0 = mes actual, -1 = mes anterior, etc.
// No deja ir al futuro (‹ navega al pasado; › se deshabilita en el mes actual).

import { Icon } from './Icon';

const MES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Año/mes (mes 0-indexado) del mes actual desplazado `offset` meses.
function monthDate(offset: number): { year: number; month: number } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function monthLabel(offset: number): string {
  const { year, month } = monthDate(offset);
  return `${MES_NOMBRES[month]} ${year}`;
}

// 'YYYY-MM' del mes seleccionado (para pasar al backend como ?mes=).
export function monthValue(offset: number): string {
  const { year, month } = monthDate(offset);
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

// Inicial del mes de un 'YYYY-MM' (para ejes de gráficos).
export function monthInitial(ym: string): string {
  const m = ((Number(ym.slice(5, 7)) - 1) % 12 + 12) % 12;
  return MES_NOMBRES[m]?.[0] ?? '';
}

export function MonthPicker({ offset, onChange }: { offset: number; onChange: (o: number) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-1 py-0.5">
      <button
        type="button"
        onClick={() => onChange(offset - 1)}
        aria-label="Mes anterior"
        className="flex h-7 w-7 items-center justify-center rounded-md text-graytext transition-colors hover:bg-fill"
      >
        <Icon name="chevL" size={15} />
      </button>
      <span className="flex items-center gap-1.5 px-1 text-[12.5px] font-semibold text-graytext">
        <Icon name="cal" size={14} className="text-mute" />
        {monthLabel(offset)}
      </span>
      <button
        type="button"
        onClick={() => onChange(offset + 1)}
        disabled={offset >= 0}
        aria-label="Mes siguiente"
        className="flex h-7 w-7 items-center justify-center rounded-md text-graytext transition-colors hover:bg-fill disabled:opacity-30"
      >
        <Icon name="chevR" size={15} />
      </button>
    </div>
  );
}
