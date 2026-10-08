// lib/serieLocal.ts
// Serie diaria de canjes de UN local en un rango [desde, hasta] (YYYY-MM-DD).
// Usa /canjes/stats/mine?mes= (accesible para el rol local) en vez de
// /canjes/serie (que es de admin): pide cada mes que toca el rango y recorta.
// Devuelve un bucket por día, con 0 en los días sin canjes.

import { api } from '@/lib/api';
import { sumarDias } from '@/lib/fechas';

export async function serieLocal(
  desde: string,
  hasta: string,
  local_id?: string,
): Promise<{ fecha: string; cantidad: number }[]> {
  const meses = [...new Set([desde.slice(0, 7), hasta.slice(0, 7)])];
  const stats = await Promise.all(meses.map((mes) => api.canjes.statsMine({ local_id, mes })));
  const porDia = new Map<string, number>();
  for (const s of stats) {
    for (const d of s.serie ?? s.canjes_ultimos_7_dias ?? []) porDia.set(d.fecha.slice(0, 10), d.cantidad);
  }
  const out: { fecha: string; cantidad: number }[] = [];
  for (let f = desde; f <= hasta; f = sumarDias(f, 1)) out.push({ fecha: f, cantidad: porDia.get(f) ?? 0 });
  return out;
}
