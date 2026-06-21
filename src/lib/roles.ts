// lib/roles.ts
// Helpers de rol y la pantalla "home" de cada rol tras iniciar sesión.

import type { Role } from '@/types';

export function homeForRole(role: Role | null | undefined): string {
  if (role === 'admin') return '/admin';
  if (role === 'local') return '/panel';
  return '/beneficios';
}

export const ROLE_LABEL: Record<Role, string> = {
  comun: 'Socio',
  local: 'Comercio',
  admin: 'Administrador',
};
