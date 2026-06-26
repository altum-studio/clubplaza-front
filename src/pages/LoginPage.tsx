// pages/LoginPage.tsx
// Pantalla · Inicio de sesión (/ingresar) — para socios que ya tienen cuenta.
// Misma estética y lógica que el registro (react-hook-form + zod), pero con
// email + contraseña. Al iniciar sesión redirige al home (/beneficios).

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/app-button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { homeForRole } from '@/lib/roles';
import { humanizeError } from '@/lib/api';
import { loginSchema, type LoginSchema } from '@/lib/schemas';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      const profile = await login(data.email, data.password);
      // Redirige según el rol (admin→/admin, local→/panel, comun→/beneficios),
      // o vuelve a la ruta protegida desde la que se redirigió al login.
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? homeForRole(profile.rol), { replace: true });
    } catch (e) {
      setError('password', { message: humanizeError(e) });
    }
  };

  return (
    <AuthLayout title="Iniciá sesión" subtitle="Bienvenido de nuevo a ClubPlaza">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-3" noValidate>
        <TextField
          label="EMAIL"
          type="email"
          placeholder="vos@email.com"
          autoComplete="email"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="CONTRASEÑA"
          type="password"
          placeholder="Tu contraseña"
          autoComplete="current-password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* CTA + link */}
        <div className="mt-auto pt-3.5 md:mt-8">
          <Button type="submit" disabled={isSubmitting} className="mb-3">
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
          <div className="pb-4 text-center md:pb-0">
            <span className="text-xs text-graytext">¿No tenés cuenta? </span>
            <button
              type="button"
              onClick={() => navigate('/registro')}
              className="text-xs font-bold text-brand"
            >
              Registrate
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
