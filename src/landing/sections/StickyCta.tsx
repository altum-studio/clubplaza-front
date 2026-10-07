// landing/sections/StickyCta.tsx
// Barra fija con el botón principal, solo en el celular. Aparece cuando el botón
// de la portada sale de pantalla y se esconde al llegar al cierre (que ya tiene
// su propio botón), así nunca hay dos iguales a la vista.

import { cn } from '@/lib/utils';
import { CtaButton } from '../components/CtaButton';

export function StickyCta({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 shadow-[0_-8px_24px_rgba(20,40,25,0.08)] backdrop-blur transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
    >
      <CtaButton ubicacion="sticky" tone="green" tabIndex={visible ? undefined : -1} />
    </div>
  );
}
