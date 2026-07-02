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
  // .email() de zod es permisivo (acepta "a@b" sin dominio completo). El refine
  // extra exige usuario@dominio.tld con un TLD de al menos 2 letras (ej: .com).
  email: z
    .string()
    .min(1, 'Ingresá tu email')
    .email('Email inválido')
    .refine((v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()), {
      message: 'Email inválido (ej: nombre@correo.com)',
    }),
  // El +54 es opcional: validamos sobre los dígitos (8 a 13), aceptando
  // espacios, guiones y un prefijo internacional opcional.
  celular: z
    .string()
    .refine((v) => /^\d{8,13}$/.test(v.replace(/[\s()+-]/g, '')), {
      message: 'Celular inválido (ej: 11 1234 5678)',
    }),
  // La contraseña no se guarda en la tabla `socios`: va a supabase.auth.signUp().
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  // boolean + refine (en vez de literal(true)) para que el tipo sea `boolean`
  // y juegue bien con react-hook-form. Valida lo mismo: debe estar en true.
  terminos: z.boolean().refine((v) => v === true, {
    message: 'Debés aceptar los términos',
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

// Login de socio existente (email + contraseña). Mismo criterio de email que el alta.
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresá tu email')
    .email('Email inválido')
    .refine((v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()), {
      message: 'Email inválido (ej: nombre@correo.com)',
    }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// "Olvidé mi contraseña": solo el email (mismo criterio que login/alta).
export const forgotSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresá tu email')
    .email('Email inválido')
    .refine((v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()), {
      message: 'Email inválido (ej: nombre@correo.com)',
    }),
});

export type ForgotSchema = z.infer<typeof forgotSchema>;

// Nueva contraseña + confirmación (desde el link del email).
export const resetSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm: z.string().min(1, 'Repetí la contraseña'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

export type ResetSchema = z.infer<typeof resetSchema>;
