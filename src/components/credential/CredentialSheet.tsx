// components/credential/CredentialSheet.tsx
// Panel de la credencial que se superpone al home y se arrastra desde la barra
// (sigue el dedo). Va dentro del AppCanvas (absolute) para quedar dentro del
// marco del teléfono y recortarse cuando está cerrado.

import { ChevronUp } from 'lucide-react';
import { STATUS_PAD } from '@/components/ui/AppCanvas';
import { CredentialContent, CRED_GRADIENT } from './CredentialContent';
import type { DragSheet } from '@/hooks/useDragSheet';

export function CredentialSheet({ sheet }: { sheet: DragSheet }) {
  return (
    <div
      ref={sheet.panelRef}
      style={{ ...sheet.style, background: CRED_GRADIENT }}
      className={`${STATUS_PAD} absolute inset-0 z-50 flex flex-col px-[22px] pb-[max(env(safe-area-inset-bottom),20px)] text-white`}
      aria-hidden={!sheet.open}
    >
      <CredentialContent />

      {/* Barra para arrastrar hacia arriba y cerrar (o tap) */}
      <button
        {...sheet.handleProps}
        onClick={sheet.toggle}
        aria-label="Cerrar credencial"
        className="mx-auto mt-1 flex touch-none flex-col items-center gap-1 text-white/75 hover:text-white"
      >
        <ChevronUp size={18} />
        <span className="block h-1 w-9 rounded-full bg-white/40" />
      </button>
    </div>
  );
}
