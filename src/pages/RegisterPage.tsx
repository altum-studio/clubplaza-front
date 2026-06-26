// pages/RegisterPage.tsx
// Pantalla 1 · Alta de socio (/registro) — VARIANTE A del wireflow (formulario único).
// Header verde con chevron + wordmark, título "Creá tu cuenta", formulario con
// validación en tiempo real (react-hook-form + zod) y consentimiento Ley 25.326.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/app-button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { homeForRole } from '@/lib/roles';
import { ApiError, humanizeError } from '@/lib/api';
import { registerSchema, type RegisterSchema } from '@/lib/schemas';

// Limita un grupo de 2 dígitos a un rango [1, max]. Solo actúa cuando ya hay
// 2 dígitos (mientras se escribe el primero no toca nada).
function clampParte(parte: string, max: number): string {
  if (parte.length < 2) return parte;
  const n = Math.min(Math.max(parseInt(parte, 10) || 1, 1), max);
  return String(n).padStart(2, '0');
}

// Formatea la entrada como DD/MM/AAAA insertando las barras solo (sin que el
// usuario las escriba) y acotando día (01–31) y mes (01–12) al tipear.
// `isDeleting` evita re-agregar la barra final al borrar, para que el backspace
// no quede trabado.
function formatFechaNac(value: string, isDeleting = false): string {
  const d = value.replace(/\D/g, '').slice(0, 8); // DDMMAAAA
  const dd = clampParte(d.slice(0, 2), 31);
  const mm = clampParte(d.slice(2, 4), 12);
  const aaaa = d.slice(4);
  let out: string;
  if (d.length >= 4) out = `${dd}/${mm}/${aaaa}`;
  else if (d.length >= 2) out = `${dd}/${d.slice(2)}`;
  else out = dd;
  if (isDeleting && out.endsWith('/')) out = out.slice(0, -1);
  return out;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerSocio } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched', // validación en tiempo real tras el primer blur
    defaultValues: {
      nombre: '',
      dni: '',
      fecha_nacimiento: '',
      email: '',
      celular: '',
      password: '',
      terminos: false,
    },
  });

  const terminos = watch('terminos');

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const profile = await registerSocio({
        nombre: data.nombre,
        dni: data.dni,
        fecha_nacimiento: data.fecha_nacimiento,
        email: data.email,
        celular: data.celular,
        password: data.password,
        terminos: data.terminos,
      });
      navigate(homeForRole(profile.rol), { replace: true });
    } catch (e) {
      const raw = e instanceof ApiError ? e.message : '';
      // "Ya registrado" es un error real y útil; el resto se muestra amigable
      // (los errores de infraestructura del backend llegan como "fetch failed").
      setError('email', {
        message: /registered|registrad/i.test(raw) ? 'Ese email ya está registrado' : humanizeError(e),
      });
    }
  };

  return (
    <AuthLayout title="Creá tu cuenta" subtitle="Es gratis y toma menos de un minuto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-3" noValidate>
        <TextField
          label="NOMBRE Y APELLIDO"
          placeholder="Tu nombre completo"
          autoComplete="name"
          icon={<User size={16} />}
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <div className="flex gap-3">
          <TextField
            label="DNI"
            placeholder="00000000"
            inputMode="numeric"
            error={errors.dni?.message}
            {...register('dni')}
          />
          <TextField
            label="FECHA DE NAC."
            placeholder="DD / MM / AAAA"
            inputMode="numeric"
            maxLength={10}
            error={errors.fecha_nacimiento?.message}
            {...register('fecha_nacimiento')}
            onChange={(e) => {
              const isDeleting = (e.nativeEvent as InputEvent).inputType?.startsWith('delete');
              e.target.value = formatFechaNac(e.target.value, isDeleting);
              register('fecha_nacimiento').onChange(e);
            }}
          />
        </div>
        <TextField
          label="CELULAR"
          type="tel"
          placeholder="11 1234 5678"
          autoComplete="tel"
          icon={<Phone size={16} />}
          error={errors.celular?.message}
          {...register('celular')}
        />
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
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Consentimiento Ley 25.326 */}
        <div className="mt-0.5">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              className="sr-only"
              checked={terminos}
              onChange={(e) => setValue('terminos', e.target.checked, { shouldValidate: true })}
            />
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-[1.5px] ${
                terminos ? 'border-brand bg-brand' : 'border-line bg-white'
              }`}
            >
              {terminos && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                </svg>
              )}
            </span>
            <span className="text-[10.5px] leading-[1.5] text-graytext">
              Acepto los <span className="font-semibold text-brand">Términos</span> y el tratamiento
              de mis datos por Green Plaza (Ley 25.326).
            </span>
          </label>
          {errors.terminos && (
            <p className="ml-7 mt-1 text-[11px] font-medium text-[#EF4444]">
              {errors.terminos.message}
            </p>
          )}
        </div>

        {/* CTA + link */}
        <div className="mt-auto pt-3.5 md:mt-6">
          <Button type="submit" disabled={isSubmitting} className="mb-3">
            {isSubmitting ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
          </Button>
          <div className="pb-4 text-center md:pb-0">
            <span className="text-xs text-graytext">¿Ya sos socio? </span>
            <button
              type="button"
              onClick={() => navigate('/ingresar')}
              className="text-xs font-bold text-brand"
            >
              Ingresá
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
