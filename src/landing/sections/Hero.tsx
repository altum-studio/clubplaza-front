// landing/sections/Hero.tsx
// Portada. En el celular ocupa casi toda la pantalla: foto del shopping con el
// degradado de marca y el contenido abajo (zona del pulgar), con el botón visible
// sin scrollear. En la compu pasa a dos columnas: texto + muestra de credencial.

import type { Ref } from 'react';
import { Logo } from '@/components/brand/Logo';
import { CtaButton } from '../components/CtaButton';
import { CredentialMock } from '../components/CredentialMock';
import { IMG_HERO_DESKTOP, IMG_HERO_MOBILE, URL_INGRESAR, urlLandingAbsoluta } from '../links';
import type { LandingData } from '../useLandingData';

interface HeroProps {
  data: LandingData;
  ctaRef: Ref<HTMLAnchorElement>;
}

export function Hero({ data, ctaRef }: HeroProps) {
  return (
    <header className="relative isolate overflow-hidden bg-brand-dark text-white">
      <picture>
        <source media="(min-width: 768px)" srcSet={IMG_HERO_DESKTOP} />
        <img
          src={IMG_HERO_MOBILE}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      </picture>
      {/* Degradado de marca (nunca verde plano): abajo en celular, a la izquierda en compu. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(23,80,42,0.25)_0%,rgba(23,80,42,0.55)_36%,#17502A_74%)] md:bg-[linear-gradient(100deg,#17502A_0%,rgba(23,80,42,0.93)_45%,rgba(23,80,42,0.35)_100%)]"
      />

      <div className="mx-auto flex min-h-[92svh] max-w-[1040px] flex-col px-5 pb-8 pt-[max(env(safe-area-inset-top),18px)] md:min-h-[660px] md:px-[30px] md:pb-14">
        <nav className="flex items-center justify-between" aria-label="ClubPlaza">
          <Logo size={15} onGreen />
          <div className="flex items-center gap-4">
            <a href={URL_INGRESAR} className="text-[13px] font-semibold text-white/85 hover:text-white">
              Ingresar
            </a>
            <CtaButton ubicacion="header" size="sm" className="hidden md:inline-flex">
              Sumate gratis
            </CtaButton>
          </div>
        </nav>

        <div className="mt-auto md:my-auto md:grid md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-10">
          <div className="animate-cp-fade">
            <p className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-[#CFE6D6]">
              Club de beneficios de Green Plaza
            </p>
            <h1 className="mt-3 text-[34px] font-extrabold leading-[1.06] tracking-[-0.5px] md:text-[50px]">
              Beneficios exclusivos en los locales de Green&nbsp;Plaza
            </h1>
            <p className="mt-3.5 max-w-[460px] text-[15.5px] leading-[1.5] text-white/85 md:text-[17px]">
              Sumate gratis a ClubPlaza, mostrá tu credencial digital y ahorrá en cada compra.
            </p>

            <Stats data={data} />

            <div className="mt-6">
              <CtaButton ubicacion="hero" ref={ctaRef} />
            </div>
            <p className="mt-3 text-center text-[12.5px] text-white/70 md:text-left">
              Gratis · Te registrás en menos de un minuto
            </p>
          </div>

          <div className="hidden justify-center md:flex">
            <CredentialMock qrValue={urlLandingAbsoluta()} className="rotate-[3deg]" />
          </div>
        </div>
      </div>
    </header>
  );
}

// Datos en vivo ("57 beneficios activos · 22 locales"). Reserva su alto mientras
// carga para que la página no salte; si la API falla, simplemente no se muestran.
function Stats({ data }: { data: LandingData }) {
  const pill = 'inline-flex h-[30px] items-center gap-1.5 rounded-full border border-white/18 bg-white/12 px-3 text-[12.5px]';
  return (
    <div className="mt-5 flex min-h-[30px] flex-wrap gap-2" aria-live="polite">
      {data.status === 'loading' && (
        <>
          <span className={`${pill} w-[150px] animate-pulse`} />
          <span className={`${pill} w-[96px] animate-pulse`} />
        </>
      )}
      {data.status === 'ready' && data.totalBeneficios > 0 && (
        <>
          <span className={pill}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#7FD39A]" aria-hidden="true" />
            <span>
              <b className="font-extrabold">{data.totalBeneficios}</b> beneficios activos
            </span>
          </span>
          {data.totalLocales > 0 && (
            <span className={pill}>
              <span>
                <b className="font-extrabold">{data.totalLocales}</b> locales
              </span>
            </span>
          )}
        </>
      )}
    </div>
  );
}
