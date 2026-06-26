// components/ui/AppCanvas.tsx
// Lienzo mobile-first de la app. En el wireflow las pantallas se mostraban dentro
// de un mockup de iPhone (chrome de demostración: status bar "9:41", isla dinámica,
// home indicator). Eso NO es UI del producto, así que no lo replicamos: en un PWA
// real correría sobre el teléfono de verdad. Sí respetamos el diseño de las pantallas.
//
// En mobile ocupa toda la ventana; en desktop se centra con un marco tipo teléfono
// (radio + sombra) para previsualizar cómodo. El padding superior respeta el notch.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PreviewBanner } from './PreviewBanner';

interface AppCanvasProps {
  children: ReactNode;
  /** Color de fondo del lienzo (default: screen). Acepta cualquier valor CSS. */
  bg?: string;
  /** Texto claro por defecto (pantallas verdes / con foto). */
  dark?: boolean;
  className?: string;
}

export function AppCanvas({ children, bg, dark = false, className }: AppCanvasProps) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden">
      {/* Barra de preview FIJA (solo admin/local viendo la app de miembro) */}
      <PreviewBanner />
      <div className="flex w-full min-h-0 flex-1 justify-center sm:py-6">
        <div
          className={cn(
            'relative flex w-full max-w-[440px] flex-col overflow-hidden',
            'h-full sm:h-[920px] sm:max-h-[calc(100dvh-3rem)]',
            'sm:rounded-[40px] sm:shadow-[0_28px_60px_rgba(0,0,0,0.18)]',
            dark ? 'text-white' : 'text-ink',
            className,
          )}
          style={{ background: bg ?? '#FBFCFB' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Padding superior que limpia el área del notch (equivalente al STATUS:60 del wireflow). */
export const STATUS_PAD = 'pt-[max(env(safe-area-inset-top),28px)]';
