// pages/TermsPage.tsx
// Página /terminos (documento legal completo). El registro abre el mismo
// contenido en un popup (TermsModal); esta ruta queda por si se accede directo.

import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TermsContent } from '@/components/legal/TermsContent';

export default function TermsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/registro');
  };

  return (
    <div className="min-h-dvh w-full bg-white text-ink">
      <header className="sticky top-0 z-10 border-b border-line-soft bg-white/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button
            type="button"
            aria-label="Volver"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-graytext hover:bg-fill"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[15px] font-extrabold">Términos y Privacidad</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-16 pt-4">
        <TermsContent />
      </main>
    </div>
  );
}
