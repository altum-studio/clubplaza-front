// pages/CredentialPage.tsx
// Pantalla 4 · Credencial digital (/credencial) — VARIANTE A del wireflow.
// Carnet verde full-screen con degradado, QR real (qrcode.react) del token del
// socio y código GP-XXXX-XXXX en monospace. Ruta protegida, sin bottom nav.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronDown } from 'lucide-react';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
import { useSocio } from '@/hooks/useSocio';
import { useAuth } from '@/hooks/useAuth';

const GRADIENT = 'linear-gradient(160deg, #23753a 0%, #17502a 100%)';

export default function CredentialPage() {
  const navigate = useNavigate();
  const { socio, loading } = useSocio();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
        className={`${STATUS_PAD} flex flex-1 flex-col px-[22px] pb-[max(env(safe-area-inset-bottom),30px)]`}
        style={{ background: GRADIENT }}
      >
        {/* Top: logo + opciones */}
        <div className="relative mb-1 flex items-center justify-between">
          <Logo size={16} onGreen />
          <button
            type="button"
            aria-label="Opciones de la credencial"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
          >
            <ChevronDown size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-10 w-48 overflow-hidden rounded-xl bg-white text-ink shadow-xl">
              <button
                type="button"
                onClick={() => navigate('/beneficios')}
                className="block w-full px-4 py-3 text-left text-sm font-medium hover:bg-fill"
              >
                Ver mis beneficios
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/registro', { replace: true });
                }}
                className="block w-full border-t border-line-soft px-4 py-3 text-left text-sm font-medium text-[#EF4444] hover:bg-fill"
              >
                Cerrar sesión
              </button>
            </div>
          )}
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
        <div className="rounded-xl bg-white/12 px-3.5 py-3 text-center">
          <p className="text-[11.5px] font-medium leading-snug text-white/90">
            Mostrá esta pantalla en el local junto a tu DNI
          </p>
        </div>
      </div>
    </AppCanvas>
  );
}
