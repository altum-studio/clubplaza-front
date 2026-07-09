import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext'
import { LocalScopeProvider } from '@/context/LocalScopeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <LocalScopeProvider>
          <App />
        </LocalScopeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
