// components/ui/Chip.tsx
// Chip de filtro horizontal (rubro / día) — equivalente a WFChip del wireflow.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, active = false, onClick, className }: ChipProps) {
  const interactive = typeof onClick === 'function';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={interactive ? active : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-[7px] text-[12.5px] transition-colors',
        active
          ? 'bg-brand font-semibold text-white'
          : 'border border-line bg-fill font-medium text-graytext hover:bg-fill-deep',
        className,
      )}
    >
      {children}
    </button>
  );
}
