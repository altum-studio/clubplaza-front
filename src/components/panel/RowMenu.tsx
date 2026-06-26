// components/panel/RowMenu.tsx
// Menú de acciones por fila (⋯) + diálogo de confirmación de baja.
// El menú se renderiza en un portal con position:fixed para que no lo recorte
// el overflow de la tabla/card.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { humanizeError } from '@/lib/api';
import { Icon, type IconName } from './Icon';
import { PanelModal } from './PanelModal';
import { PButton } from './kit';

export interface MenuItem {
  label: string;
  icon?: IconName;
  danger?: boolean;
  onClick: () => void;
}

export function RowMenu({ items }: { items: MenuItem[] }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    // Click afuera cierra (con delay para no captar el click que abre).
    const t = setTimeout(() => document.addEventListener('click', close), 0);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Más acciones"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line hover:bg-fill"
      >
        <Icon name="dots" size={16} className="text-graytext" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 60 }}
            className="min-w-[160px] overflow-hidden rounded-lg border border-line bg-white py-1 shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
          >
            {items.map((it, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  it.onClick();
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium hover:bg-fill',
                  it.danger ? 'text-bad' : 'text-ink',
                )}
              >
                {it.icon && <Icon name={it.icon} size={15} />}
                {it.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

// Diálogo de confirmación de baja. `onConfirm` hace el DELETE + reload; el
// diálogo maneja el estado de carga / error y se cierra al terminar.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(false);
      setErr(null);
    }
  }, [open]);

  const confirm = async () => {
    setLoading(true);
    setErr(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setErr(humanizeError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <PButton variant="soft" onClick={onClose}>
            Cancelar
          </PButton>
          <PButton variant="danger" icon="trash" onClick={confirm}>
            {loading ? 'Eliminando…' : confirmLabel}
          </PButton>
        </>
      }
    >
      <p className="text-[13.5px] leading-relaxed text-graytext">{message}</p>
      {err && (
        <p className="mt-3 rounded-[10px] bg-bad-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-bad">{err}</p>
      )}
    </PanelModal>
  );
}
