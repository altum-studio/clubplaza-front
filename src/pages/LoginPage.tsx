// pages/LoginPage.tsx
// Pantalla · Inicio de sesión (/ingresar) — para socios que ya tienen cuenta.
// Misma estética y lógica que el registro (react-hook-form + zod), pero con
// email + contraseña. Al iniciar sesión redirige al home (/beneficios).

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Mail, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppCanvas, STATUS_PAD } from '@/components/ui/AppCanvas';
import { Logo } from '@/components/brand/Logo';
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
    <AppCanvas>
      {/* Header verde */}
      <header className={`${STATUS_PAD} rounded-b-[18px] bg-brand px-4 pb-[18px]`}>
        <div className="mb-3.5 flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Volver"
            onClick={() => navigate(-1)}
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <ChevronLeft size={22} />
          </button>
          <Logo size={15} onGreen iso={false} />
        </div>
        <h1 className="text-[22px] font-extrabold text-white">Iniciá sesión</h1>
        <p className="text-[12.5px] font-normal text-white/85">
          Bienvenido de nuevo a ClubPlaza
        </p>
      </header>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-[18px]"
        noValidate
      >
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
        <div className="mt-auto pt-3.5">
          <Button type="submit" disabled={isSubmitting} className="mb-3">
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
          <div className="pb-4 text-center">
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
    </AppCanvas>
  );
}
