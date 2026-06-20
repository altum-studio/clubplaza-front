// components/credential/CredentialOverlay.tsx
// Credencial como hoja que SUBE desde abajo. Se abre con el icono de QR y al
// cerrar (chevron/grabber) baja de nuevo, dejándote en la sección donde estabas.
// Se reutiliza en el home y en el detalle de cada beneficio.

import { ChevronDown } from 'lucide-react';
import { STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
import { CredentialContent, CRED_GRADIENT } from './CredentialContent';

export function CredentialOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={`absolute inset-0 z-50 flex flex-col px-[22px] pb-[max(env(safe-area-inset-bottom),22px)] text-white transition-transform duration-300 ease-out ${
        open ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{ background: CRED_GRADIENT }}
    >
      {/* Encabezado: cerrar (chevron + grabber) + logo */}
      <div className={`${STATUS_PAD} flex flex-col items-center pb-6`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar credencial"
          className="mb-3 flex flex-col items-center gap-1 text-white/75 hover:text-white"
        >
          <ChevronDown size={18} />
          <span className="block h-1 w-9 rounded-full bg-white/40" />
        </button>
        <Logo size={19} onGreen iso={false} />
      </div>

      <CredentialContent />
    </div>
  );
}
