// pages/CredentialPage.tsx
// Ruta /credencial (acceso directo por URL). En el home y en los beneficios la
// credencial sube desde abajo (CredentialOverlay); acá se muestra a pantalla completa.

import { useNavigate } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { CredentialContent, CRED_GRADIENT } from '@/components/credential/CredentialContent';
import { useVerticalSwipe } from '@/hooks/useVerticalSwipe';

export default function CredentialPage() {
  const navigate = useNavigate();
  const swipe = useVerticalSwipe({ onSwipeUp: () => navigate('/beneficios') });

  return (
    <AppCanvas dark bg="#17502a">
      <div
        {...swipe}
        className={`${STATUS_PAD} flex flex-1 flex-col px-[22px] pb-[max(env(safe-area-inset-bottom),30px)]`}
        style={{ background: CRED_GRADIENT }}
      >
        <CredentialContent />

        <button
          type="button"
          onClick={() => navigate('/beneficios')}
          aria-label="Volver al inicio"
          className="mx-auto flex flex-col items-center gap-1 text-white/75 hover:text-white"
        >
          <ChevronUp size={18} className="animate-bounce" />
          <span className="block h-1 w-9 rounded-full bg-white/40" />
        </button>
      </div>
    </AppCanvas>
  );
}
