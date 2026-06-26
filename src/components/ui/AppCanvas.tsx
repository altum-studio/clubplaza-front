// components/ui/AppCanvas.tsx
// Lienzo de la app del socio. Responsive:
//  - mobile: ocupa toda la ventana.
//  - tablet/desktop: una columna centrada a pantalla completa (con borde lateral),
//    sin "marco de teléfono". `wide` la ensancha en desktop para grillas
//    multi-columna (home / local); por defecto queda angosta (detalle / credencial).
// La barra superior fija (PreviewBanner) solo aparece para admin/local en preview.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PreviewBanner } from './PreviewBanner';

interface AppCanvasProps {
  children: ReactNode;
  /** Color de fondo del lienzo (default: screen). Acepta cualquier valor CSS. */
  bg?: string;
  /** Texto claro por defecto (pantallas verdes / con foto). */
  dark?: boolean;
  /** Ensancha la columna en desktop (para pantallas con grilla). */
  wide?: boolean;
  className?: string;
}

export function AppCanvas({ children, bg, dark = false, wide = false, className }: AppCanvasProps) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden">
      {/* Barra de preview FIJA (solo admin/local viendo la app de miembro) */}
      <PreviewBanner />
      <div className="flex w-full min-h-0 flex-1 justify-center">
        <div
          className={cn(
            'relative flex h-full w-full flex-col overflow-hidden border-line-soft sm:border-x',
            wide ? 'max-w-[520px] lg:max-w-[1040px]' : 'max-w-[520px]',
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
