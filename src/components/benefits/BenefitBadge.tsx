// components/benefits/BenefitBadge.tsx
// Badge de categoría (pill chico, uppercase) — equivalente a WFTag del wireflow.
// tone "green" = categoría; tone "gray" = estado secundario (ej: "Vigente hoy").

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BenefitBadgeProps {
  children: ReactNode;
  tone?: 'green' | 'gray';
  className?: string;
}

export function BenefitBadge({ children, tone = 'green', className }: BenefitBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-md px-[7px] py-[3px] text-[10px] font-bold uppercase tracking-[0.4px]',
        tone === 'green' ? 'bg-brand/10 text-brand' : 'bg-fill text-graytext',
        className,
      )}
    >
      {children}
    </span>
  );
}
