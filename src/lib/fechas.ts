// lib/fechas.ts
// Fechas en el huso del negocio (Green Plaza, Argentina). Los timestamps de la
// API vienen en UTC: acá se convierten a America/Argentina/Buenos_Aires antes
// de agrupar ("¿qué día/mes es esto?") o de formatear. Las fechas "solas"
// (YYYY-MM-DD, sin hora) se tratan como días de calendario, sin huso.

export const TZ_AR = 'America/Argentina/Buenos_Aires';

const PARTES_YMD = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ_AR,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 'YYYY-MM-DD' de un instante, en hora Argentina. Default: ahora. */
export function fechaAR(d: Date | string | number = new Date()): string {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const p: Record<string, string> = {};
  for (const part of PARTES_YMD.formatToParts(date)) p[part.type] = part.value;
  return `${p.year}-${p.month}-${p.day}`;
}

/** Hoy en Argentina, 'YYYY-MM-DD'. */
export const hoyAR = () => fechaAR();

/** 'YYYY-MM' de un instante en hora Argentina. Default: ahora. */
export const mesAR = (d?: Date | string | number) => fechaAR(d).slice(0, 7);

/** Día de la semana (0=Dom … 6=Sáb) de un 'YYYY-MM-DD' (día de calendario). */
export function diaSemanaDe(ymd: string): number {
  return new Date(`${ymd.slice(0, 10)}T00:00:00Z`).getUTCDay();
}

/** Día de la semana de HOY en Argentina (0=Dom … 6=Sáb). */
export const diaSemanaAR = () => diaSemanaDe(hoyAR());

/** Suma `n` días (puede ser negativo) a un 'YYYY-MM-DD'. */
export function sumarDias(ymd: string, n: number): string {
  const d = new Date(`${ymd.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 'DD/MM' de un 'YYYY-MM-DD'. */
export function ddmm(ymd: string): string {
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
}

/** Formatea un timestamp ISO (UTC) en hora Argentina, estilo es-AR. */
export function formatoAR(iso: string, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('es-AR', { timeZone: TZ_AR, ...opts });
}
