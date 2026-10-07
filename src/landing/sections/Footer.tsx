// landing/sections/Footer.tsx
// Pie mínimo. En el celular deja espacio abajo para la barra fija del botón.

import { Logo } from '@/components/brand/Logo';
import { URL_BENEFICIOS, URL_INGRESAR, URL_TERMINOS } from '../links';

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white/60">
      <div className="mx-auto flex max-w-[1040px] flex-col items-center gap-5 px-5 pb-[calc(env(safe-area-inset-bottom)+104px)] pt-8 text-center md:flex-row md:justify-between md:px-[30px] md:pb-8 md:text-left">
        <Logo size={14} onGreen />
        <nav aria-label="Enlaces" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]">
          <a href={URL_BENEFICIOS} className="hover:text-white">
            Beneficios
          </a>
          <a href={URL_INGRESAR} className="hover:text-white">
            Ya soy socio
          </a>
          <a href={URL_TERMINOS} className="hover:text-white">
            Términos y condiciones
          </a>
        </nav>
        <p className="text-[12px]">© {new Date().getFullYear()} Green Plaza · ClubPlaza</p>
      </div>
    </footer>
  );
}
