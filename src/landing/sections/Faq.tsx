// landing/sections/Faq.tsx
// Preguntas frecuentes con <details> nativo: se abren con un toque, sin JS y
// accesibles de fábrica.

import { ChevronDown } from 'lucide-react';

const PREGUNTAS = [
  {
    p: '¿Cuánto cuesta ser socio?',
    r: 'Nada. ClubPlaza es gratis: te registrás y empezás a usar los beneficios.',
  },
  {
    p: '¿Cómo uso un beneficio?',
    r: 'Mostrás tu credencial digital (el código QR) en la caja del local, junto a tu DNI. El local la valida y te aplica el beneficio.',
  },
  {
    p: '¿Tengo que descargar una app?',
    r: 'No. ClubPlaza funciona desde el navegador de tu celular. Si querés, la podés agregar a tu pantalla de inicio para tenerla siempre a mano.',
  },
  {
    p: '¿En qué locales puedo usarlo?',
    r: 'En los locales adheridos de Green Plaza. Cada beneficio indica en qué local aplica y sus condiciones.',
  },
  {
    p: '¿Cómo me entero de los beneficios nuevos?',
    r: 'Se suman beneficios todo el tiempo. Sumate a la comunidad de WhatsApp de ClubPlaza y enterate primero.',
  },
];

export function Faq() {
  return (
    <section aria-labelledby="faq-titulo" className="bg-screen py-12 md:py-16">
      <div className="mx-auto max-w-[720px] px-5 md:px-[30px]">
        <p className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-graytext">Preguntas frecuentes</p>
        <h2 id="faq-titulo" className="mt-1.5 text-[22px] font-extrabold leading-tight text-ink md:text-[30px]">
          ¿Tenés dudas?
        </h2>

        <div className="cp-faq mt-5 border-t border-line-soft">
          {PREGUNTAS.map(({ p, r }) => (
            <details key={p} className="group border-b border-line-soft">
              <summary className="flex min-h-[56px] items-center justify-between gap-4 py-3 text-[15px] font-bold text-ink">
                {p}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-graytext transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-4 pr-8 text-[14px] leading-[1.6] text-graytext">{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
