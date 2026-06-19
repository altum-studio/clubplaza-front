// components/credential/CredentialContent.tsx
// Cuerpo de la credencial (nombre + QR + código + instrucción). El encabezado
// (logo o saludo) lo pone cada contenedor: la ruta /credencial usa el logo,
// el panel del home usa el saludo. Se comparte el QR/código para no duplicar.

import { QRCodeSVG } from 'qrcode.react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocio } from '@/hooks/useSocio';
import { useAuth } from '@/hooks/useAuth';

export const CRED_GRADIENT = 'linear-gradient(160deg, #23753a 0%, #17502a 100%)';

export function CredentialContent() {
  const { socio, loading } = useSocio();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/ingresar', { replace: true });
  };

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
      {/* Centro: QR + datos */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-white/70">
          Credencial de socio
        </p>
        <p className="mb-1.5 text-[21px] font-bold text-white">{socio.nombre}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70 underline underline-offset-2 hover:text-white"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>

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
      <div className="mb-6 rounded-xl bg-white/12 px-3.5 py-3 text-center">
        <p className="text-[11.5px] font-medium leading-snug text-white/90">
          Mostrá esta pantalla en el local junto a tu DNI
        </p>
      </div>
    </>
  );
}
