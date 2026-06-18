// components/credential/CredentialContent.tsx
// Contenido visual de la credencial (logo + QR + código + instrucción).
// Lo comparten la ruta /credencial y el panel arrastrable del home.

import { QRCodeSVG } from 'qrcode.react';
import { Logo } from '@/components/brand/Logo';
import { useSocio } from '@/hooks/useSocio';

export const CRED_GRADIENT = 'linear-gradient(160deg, #23753a 0%, #17502a 100%)';

export function CredentialContent() {
  const { socio, loading } = useSocio();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }
  if (!socio) return null;

  return (
    <>
      {/* Marca centrada, ISO arriba */}
      <div className="mb-2 flex justify-center">
        <Logo size={26} onGreen stacked />
      </div>

      {/* Centro: credencial */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-white/70">
          Credencial de socio
        </p>
        <p className="mb-5 text-[21px] font-bold text-white">{socio.nombre}</p>

        <div className="rounded-[20px] bg-white p-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
          <QRCodeSVG
            value={socio.token_qr}
            size={172}
            fgColor="#1d1d1b"
            bgColor="#ffffff"
            level="M"
            aria-label="Código QR de tu credencial"
          />
        </div>

        <div className="mt-5 text-center">
          <p className="mb-1 text-[10.5px] font-medium tracking-[0.5px] text-white/60">
            CÓDIGO DE SOCIO
          </p>
          <p className="font-mono text-[22px] font-semibold tracking-[2px] text-white">
            {socio.numero_socio}
          </p>
        </div>
      </div>

      {/* Pie: instrucción */}
      <div className="mb-3 rounded-xl bg-white/12 px-3.5 py-3 text-center">
        <p className="text-[11.5px] font-medium leading-snug text-white/90">
          Mostrá esta pantalla en el local junto a tu DNI
        </p>
      </div>
    </>
  );
}
