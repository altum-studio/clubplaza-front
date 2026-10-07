// landing/sections/FinalCta.tsx
// Cierre en verde: el botón principal otra vez + la comunidad de WhatsApp como
// opción secundaria. En la compu suma un QR para seguir desde el celular, que es
// donde conviene registrarse (ahí vive la credencial).

import type { Ref } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';
import { CtaButton } from '../components/CtaButton';
import { URL_WHATSAPP, urlLandingAbsoluta } from '../links';
import { trackWhatsappClick } from '../track';

export function FinalCta({ ctaRef }: { ctaRef: Ref<HTMLAnchorElement> }) {
  return (
    <section
      aria-labelledby="final-titulo"
      className="text-white"
      style={{ background: 'linear-gradient(158deg, #23753A 0%, #17502A 100%)' }}
    >
      <div className="mx-auto max-w-[1040px] px-5 py-14 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-14 md:px-[30px] md:py-20">
        <div className="text-center md:text-left">
          <p className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-[#CFE6D6]">Sumate hoy</p>
          <h2 id="final-titulo" className="mt-2 text-[30px] font-extrabold leading-[1.1] md:text-[40px]">
            Tu credencial te espera
          </h2>
          <p className="mx-auto mt-3 max-w-[420px] text-[15.5px] leading-[1.5] text-white/85 md:mx-0">
            Registrate gratis y empezá a ahorrar en los locales de Green Plaza.
          </p>

          <div className="mt-7 flex flex-col gap-3 md:flex-row md:items-center">
            <CtaButton ubicacion="final" ref={ctaRef} />
            <a
              href={URL_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsappClick}
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-[14px] font-semibold text-white transition hover:bg-white/16"
            >
              <WhatsAppGlyph size={18} className="text-wa" />
              Sumate a la comunidad
            </a>
          </div>
        </div>

        <div className="mt-10 hidden flex-col items-center rounded-[20px] border border-white/18 bg-white/10 p-6 md:mt-0 md:flex">
          <div className="rounded-2xl bg-white p-3">
            <QRCodeSVG value={urlLandingAbsoluta()} size={120} fgColor="#1d1d1b" bgColor="#ffffff" level="M" />
          </div>
          <p className="mt-3 max-w-[170px] text-center text-[12.5px] leading-[1.4] text-white/85">
            ¿Estás en la compu? Escaneá y seguí desde tu celular
          </p>
        </div>
      </div>
    </section>
  );
}
