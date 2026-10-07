// landing/components/CtaButton.tsx
// Botón principal "Quiero mi credencial": lleva al registro de la app con los
// parámetros de campaña y registra el toque. `ubicacion` identifica cuál de los
// botones de la página se tocó (hero, sticky, final…).

import type { ReactNode, Ref } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackCtaClick } from '../track';
import { urlRegistro } from '../links';

interface CtaButtonProps {
  ubicacion: string;
  /** white: sobre verde · green: sobre claro. */
  tone?: 'white' | 'green';
  size?: 'lg' | 'sm';
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLAnchorElement>;
  tabIndex?: number;
}

export function CtaButton({
  ubicacion,
  tone = 'white',
  size = 'lg',
  children = 'Quiero mi credencial gratis',
  className,
  ref,
  tabIndex,
}: CtaButtonProps) {
  return (
    <a
      ref={ref}
      href={urlRegistro()}
      tabIndex={tabIndex}
      onClick={() => trackCtaClick(ubicacion)}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-[0.2px] transition',
        'active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2',
        size === 'lg' ? 'h-[54px] w-full px-6 text-[15.5px] md:w-auto md:px-8' : 'h-10 px-4 text-[13.5px]',
        tone === 'white'
          ? 'bg-white text-brand shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:bg-[#F2F6F3] focus-visible:outline-white'
          : 'bg-brand text-white hover:bg-[#1F6834] focus-visible:outline-brand',
        className,
      )}
    >
      {children}
      {size === 'lg' && <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />}
    </a>
  );
}
