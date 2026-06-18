// components/credential/CredentialSheet.tsx
// Panel verde único que vive arriba del home: colapsado es el "header" (saludo +
// CLUBPLAZA + barra); al arrastrar la barra hacia abajo crece y revela la
// credencial (QR + código). Es el MISMO elemento, solo cambia su altura.

import { ChevronDown, ChevronUp } from 'lucide-react';
import { STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
import { useSocio } from '@/hooks/useSocio';
import { CredentialContent, CRED_GRADIENT } from './CredentialContent';
import type { DragSheet } from '@/hooks/useDragSheet';

export function CredentialSheet({ sheet }: { sheet: DragSheet }) {
  const { socio } = useSocio();
  const primerNombre = socio?.nombre?.trim().split(/\s+/)[0] ?? '';

  return (
    <div
      ref={sheet.panelRef}
      style={{ ...sheet.style, background: CRED_GRADIENT }}
      className="absolute inset-x-0 top-0 z-50 overflow-hidden rounded-b-[26px] text-white"
    >
      {/* Contenido a altura completa; el panel lo recorta según su alto animado */}
      <div
        className="flex flex-col px-[22px] pb-[max(env(safe-area-inset-bottom),22px)]"
        style={{ height: sheet.fullH || undefined }}
      >
        {/* Encabezado = vista colapsada (saludo). pb deja lugar a la barra. */}
        <div ref={sheet.headerRef} className={`${STATUS_PAD} pb-10`}>
          <p className="mb-1 text-[15px] font-semibold text-white">
            Hola de nuevo{primerNombre ? `, ${primerNombre}` : ''}
          </p>
          <Logo size={19} onGreen iso={false} />
        </div>

        {/* Credencial (se revela al expandir) */}
        <CredentialContent />
      </div>

      {/* Barra: borde inferior del panel (se arrastra para abrir/cerrar, o tap) */}
      <button
        type="button"
        {...sheet.handleProps}
        onClick={sheet.toggle}
        aria-label={sheet.open ? 'Cerrar credencial' : 'Bajar mi credencial'}
        className="absolute inset-x-0 bottom-0 flex touch-none flex-col items-center gap-0.5 pb-2 pt-1 text-white/75 hover:text-white"
      >
        {sheet.open ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} className="animate-bounce" />
        )}
        <span className="block h-1 w-9 rounded-full bg-white/50" />
      </button>
    </div>
  );
}
