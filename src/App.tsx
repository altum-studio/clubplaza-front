// App.tsx — rutas de la app (React Router v6).
// Etapa 1: las 5 pantallas del flujo de socio. /perfil y /admin/* quedan para
// próximas etapas (todavía no están diseñadas), por eso no se montan aún.

import { Navigate, Route, Routes } from 'react-router-dom'
import SplashPage from '@/pages/SplashPage'
import RegisterPage from '@/pages/RegisterPage'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import BenefitDetailPage from '@/pages/BenefitDetailPage'
import LocalPage from '@/pages/LocalPage'
import CredentialPage from '@/pages/CredentialPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/ingresar" element={<LoginPage />} />
      <Route path="/beneficios" element={<HomePage />} />
      <Route path="/beneficios/:id" element={<BenefitDetailPage />} />
      <Route path="/local/:slug" element={<LocalPage />} />

      {/* Protegidas — requieren sesión activa */}
      <Route
        path="/credencial"
        element={
          <ProtectedRoute>
            <CredentialPage />
          </ProtectedRoute>
        }
      />

      {/* TODO próximas etapas: /perfil (protegida) y /admin/* (auth independiente) */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
