// components/ui/PreviewBanner.tsx
// Barra de "vista previa" que aparece arriba de la app de miembro SOLO cuando el
// usuario logueado es admin o local. Les permite recorrer la app como la ve un
// miembro y volver a su panel. Para rol "comun" (o sin sesión) no renderiza nada.

import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { homeForRole } from '@/lib/roles';

export function PreviewBanner() {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (role !== 'admin' && role !== 'local') return null;

  return (
    <div className="flex w-full flex-shrink-0 items-center justify-between gap-2 bg-brand-dark px-4 pb-2 pt-[max(env(safe-area-inset-top),8px)] text-white">
      <span className="flex items-center gap-1.5 text-[11.5px] font-semibold">
        <Eye size={13} />
        Vista de miembro · preview
      </span>
      <button
        type="button"
        onClick={() => navigate(homeForRole(role))}
        className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-bold transition-colors hover:bg-white/25"
      >
        Volver al panel
      </button>
    </div>
  );
}
