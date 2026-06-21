// components/auth/RequireRole.tsx
// Guarda de ruta por ROL. Si no hay sesión → manda a /ingresar (guardando el
// destino). Si la sesión no tiene el rol permitido → la manda a su propia home.

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { homeForRole } from '@/lib/roles';
import type { Role } from '@/types';

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-panel">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
  }

  if (role && !roles.includes(role)) {
    // Logueado pero sin permiso para esta sección → a su panel/inicio.
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <>{children}</>;
}
