// pages/SplashPage.tsx
// Pantalla 0 · Carga / Splash — VARIANTE C del wireflow.
// Foto del shopping de fondo + degradado hacia abajo + logo que se dibuja + 3 dots.
// Aparece ~2.4s y redirige: con sesión → /beneficios, sin sesión → /registro.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '@/components/brand/BrandMark';
import { useAuth } from '@/hooks/useAuth';

export default function SplashPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // esperar a que se rehidrate la sesión
    // ?stay pausa el auto-redirect (útil para QA / demos de la pantalla de carga).
    if (new URLSearchParams(window.location.search).has('stay')) return;
    const t = setTimeout(() => {
      navigate(isAuthenticated ? '/beneficios' : '/registro', { replace: true });
    }, 2400);
    return () => clearTimeout(t);
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#0c100e] text-white">
      {/* Foto del shopping (cubre toda la pantalla en cualquier tamaño) */}
      <img
        src={`${import.meta.env.BASE_URL}shopping.jpg?v=2`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Degradado */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.30) 42%, rgba(0,0,0,0.80) 100%)',
        }}
      />

      {/* Contenido centrado */}
      <div className="animate-cp-fade relative flex flex-col items-center justify-center gap-6">
        <BrandMark size={122} color="#fff" animated />
        <div className="text-[22px] leading-none tracking-[1px] text-white">
          <span className="font-extrabold">CLUB</span>
          <span className="font-light">PLAZA</span>
        </div>
      </div>

      {/* dots animados al pie */}
      <div className="absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),48px)] flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-white"
            style={{ animation: `cpDot 1.2s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
