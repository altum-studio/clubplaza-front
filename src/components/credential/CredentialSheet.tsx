// components/credential/CredentialSheet.tsx
// Credencial fija que se revela desde arriba. El panel ocupa toda la pantalla
// con su contenido fijo (saludo arriba, QR centrado); con clip-path mostramos
// solo la parte de arriba (colapsado = encabezado) y revelamos el resto al
// arrastrar la barra. La barra vive pegada al borde revelado y lo sigue.

import { ChevronDown, ChevronUp } from 'lucide-react';
import { STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
import { useSocio } from '@/hooks/useSocio';
import { CredentialContent, CRED_GRADIENT } from './CredentialContent';
import type { DragSheet } from '@/hooks/useDragSheet';

export function CredentialSheet({ sheet }: { sheet: DragSheet }) {
  const { socio } = useSocio();
  const primerNombre = socio?.nombre?.trim().split(/\s+/)[0] ?? '';

  const bottomInset = Math.max(0, sheet.fullH - sheet.revealed);
  const clip = `inset(0px 0px ${bottomInset}px 0px round 0px 0px 26px 26px)`;
  const slideTransition = 'clip-path 0.34s cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <>
      {/* Panel fijo a pantalla completa, recortado por clip-path */}
      <div
        ref={sheet.panelRef}
        style={{
          background: CRED_GRADIENT,
          clipPath: clip,
          WebkitClipPath: clip,
          transition: slideTransition,
        }}
        className="absolute inset-0 z-40 flex flex-col px-[22px] pb-[max(env(safe-area-inset-bottom),22px)] text-white"
      >
        {/* Encabezado = vista colapsada (saludo) */}
        <div ref={sheet.headerRef} className={`${STATUS_PAD} pb-10`}>
          <p className="mb-1 text-[15px] font-semibold text-white">
            Hola de nuevo{primerNombre ? `, ${primerNombre}` : ''}
          </p>
          <Logo size={19} onGreen iso={false} />
        </div>

        {/* Credencial (se revela al bajar) */}
        <CredentialContent />
      </div>

      {/* Barra: tocar para bajar / subir la credencial (sin arrastre) */}
      <button
        type="button"
        onClick={sheet.toggle}
        aria-label={sheet.open ? 'Cerrar credencial' : 'Bajar mi credencial'}
        style={{ top: sheet.revealed, transition: 'top 0.34s cubic-bezier(0.22, 1, 0.36, 1)' }}
        className="absolute left-1/2 z-50 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-0.5 px-6 pb-2 text-white/75 hover:text-white"
      >
        {sheet.open ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} className="animate-bounce" />
        )}
        <span className="block h-1 w-9 rounded-full bg-white/50" />
      </button>
    </>
  );
}
