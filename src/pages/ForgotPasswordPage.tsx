// pages/ForgotPasswordPage.tsx
// Pantalla · Recuperar contraseña (/recuperar). El socio ingresa su email y el
// backend le manda un link para restablecerla (POST /api/auth/forgot-password).
// Por seguridad NO revelamos si el email existe: siempre mostramos "revisá tu mail".

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/app-button';
import { TextField } from '@/components/ui/TextField';
import { api, humanizeError } from '@/lib/api';
import { forgotSchema, type ForgotSchema } from '@/lib/schemas';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotSchema) => {
    try {
      await api.auth.forgotPassword(data.email);
      setSentTo(data.email.trim());
    } catch (e) {
      setError('email', { message: humanizeError(e) });
    }
  };

  if (sentTo) {
    return (
      <AuthLayout title="Revisá tu email" subtitle="Te enviamos un link para restablecer tu contraseña">
        <div className="flex flex-1 flex-col gap-4">
          <p className="text-sm leading-relaxed text-graytext">
            Si <b className="text-ink">{sentTo}</b> tiene una cuenta, te llegó un correo con el
            enlace para crear una contraseña nueva. Revisá también la carpeta de spam.
          </p>
          <div className="mt-auto pt-3.5 md:mt-8">
            <Button type="button" onClick={() => navigate('/ingresar')}>
              Volver a ingresar
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresá tu email y te mandamos un link para restablecerla"
    >
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

        <div className="mt-auto pt-3.5 md:mt-8">
          <Button type="submit" disabled={isSubmitting} className="mb-3">
            {isSubmitting ? 'Enviando…' : 'Enviar link'}
          </Button>
          <div className="pb-4 text-center md:pb-0">
            <button
              type="button"
              onClick={() => navigate('/ingresar')}
              className="text-xs font-bold text-brand"
            >
              Volver a ingresar
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
