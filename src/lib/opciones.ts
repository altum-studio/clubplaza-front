// lib/opciones.ts
// Listas predefinidas (tipos de beneficio, períodos de límite, días, rubros)
// y helpers de etiqueta para mostrar los campos del modelo nuevo.

import type { ApiPromo, Categoria, HorarioDia, LimitePeriodo, TipoBeneficio } from '@/types';
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
  { value: '5x4', label: '5x4', usaValor: false },
  { value: '7x6', label: '7x6', usaValor: false },
  { value: '12x10', label: '12x10', usaValor: false },
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
      return `$${valor}`;
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

type PromoVigencia = Pick<ApiPromo, 'vigencia_desde' | 'vigencia_hasta' | 'fecha_inicio' | 'fecha_fin'>;

// Rango de vigencia de una promo como 'YYYY-MM-DD' ('' = sin ese límite).
// Cae a los campos viejos (fecha_inicio/fecha_fin) si los nuevos no vienen.
export function rangoVigencia(p: PromoVigencia): { desde: string; hasta: string } {
  return {
    desde: (p.vigencia_desde ?? p.fecha_inicio ?? '').slice(0, 10),
    hasta: (p.vigencia_hasta ?? p.fecha_fin ?? '').slice(0, 10),
  };
}

// ¿La promo está vigente el día `hoy` ('YYYY-MM-DD')? El centinela 2099 de
// "sin vencimiento" queda vigente solo con la comparación, sin caso especial.
export function promoVigente(p: PromoVigencia, hoy: string): boolean {
  const { desde, hasta } = rangoVigencia(p);
  return (!desde || desde <= hoy) && (!hasta || hoy <= hasta);
}

// ¿La promo ya venció antes de `hoy`?
export function promoVencida(p: PromoVigencia, hoy: string): boolean {
  const { hasta } = rangoVigencia(p);
  return !!hasta && hasta < hoy;
}

// Días válidos normalizados a number[] 0–6 (la API puede mandar array o CSV "1,2,3").
export function normalizarDias(dias: unknown): number[] {
  const arr = Array.isArray(dias) ? dias : typeof dias === 'string' ? dias.split(',') : [];
  return arr.map((d) => Number(String(d).trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

type PromoEstado = PromoVigencia & Pick<ApiPromo, 'activa' | 'dias'>;

// ── Definiciones canónicas (valen para admin y local) ──
// VIGENTE: activa, dentro de la vigencia y hoy es un día válido.
export function promoVigenteHoy(p: PromoEstado, hoy: string, diaSemana: number): boolean {
  if (!p.activa || !promoVigente(p, hoy)) return false;
  const dias = normalizarDias(p.dias);
  return dias.length === 0 || dias.includes(diaSemana);
}

// PUBLICADA: activa y todavía no vencida (vigente hoy o algún día de la semana).
export function promoPublicada(p: PromoEstado, hoy: string): boolean {
  return p.activa && !promoVencida(p, hoy);
}

// Estado para listados. Prioridad: pausado > vencido > programado > activo.
export type EstadoPromo = 'activo' | 'pausado' | 'vencido' | 'programado';
export function estadoPromo(p: PromoEstado, hoy: string): EstadoPromo {
  if (!p.activa) return 'pausado';
  if (promoVencida(p, hoy)) return 'vencido';
  const { desde } = rangoVigencia(p);
  if (desde && desde > hoy) return 'programado';
  return 'activo';
}
export const ESTADO_PROMO_LABEL: Record<EstadoPromo, string> = {
  activo: 'Activo',
  pausado: 'Pausado',
  vencido: 'Vencido',
  programado: 'Programado',
};

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
