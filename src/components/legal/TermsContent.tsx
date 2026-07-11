// components/legal/TermsContent.tsx
// Contenido de Términos y Condiciones + Política de Privacidad (sin chrome).
// Lo usan la página /terminos y el popup del registro.

import type { ReactNode } from 'react';

function H1({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 mt-9 text-[18px] font-extrabold tracking-[-0.2px] text-brand">{children}</h2>;
}
function H2({ children }: { children: ReactNode }) {
  return <h3 className="mb-1.5 mt-5 text-[15px] font-bold text-ink">{children}</h3>;
}
function P({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[13.5px] leading-relaxed text-graytext">{children}</p>;
}
function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mb-2 flex list-disc flex-col gap-1.5 pl-5 text-[13.5px] leading-relaxed text-graytext">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

const MAIL = 'info@mediagroup.com.ar';
const Mail = () => (
  <a href={`mailto:${MAIL}`} className="font-semibold text-brand">
    {MAIL}
  </a>
);

export function TermsContent() {
  return (
    <>
      <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.3px]">
        Términos y Condiciones · Política de Privacidad
      </h1>
      <p className="mt-1.5 text-[13.5px] font-semibold text-graytext">
        ClubPlaza — Club de beneficios de Green Plaza
      </p>

      <H1>Parte 1 — Términos y Condiciones de uso</H1>

      <H2>1. Aceptación</H2>
      <P>
        Al registrarte y utilizar ClubPlaza (en adelante, “la Plataforma”) aceptás estos Términos y
        Condiciones y la Política de Privacidad. Si no estás de acuerdo, no debés registrarte ni usar la
        Plataforma.
      </P>

      <H2>2. Qué es ClubPlaza</H2>
      <P>
        ClubPlaza es el club de beneficios del shopping Green Plaza. Es una plataforma web donde los usuarios
        se registran como socios, acceden a las promociones y descuentos ofrecidos por los locales del
        shopping, y obtienen una credencial digital para utilizarlos.
      </P>

      <H2>3. Titular</H2>
      <P>
        La Plataforma es operada por EL BENJA S.R.L., CUIT 33-71522848-9, con domicilio en Tres Arroyos 2388,
        PB, Ciudad Autónoma de Buenos Aires (CABA) (en adelante, “Green Plaza”), responsable del club y de los
        datos de los socios.
      </P>

      <H2>4. Registro y cuenta del socio</H2>
      <UL
        items={[
          'Para ser socio debés completar el registro con datos veraces, completos y actualizados (nombre y apellido, email, celular, DNI y fecha de nacimiento).',
          'Debés ser mayor de 18 años, o contar con autorización de tu representante legal.',
          'Sos responsable de la confidencialidad de tu cuenta y del uso que se haga de ella.',
          'Green Plaza puede suspender o dar de baja cuentas con datos falsos, uso indebido o incumplimiento de estos Términos.',
        ]}
      />

      <H2>5. Credencial digital y beneficios</H2>
      <UL
        items={[
          'Como socio recibís una credencial digital con un código único que identifica tu cuenta.',
          'Los beneficios (descuentos, promociones, 2x1, regalos, etc.) son ofrecidos y definidos por cada local adherido, no por Green Plaza.',
          'Cada beneficio puede tener condiciones, vigencia y stock limitados, informados en la Plataforma o en el local.',
          'Para usar un beneficio deberás presentar tu credencial digital en el local y, si el local lo requiere, validar tu identidad.',
          'Green Plaza puede modificar, suspender o discontinuar beneficios sin previo aviso.',
        ]}
      />

      <H2>6. Responsabilidad sobre los beneficios</H2>
      <UL
        items={[
          'Green Plaza centraliza y difunde los beneficios, pero la prestación efectiva de cada beneficio es responsabilidad exclusiva del local que lo ofrece (calidad, stock, cumplimiento de la promoción, atención, etc.).',
          'Ante cualquier inconveniente con un beneficio, el reclamo debe dirigirse al local correspondiente.',
        ]}
      />

      <H2>7. Sistema de puntos (funcionalidad futura)</H2>
      <UL
        items={[
          'La Plataforma podrá incorporar un sistema de puntos que se acumulan por compras o acciones en los locales adheridos y que podrán canjearse por beneficios.',
          'Los puntos no tienen valor monetario, no son transferibles ni canjeables por dinero, y solo pueden usarse dentro de ClubPlaza según las reglas vigentes.',
          'Green Plaza podrá establecer, modificar o dar de baja las reglas de acumulación, vigencia y canje de puntos, informándolo a través de la Plataforma. Los puntos podrán tener fecha de vencimiento.',
          'Green Plaza podrá anular puntos obtenidos por error, fraude o uso indebido.',
        ]}
      />

      <H2>8. Uso correcto</H2>
      <P>
        Te comprometés a no usar la Plataforma con fines fraudulentos, a no intentar vulnerar su seguridad, a
        no duplicar ni ceder tu credencial, y a no usar beneficios de forma abusiva o contraria a su
        finalidad.
      </P>

      <H2>9. Disponibilidad del servicio</H2>
      <P>
        La Plataforma se ofrece “tal como está”. Green Plaza procura su disponibilidad y buen funcionamiento,
        pero no garantiza que sea ininterrumpida o libre de errores, y puede realizar tareas de mantenimiento
        o modificaciones.
      </P>

      <H2>10. Modificaciones</H2>
      <P>
        Green Plaza puede modificar estos Términos y los beneficios en cualquier momento. Los cambios rigen
        desde su publicación en la Plataforma. El uso continuado implica su aceptación.
      </P>

      <H2>11. Ley aplicable y jurisdicción</H2>
      <P>
        Estos Términos se rigen por las leyes de la República Argentina. Ante cualquier controversia, las
        partes se someten a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
      </P>

      <H2>12. Contacto</H2>
      <P>
        Consultas sobre estos Términos: <Mail />.
      </P>

      <H1>Parte 2 — Política de Privacidad</H1>

      <H2>1. Responsable de los datos</H2>
      <P>
        El responsable de la base de datos de socios es EL BENJA S.R.L., CUIT 33-71522848-9, domicilio en Tres
        Arroyos 2388, PB, Ciudad Autónoma de Buenos Aires (CABA), email de contacto <Mail />.
      </P>

      <H2>2. Qué datos recopilamos</H2>
      <P>
        Al registrarte recopilamos: nombre y apellido, email, número de celular, DNI y fecha de nacimiento.
        Además, podemos registrar datos de uso de la Plataforma (beneficios utilizados, fecha y local de los
        escaneos de tu credencial y, en el futuro, puntos acumulados).
      </P>

      <H2>3. Para qué usamos tus datos</H2>
      <UL
        items={[
          'Crear y administrar tu cuenta de socio y tu credencial digital.',
          'Permitirte acceder y utilizar los beneficios.',
          'Validar tu identidad al usar un beneficio en un local.',
          'Operar el sistema de puntos (cuando esté disponible).',
          'Enviarte comunicaciones sobre beneficios, novedades y promociones del club (podés solicitar dejar de recibirlas).',
          'Elaborar estadísticas y mejorar el servicio.',
        ]}
      />

      <H2>4. Base legal y consentimiento</H2>
      <P>
        El tratamiento de tus datos se basa en el consentimiento que otorgás al registrarte, conforme a la Ley
        25.326 de Protección de Datos Personales. Podés retirar tu consentimiento en cualquier momento
        solicitando la baja.
      </P>

      <H2>5. Con quién compartimos tus datos</H2>
      <UL
        items={[
          'Green Plaza es el responsable de la base. La operación técnica de la Plataforma puede estar a cargo de proveedores que actúan por cuenta de Green Plaza, obligados a la confidencialidad.',
          'No vendemos ni cedemos tus datos personales a terceros con fines comerciales ajenos al club.',
          'Los locales adheridos no acceden a tu base de datos personal; solo validan tu credencial al momento de usar un beneficio.',
        ]}
      />

      <H2>6. Conservación</H2>
      <P>
        Conservamos tus datos mientras tu cuenta esté activa y durante el plazo necesario para cumplir con
        obligaciones legales. Si pedís la baja, los eliminamos o anonimizamos, salvo obligación legal de
        conservarlos.
      </P>

      <H2>7. Seguridad</H2>
      <P>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos no
        autorizados, pérdida o alteración.
      </P>

      <H2>8. Tus derechos</H2>
      <P>
        Tenés derecho a acceder, rectificar, actualizar y suprimir tus datos, y a solicitar su baja,
        escribiendo a <Mail />.
      </P>
      <P>
        El titular de los datos tiene la facultad de ejercer el derecho de acceso en forma gratuita a
        intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo. La AGENCIA DE ACCESO
        A LA INFORMACIÓN PÚBLICA, órgano de control de la Ley 25.326, tiene la atribución de atender las
        denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección
        de datos personales.
      </P>

      <H2>9. Datos de menores</H2>
      <P>
        La Plataforma está dirigida a mayores de 18 años. No recopilamos intencionalmente datos de menores sin
        autorización de sus representantes legales.
      </P>

      <H2>10. Cambios en esta Política</H2>
      <P>
        Podemos actualizar esta Política de Privacidad. Publicaremos los cambios en la Plataforma con su fecha
        de actualización.
      </P>

      <H2>11. Contacto</H2>
      <P>
        Por cualquier consulta sobre tus datos personales: <Mail />.
      </P>

      <p className="mt-8 border-t border-line-soft pt-5 text-[13px] italic leading-relaxed text-mute">
        Al registrarte en ClubPlaza declarás haber leído y aceptado los Términos y Condiciones y la Política de
        Privacidad.
      </p>
    </>
  );
}
