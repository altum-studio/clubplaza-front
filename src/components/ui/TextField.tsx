// components/ui/TextField.tsx
// Campo de texto de formulario con label, ícono opcional y error inline.
// Estética del wireflow (WFField): alto 46, rounded 11, borde line, label
// uppercase 11.5px. En error: borde rojo + mensaje debajo.

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, icon, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[11.5px] font-semibold tracking-[0.2px] text-graytext"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex h-[46px] items-center gap-2.5 rounded-[11px] border bg-white px-3.5',
          'focus-within:ring-2 focus-within:ring-brand/30',
          error ? 'border-[#EF4444]' : 'border-line',
        )}
      >
        {icon && <span className="flex-shrink-0 text-mute">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="h-full w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-mute"
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-[11px] font-medium text-[#EF4444]">
          {error}
        </p>
      )}
    </div>
  );
});
