// landing/components/CredentialMock.tsx
// Muestra de la credencial de socio (no es una credencial real). Respeta la
// credencial de la app: degradado verde, QR protagonista en recuadro blanco y
// código en mono. El QR abre la landing (útil si alguien lo escanea).

import { QRCodeSVG } from 'qrcode.react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

export function CredentialMock({ className, qrValue }: { className?: string; qrValue: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-[290px] rounded-[22px] px-5 pb-5 pt-4 text-white shadow-[0_18px_44px_rgba(23,80,42,0.35)]',
        className,
      )}
      style={{ background: 'linear-gradient(160deg, #23753A 0%, #17502A 100%)' }}
      role="img"
      aria-label="Ejemplo de la credencial digital de socio de ClubPlaza, con código QR"
    >
      <div className="flex items-center justify-between">
        <Logo size={12.5} onGreen />
        <span className="rounded-full bg-white/14 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.8px]">SOCIO</span>
      </div>
      <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[1px] text-white/70">Credencial de socio</p>
      <p className="text-[19px] font-bold leading-tight">Tu nombre</p>
      <div className="mx-auto mt-4 w-fit rounded-[18px] bg-white p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        <QRCodeSVG value={qrValue} size={132} fgColor="#1d1d1b" bgColor="#ffffff" level="M" />
      </div>
      <p className="mt-4 text-center text-[10px] font-medium tracking-[0.5px] text-white/60">CÓDIGO DE SOCIO</p>
      <p className="text-center font-mono text-[17px] font-semibold tracking-[2px]">GP-0000-0000</p>
    </div>
  );
}
