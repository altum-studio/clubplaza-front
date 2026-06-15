// components/ui/app-button.tsx
// Botón del flujo de socio (ClubPlaza). Variantes y medidas tomadas del wireflow:
// primary verde, dark verde oscuro, outline, ghost y wa (WhatsApp).
// Nota: convive con el Button de shadcn (components/ui/button.tsx); este es el de
// la marca/wireflow. Se mantiene aparte para no perder el look del wireframe.

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'wa';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Ancho completo (default true, como en el wireflow). */
  full?: boolean;
  /** Tamaño chico (alto 34px). */
  sm?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white border-transparent hover:bg-[#1f6834] active:bg-[#1c5d2e]',
  dark: 'bg-brand-dark text-white border-transparent hover:bg-[#143f22]',
  outline: 'bg-transparent text-brand border-[1.5px] border-brand hover:bg-brand/5',
  ghost: 'bg-fill text-graytext border-transparent hover:bg-fill-deep',
  wa: 'bg-wa text-[#0b3d1f] border-transparent hover:brightness-95',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', full = true, sm = false, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-semibold tracking-[0.2px]',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        sm ? 'h-[34px] px-4 text-xs' : 'h-12 text-sm',
        full ? 'w-full px-0' : 'px-[18px]',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
});
