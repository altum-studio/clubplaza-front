// lib/opciones.ts
// Listas predefinidas (tipos de beneficio, períodos de límite, días, rubros)
// y helpers de etiqueta para mostrar los campos del modelo nuevo.

import type { Categoria, HorarioDia, LimitePeriodo, TipoBeneficio } from '@/types';
import { CATEGORIA_LABEL } from '@/lib/categorias';
import { isoToDDMMAAAA } from '@/lib/utils';

// Rubros (las 6 opciones, sin "todos").
export const RUBRO_OPTIONS: { value: Categoria; label: string }[] = (
  Object.keys(CATEGORIA_LABEL) as Categoria[]
).map((value) => ({ value, label: CATEGORIA_LABEL[value] }));

// Tipos de beneficio. `usaValor` indica si el tipo lleva un valor numérico.
export const TIPO_BENEFICIO: { value: TipoBeneficio; label: string; usaValor: boolean }[] = [
  { value: '2x1', label: '2x1', usaValor: false },
  { value: '3x2', label: '3x2', usaValor: false },
  { value: 'descuento', label: 'Descuento %', usaValor: true },
  { value: 'descuento_fijo', label: 'Descuento $', usaValor: true },
  { value: 'cuotas', label: 'Cuotas sin interés', usaValor: true },
  { value: 'combo', label: 'Combo / precio fijo', usaValor: true },
  { value: 'regalo', label: 'Regalo / 2ª gratis', usaValor: false },
  { value: 'envio_gratis', label: 'Envío gratis', usaValor: false },
  { value: 'bonificacion', label: 'Bonificación', usaValor: true },
];

export const LIMITE_PERIODO: { value: LimitePeriodo; label: string }[] = [
  { value: 'ilimitado', label: 'Sin límite' },
  { value: 'dia', label: 'Por día' },
  { value: 'semana', label: 'Por semana' },
  { value: 'mes', label: 'Por mes' },
  { value: 'vigencia', label: 'En toda la vigencia' },
];

// Días de la semana (value 0=Dom … 6=Sáb). `orden` muestra Lun→Dom.
export const DIAS_SEMANA: { value: number; label: string; corto: string }[] = [
  { value: 0, label: 'Domingo', corto: 'Dom' },
  { value: 1, label: 'Lunes', corto: 'Lun' },
  { value: 2, label: 'Martes', corto: 'Mar' },
  { value: 3, label: 'Miércoles', corto: 'Mié' },
  { value: 4, label: 'Jueves', corto: 'Jue' },
  { value: 5, label: 'Viernes', corto: 'Vie' },
  { value: 6, label: 'Sábado', corto: 'Sáb' },
];
export const DIAS_ORDEN = [1, 2, 3, 4, 5, 6, 0];

// Horario por defecto: Lun a Sáb 10–21, domingo cerrado.
export const DEFAULT_HORARIOS: HorarioDia[] = DIAS_SEMANA.map((d) => ({
  dia: d.value,
  cerrado: d.value === 0,
  rangos: d.value === 0 ? [] : [['10:00', '21:00']],
}));

// ─────────────────────────── helpers de etiqueta ───────────────────────────

export function tipoBeneficioLabel(tipo?: TipoBeneficio | null): string {
  return TIPO_BENEFICIO.find((t) => t.value === tipo)?.label ?? '';
}

export function valorLabel(tipo?: TipoBeneficio | null, valor?: number | null): string {
  if (valor == null) return tipoBeneficioLabel(tipo);
  switch (tipo) {
    case 'descuento':
      return `${valor}% OFF`;
    case 'descuento_fijo':
      return `$${valor} OFF`;
    case 'cuotas':
      return `${valor} cuotas sin interés`;
    case 'combo':
      return `$${valor}`;
    default:
      return String(valor);
  }
}

export function limiteLabel(cantidad?: number | null, periodo?: LimitePeriodo | null): string {
  if (!cantidad || !periodo || periodo === 'ilimitado') return 'Sin límite de uso';
  const uso = cantidad === 1 ? '1 uso' : `${cantidad} usos`;
  const por: Record<Exclude<LimitePeriodo, 'ilimitado'>, string> = {
    dia: 'por día',
    semana: 'por semana',
    mes: 'por mes',
    vigencia: 'en toda la vigencia',
  };
  return `${uso} ${por[periodo]}`;
}

const SORTED = (a: number[]) => [...a].sort((x, y) => x - y).join(',');
export function diasLabel(dias?: number[] | null): string {
  if (!dias || dias.length === 0) return '—';
  if (dias.length === 7) return 'Todos los días';
  const k = SORTED(dias);
  if (k === SORTED([1, 2, 3, 4, 5])) return 'Lun a Vie';
  if (k === SORTED([1, 2, 3, 4, 5, 6])) return 'Lun a Sáb';
  if (k === SORTED([0, 6])) return 'Fines de semana';
  return DIAS_ORDEN.filter((d) => dias.includes(d))
    .map((d) => DIAS_SEMANA[d].corto)
    .join(' · ');
}

// Vigencia: indefinida o rango de fechas (acepta ISO o ya formateado).
// El backend exige vigencia_desde/hasta siempre, así que "sin vencimiento" se
// representa con una fecha centinela bien lejana. Cualquier hasta de 2099 en
// adelante se considera indefinido (tanto al mostrar como al re-editar).
export const VIGENCIA_INDEF_HASTA = '2099-12-31';
export function esVigenciaIndefinida(hasta?: string | null): boolean {
  return !hasta || hasta >= '2099-01-01';
}

export function vigenciaLabel(opts: {
  indefinida?: boolean;
  desde?: string | null;
  hasta?: string | null;
}): string {
  if (opts.indefinida || (!opts.desde && !opts.hasta) || esVigenciaIndefinida(opts.hasta))
    return 'Sin vencimiento (indefinido)';
  const d = opts.desde ? isoToDDMMAAAA(opts.desde) : '—';
  const h = opts.hasta ? isoToDDMMAAAA(opts.hasta) : '—';
  return `Del ${d} al ${h}`;
}

// Resumen de horarios por día (para la pantalla del local).
export function rangosLabel(h: HorarioDia): string {
  if (h.cerrado || h.rangos.length === 0) return 'Cerrado';
  return h.rangos.map(([a, b]) => `${a}–${b}`).join(' · ');
}
