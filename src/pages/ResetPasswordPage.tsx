// pages/ResetPasswordPage.tsx
// Pantalla · Nueva contraseña (/restablecer). Es el destino del link del email.
// Lee el token de recuperación de la URL y, con la clave nueva, llama a
// POST /api/auth/reset-password { token, password }.

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/app-button';
import { TextField } from '@/components/ui/TextField';
import { api, humanizeError } from '@/lib/api';
import { resetSchema, type ResetSchema } from '@/lib/schemas';

// El token puede venir en el hash (Supabase: #access_token=...&type=recovery) o
// como query (?token= / ?code=). Contemplamos ambos para no acoplarnos al backend.
function getRecoveryToken(): string {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const q = new URLSearchParams(window.location.search);
  return (
    hash.get('access_token') ||
    q.get('token') ||
    q.get('code') ||
    q.get('access_token') ||
    hash.get('token') ||
    ''
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = useMemo(getRecoveryToken, []);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirm: '' },
  });

  const onSubmit = async (data: ResetSchema) => {
    if (!token) {
      setError('password', {
        message: 'El enlace no es válido o expiró. Pedí uno nuevo desde “¿Olvidaste tu contraseña?”.',
      });
      return;
    }
    try {
      await api.auth.resetPassword(token, data.password);
      setDone(true);
    } catch (e) {
      setError('password', { message: humanizeError(e) });
    }
  };

  if (done) {
    return (
      <AuthLayout title="¡Listo!" subtitle="Tu contraseña se actualizó">
        <div className="flex flex-1 flex-col gap-4">
          <p className="text-sm leading-relaxed text-graytext">
            Ya podés iniciar sesión con tu contraseña nueva.
          </p>
          <div className="mt-auto pt-3.5 md:mt-8">
            <Button type="button" onClick={() => navigate('/ingresar')}>
              Ingresar
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elegí una contraseña nueva para tu cuenta">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-3" noValidate>
        {!token && (
          <div className="rounded-xl bg-bad-soft px-3.5 py-3 text-[12.5px] font-semibold text-bad">
            El enlace no trae un token válido. Abrí el link tal cual llegó al mail, o pedí uno nuevo.
          </div>
        )}
        <TextField
          label="NUEVA CONTRASEÑA"
          type="password"
          placeholder="Al menos 6 caracteres"
          autoComplete="new-password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="REPETIR CONTRASEÑA"
          type="password"
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
          icon={<Lock size={16} />}
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <div className="mt-auto pt-3.5 md:mt-8">
          <Button type="submit" disabled={isSubmitting} className="mb-3">
            {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
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
