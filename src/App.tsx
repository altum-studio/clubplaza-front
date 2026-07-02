// App.tsx — rutas de la app (React Router v6).
// Etapa 1: las 5 pantallas del flujo de socio. /perfil y /admin/* quedan para
// próximas etapas (todavía no están diseñadas), por eso no se montan aún.

import { Navigate, Route, Routes } from 'react-router-dom'
import SplashPage from '@/pages/SplashPage'
import RegisterPage from '@/pages/RegisterPage'
import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import HomePage from '@/pages/HomePage'
import BenefitDetailPage from '@/pages/BenefitDetailPage'
import LocalPage from '@/pages/LocalPage'
import CredentialPage from '@/pages/CredentialPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RequireRole } from '@/components/auth/RequireRole'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminLocales from '@/pages/admin/AdminLocales'
import AdminBeneficios from '@/pages/admin/AdminBeneficios'
import AdminUsuarios from '@/pages/admin/AdminUsuarios'
import LocalInicio from '@/pages/panel/LocalInicio'
import LocalValidar from '@/pages/panel/LocalValidar'
import LocalBeneficios from '@/pages/panel/LocalBeneficios'
import LocalStats from '@/pages/panel/LocalStats'
import LocalHistorial from '@/pages/panel/LocalHistorial'

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/ingresar" element={<LoginPage />} />
      <Route path="/recuperar" element={<ForgotPasswordPage />} />
      <Route path="/restablecer" element={<ResetPasswordPage />} />
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

      {/* Panel Administrador — solo rol "admin" */}
      <Route path="/admin" element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />
      <Route path="/admin/locales" element={<RequireRole roles={['admin']}><AdminLocales /></RequireRole>} />
      <Route path="/admin/beneficios" element={<RequireRole roles={['admin']}><AdminBeneficios /></RequireRole>} />
      <Route path="/admin/usuarios" element={<RequireRole roles={['admin']}><AdminUsuarios /></RequireRole>} />

      {/* Panel Local / comercio adherido — rol "local" (admin puede supervisar) */}
      <Route path="/panel" element={<RequireRole roles={['local', 'admin']}><LocalInicio /></RequireRole>} />
      <Route path="/panel/validar" element={<RequireRole roles={['local', 'admin']}><LocalValidar /></RequireRole>} />
      <Route path="/panel/beneficios" element={<RequireRole roles={['local', 'admin']}><LocalBeneficios /></RequireRole>} />
      <Route path="/panel/estadisticas" element={<RequireRole roles={['local', 'admin']}><LocalStats /></RequireRole>} />
      <Route path="/panel/historial" element={<RequireRole roles={['local', 'admin']}><LocalHistorial /></RequireRole>} />

      {/* TODO próximas etapas: /perfil (protegida) y auth independiente del panel */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
