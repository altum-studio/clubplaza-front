// components/auth/AuthLayout.tsx
// Layout responsive para login/registro:
//  - mobile: header verde arriba + formulario abajo (full-screen, como antes).
//  - tablet/desktop (md+): split — panel de marca a la izquierda + formulario
//    centrado a la derecha (con su propio título).

import { type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STATUS_PAD } from '@/components/ui/AppCanvas';
import { BrandIso, Logo } from '@/components/brand/Logo';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh w-full bg-screen text-ink">
      {/* Panel de marca — solo tablet/desktop */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-10 text-white md:flex md:w-[45%] lg:w-1/2 xl:w-[56%]">
        <Logo size={20} onGreen />
        <div className="max-w-md">
          <BrandIso size={56} onGreen className="mb-6 opacity-95" />
          <h2 className="text-[30px] font-extrabold leading-[1.1] lg:text-[36px]">
            Tus beneficios de Green Plaza, siempre con vos.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/80">
            Descuentos, 2x1 y promos de todos los locales del shopping en una sola credencial digital.
          </p>
        </div>
        <p className="text-xs text-white/55">© Green Plaza · ClubPlaza</p>
      </aside>

      {/* Panel del formulario (alineado ARRIBA en desktop para que el título
          quede a la misma altura en login y registro, sin importar el contenido) */}
      <main className="flex w-full flex-col md:w-[55%] md:items-center md:justify-start md:overflow-y-auto lg:w-1/2 xl:w-[44%]">
        {/* Header verde — solo mobile */}
        <header className={`${STATUS_PAD} w-full rounded-b-[18px] bg-brand px-4 pb-[18px] md:hidden`}>
          <div className="mx-auto w-full max-w-[460px]">
            <div className="mb-3.5 flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Volver"
                onClick={() => navigate(-1)}
                className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <ChevronLeft size={22} />
              </button>
              <Logo size={15} onGreen iso={false} />
            </div>
            <h1 className="text-[22px] font-extrabold text-white">{title}</h1>
            <p className="text-[12.5px] font-normal text-white/85">{subtitle}</p>
          </div>
        </header>

        {/* Contenedor del formulario */}
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col px-4 pb-4 pt-[18px] md:flex-none md:px-10 md:py-12">
          {/* Título — solo tablet/desktop */}
          <div className="mb-7 hidden md:block">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="-ml-1 mb-5 inline-flex items-center gap-1 text-[13px] font-semibold text-graytext hover:text-ink"
            >
              <ChevronLeft size={16} /> Volver
            </button>
            <h1 className="text-[28px] font-extrabold text-ink">{title}</h1>
            <p className="mt-1 text-sm text-graytext">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
