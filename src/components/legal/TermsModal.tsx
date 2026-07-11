// components/legal/TermsModal.tsx
// Popup de Términos y Condiciones (para el registro). Bottom-sheet en mobile,
// modal centrado en desktop. Cierra con la X, el backdrop o Escape.

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { TermsContent } from './TermsContent';

export function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:max-w-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-line-soft px-5 py-4">
          <span className="text-[15px] font-extrabold text-ink">Términos y Privacidad</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-graytext hover:bg-fill"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-3">
          <TermsContent />
        </div>
      </div>
    </div>
  );
}
