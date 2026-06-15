// lib/schemas.ts
// Schemas de validación (zod). El de alta debe coincidir con la tabla `socios`.

import { z } from 'zod';

// Valida formato DD/MM/AAAA y que sea una fecha real y pasada.
function esFechaValida(value: string): boolean {
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const [, dd, mm, yyyy] = m.map(Number) as unknown as [string, number, number, number];
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return false;
  return d <= new Date() && yyyy >= 1900;
}

export const registerSchema = z.object({
  nombre: z.string().min(3, 'Ingresá tu nombre completo'),
  dni: z
    .string()
    .regex(/^\d{7,8}$/, 'DNI inválido (7 u 8 dígitos)'),
  fecha_nacimiento: z
    .string()
    .min(1, 'Ingresá tu fecha de nacimiento')
    .refine(esFechaValida, 'Fecha inválida (DD/MM/AAAA)'),
  email: z.string().email('Email inválido'),
  celular: z
    .string()
    .regex(/^\+54\s?9?\s?\d{2,4}\s?\d{6,8}$/, 'Celular inválido (ej: +54 9 11 1234 5678)'),
  // boolean + refine (en vez de literal(true)) para que el tipo sea `boolean`
  // y juegue bien con react-hook-form. Valida lo mismo: debe estar en true.
  terminos: z.boolean().refine((v) => v === true, {
    message: 'Debés aceptar los términos',
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
