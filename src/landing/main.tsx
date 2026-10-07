// landing/main.tsx — punto de entrada de la landing de pauta (/sumate).
// Entrada separada de la app: no carga el router, el login ni los paneles.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import './landing.css';
import { LandingPage } from './LandingPage';
import { initTracking } from './track';

initTracking();

createRoot(document.getElementById('landing')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
