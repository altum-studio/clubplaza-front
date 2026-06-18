// pages/CredentialPage.tsx
// Pantalla 4 · Credencial digital (/credencial) — VARIANTE A del wireflow.
// Carnet verde full-screen con degradado, QR real (qrcode.react) del token del
// socio y código GP-XXXX-XXXX en monospace. Ruta protegida, sin bottom nav.

import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronUp } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
import { useSocio } from '@/hooks/useSocio';
import { useVerticalSwipe } from '@/hooks/useVerticalSwipe';

const GRADIENT = 'linear-gradient(160deg, #23753a 0%, #17502a 100%)';

export default function CredentialPage() {
  const navigate = useNavigate();
  const { socio, loading } = useSocio();

  // Deslizar hacia arriba esconde la credencial y vuelve al home.
  const swipe = useVerticalSwipe({ onSwipeUp: () => navigate('/beneficios') });

  if (loading) {
    return (
      <AppCanvas dark bg="#17502a">
        <div className="flex flex-1 items-center justify-center" style={{ background: GRADIENT }}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      </AppCanvas>
    );
  }

  // ProtectedRoute garantiza sesión; este guard es por las dudas.
  if (!socio) return null;

  return (
    <AppCanvas dark bg="#17502a">
      <div
        {...swipe}
        className={`${STATUS_PAD} flex flex-1 flex-col px-[22px] pb-[max(env(safe-area-inset-bottom),30px)]`}
        style={{ background: GRADIENT }}
      >
        {/* Top: marca centrada, ISO arriba (el margen del notch lo da STATUS_PAD).
            El menú / cierre de sesión se reubica más adelante. */}
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

        {/* Grabber al pie: deslizar hacia arriba para ocultar la credencial */}
        <button
          type="button"
          onClick={() => navigate('/beneficios')}
          aria-label="Volver al inicio"
          className="mx-auto flex flex-col items-center gap-1 text-white/75 hover:text-white"
        >
          <ChevronUp size={18} className="animate-bounce" />
          <span className="block h-1 w-9 rounded-full bg-white/40" />
        </button>
      </div>
    </AppCanvas>
  );
}
