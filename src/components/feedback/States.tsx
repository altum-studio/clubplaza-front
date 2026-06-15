// components/feedback/States.tsx
// Estados de carga (skeleton) y error reutilizables. Regla 9: toda pantalla que
// carga datos debe tener skeleton y un estado de error visible.

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/app-button';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-line-soft', className)} />;
}

/** Skeleton de una tarjeta del grid de beneficios. */
export function BenefitCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-soft bg-white">
      <Skeleton className="h-[88px] rounded-none" />
      <div className="space-y-2 px-2.5 pb-3 pt-2.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2.5 w-3/4" />
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-3 px-6 py-10 text-center', className)}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fill text-2xl">
        ⚠️
      </div>
      <p className="text-sm font-medium text-graytext">
        {message ?? 'Algo salió mal. Probá de nuevo.'}
      </p>
      {onRetry && (
        <Button variant="outline" full={false} sm onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
