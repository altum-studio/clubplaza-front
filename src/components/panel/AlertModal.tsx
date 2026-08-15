// components/panel/AlertModal.tsx
// Cartel flotante de alerta (error): oscurece el fondo y trae una cruz para
// cerrar — mismo patrón visual que PanelModal. Se usa cuando falla la carga /
// el guardado de un beneficio (y sirve para cualquier error de formulario).

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { PButton } from './kit';

export function AlertModal({
  open,
  title = 'No se pudo guardar',
  message,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !message) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado: ícono + título + cerrar */}
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-bad-soft">
              <AlertTriangle size={18} className="text-bad" />
            </span>
            <h2 className="text-[15px] font-extrabold text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-graytext hover:bg-fill"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensaje */}
        <p className="px-5 pb-1 pt-3 text-[13px] leading-relaxed text-graytext">{message}</p>

        {/* Acción */}
        <div className="flex justify-end px-5 pb-4 pt-3">
          <PButton onClick={onClose}>Entendido</PButton>
        </div>
      </div>
    </div>
  );
}
