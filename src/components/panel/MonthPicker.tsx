// components/panel/MonthPicker.tsx
// Selector de mes (mensual), arranca en Junio 2026. El padre tiene el `offset`
// (0 = Junio 2026) y este componente lo navega. El ‹ se deshabilita en el inicio.

import { Icon } from './Icon';

const MES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function monthLabel(offset: number): string {
  const total = 5 + offset; // 5 = Junio (0-indexed), año base 2026
  const year = 2026 + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return `${MES_NOMBRES[m]} ${year}`;
}

export function MonthPicker({ offset, onChange }: { offset: number; onChange: (o: number) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-1 py-0.5">
      <button
        type="button"
        onClick={() => onChange(offset - 1)}
        disabled={offset <= 0}
        aria-label="Mes anterior"
        className="flex h-7 w-7 items-center justify-center rounded-md text-graytext transition-colors hover:bg-fill disabled:opacity-30"
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
        aria-label="Mes siguiente"
        className="flex h-7 w-7 items-center justify-center rounded-md text-graytext transition-colors hover:bg-fill"
      >
        <Icon name="chevR" size={15} />
      </button>
    </div>
  );
}
