import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convierte una fecha DD/MM/AAAA a ISO (YYYY-MM-DD). Devuelve '' si no parsea. */
export function ddmmaaaaToISO(value: string): string {
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return ""
  const [, dd, mm, yyyy] = m
  return `${yyyy}-${mm}-${dd}`
}

/** Formatea una fecha ISO a DD/MM/AAAA para mostrar. */
export function isoToDDMMAAAA(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  const [, yyyy, mm, dd] = m
  return `${dd}/${mm}/${yyyy}`
}

/** ¿La fecha de hoy cae dentro del rango [desde, hasta] (ISO)? */
export function vigenteHoy(desde: string, hasta: string, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10)
  return desde <= today && today <= hasta
}
