// components/panel/DataState.tsx
// Estados compartidos de carga / error / vacío para las pantallas del panel
// conectadas a la API. Mantiene el layout consistente.

import { type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { PButton } from './kit';

export function PanelLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-[14px] border border-line bg-white" />
      ))}
    </div>
  );
}

export function PanelError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bad-soft">
        <Icon name="x" size={22} className="text-bad" />
      </span>
      <div className="text-sm font-bold text-ink">No se pudo cargar</div>
      <p className="max-w-sm text-xs text-graytext">{message ?? 'Reintentá en unos segundos.'}</p>
      {onRetry && (
        <PButton variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </PButton>
      )}
    </div>
  );
}

export function PanelEmpty({
  icon = 'tag',
  title,
  hint,
  action,
}: {
  icon?: IconName;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
        <Icon name={icon} size={22} className="text-brand" />
      </span>
      <div className="text-sm font-bold text-ink">{title}</div>
      {hint && <p className="max-w-sm text-xs text-graytext">{hint}</p>}
      {action}
    </div>
  );
}

// Helper de render: elige loading / error / contenido según el estado del hook.
export function DataView<T>({
  state,
  loadingRows,
  children,
}: {
  state: { data: T | null; loading: boolean; error: string | null; reload: () => void };
  loadingRows?: number;
  children: (data: T) => ReactNode;
}) {
  if (state.loading) return <PanelLoading rows={loadingRows} />;
  if (state.error) return <PanelError message={state.error} onRetry={state.reload} />;
  if (state.data === null) return null;
  return <>{children(state.data)}</>;
}
