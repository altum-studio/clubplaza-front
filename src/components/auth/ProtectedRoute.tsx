// components/auth/ProtectedRoute.tsx
// Si no hay sesión activa → redirige a /registro.
// Esta lógica NO cambia cuando se conecte el backend real (solo cambia de dónde
// sale `isAuthenticated`, que ya vive en el AuthContext).

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Evita un parpadeo de redirección mientras se rehidrata la sesión.
    return (
      <div className="flex h-full w-full items-center justify-center bg-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/registro" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
