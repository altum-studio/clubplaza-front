// landing/sections/HowItWorks.tsx
// "Cómo funciona" en 3 pasos (números a dos dígitos, como pide el design system).
// En el celular, abajo de los pasos va la muestra de la credencial; en la compu
// ya aparece en la portada, así que acá no se repite.

import { CredentialMock } from '../components/CredentialMock';
import { urlLandingAbsoluta } from '../links';

const PASOS = [
  {
    n: '01',
    titulo: 'Registrate gratis',
    texto: 'Completás tus datos desde el celular. Sin papeles, sin vueltas.',
  },
  {
    n: '02',
    titulo: 'Recibí tu credencial',
    texto: 'Tu credencial digital con código QR queda guardada en tu celular.',
  },
  {
    n: '03',
    titulo: 'Mostrala y ahorrá',
    texto: 'En la caja del local mostrás tu credencial junto a tu DNI y te aplican el beneficio.',
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="como-titulo" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1040px] px-5 md:px-[30px]">
        <p className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-graytext">Cómo funciona</p>
        <h2 id="como-titulo" className="mt-1.5 text-[22px] font-extrabold leading-tight text-ink md:text-[30px]">
          Sumarte lleva menos de un minuto
        </h2>

        <ol className="mt-7 flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8">
          {PASOS.map((p) => (
            <li key={p.n} className="flex gap-4 md:flex-col md:gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-[15px] font-extrabold text-brand">
                {p.n}
              </span>
              <div>
                <h3 className="text-[16px] font-bold text-ink">{p.titulo}</h3>
                <p className="mt-1 text-[14px] leading-[1.5] text-graytext">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <figure className="mt-10 flex flex-col items-center md:hidden">
          <CredentialMock qrValue={urlLandingAbsoluta()} />
          <figcaption className="mt-3 text-[12.5px] text-mute">Así se ve tu credencial en el celular</figcaption>
        </figure>
      </div>
    </section>
  );
}
