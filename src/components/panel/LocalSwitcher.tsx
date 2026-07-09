// components/panel/LocalSwitcher.tsx
// Avatar del panel de comercio: muestra el LOGO del local activo (en vez de las
// iniciales). Si el usuario gestiona >1 local, es clickeable y abre un menú con
// el logo de cada local para switchear. Admin / sin locales → avatar de iniciales.

import { useState } from 'react';
import { useLocalScope } from '@/hooks/useLocalScope';
import { Avatar, LogoBox } from './kit';
import { Icon } from './Icon';

function LocalLogo({ src, size }: { src: string | null; size: number }) {
  return src ? (
    <img
      src={src}
      alt=""
      className="flex-shrink-0 rounded-full border border-line object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <LogoBox size={size} />
  );
}

export function LocalSwitcher({
  size = 32,
  fallbackName = 'NN',
  menuDir = 'up',
}: {
  size?: number;
  fallbackName?: string;
  menuDir?: 'up' | 'down';
}) {
  const { misLocales, activeLocal, activeLocalId, setActiveLocalId } = useLocalScope();
  const [open, setOpen] = useState(false);

  // Admin / rol sin locales → avatar de iniciales de siempre.
  if (misLocales.length === 0) {
    return <Avatar name={fallbackName} size={size} tone="mute" />;
  }

  const multi = misLocales.length > 1;
  const shown = activeLocal ?? misLocales[0];

  const logo = (
    <span className="relative inline-flex flex-shrink-0" style={{ width: size, height: size }}>
      <LocalLogo src={shown.logo_url} size={size} />
      {multi && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white ring-2 ring-brand-dark">
          <Icon name="down" size={10} strokeWidth={3} />
        </span>
      )}
    </span>
  );

  if (!multi) return logo;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cambiar de local"
        title="Cambiar de local"
        className="inline-flex"
      >
        {logo}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 z-50 w-60 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${
              menuDir === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.6px] text-mute">
              Cambiar de local
            </div>
            {misLocales.map((l) => {
              const on = l.id === activeLocalId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setActiveLocalId(l.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-fill ${
                    on ? 'bg-brand-soft' : ''
                  }`}
                >
                  <LocalLogo src={l.logo_url} size={26} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                    {l.nombre}
                  </span>
                  {on && <Icon name="check" size={15} className="text-brand" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
