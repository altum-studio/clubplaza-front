// components/brand/IsoDrawLoader.tsx
// Loader del splash: el isotipo de ClubPlaza se DIBUJA en loop (efecto línea).
// Un "fantasma" del logo al 25% queda de fondo; encima, dos trazos se dibujan y
// se borran en bucle. Portado de la animación de referencia (Green Lagos), sin el
// rectángulo tapa-artefacto (que necesitaba fondo sólido): usamos joins/caps
// redondeados para evitar el pico del miter, así funciona sobre la foto.

// Paths del isotipo (viewBox 141). P1 = anillo con muesca, P2 = trazo interior.
const P1 =
  'M61.2499 66.24L87.3099 43.54L129.87 87.32C122.49 113.24 98.6399 132.22 70.3599 132.22C36.1999 132.22 8.49988 104.52 8.49988 70.36C8.49988 36.2 36.1999 8.5 70.3599 8.5C104.52 8.5 132.22 36.2 132.22 70.36';
const P2 =
  'M14.4398 49.03C14.4398 49.03 39.9598 42.08 50.4298 52.37C59.5898 61.37 64.2699 72.26 64.6999 82.19C64.6999 82.19 80.4099 85 84.0099 103.01C87.0099 117.98 76.7798 129.13 76.7798 129.13';

const STROKE = 12; // en unidades del viewBox (141) — trazo fino

interface Props {
  size?: number;
  color?: string;
  /** Duración del ciclo (default 3s). */
  speed?: string;
}

function pathProps(color: string) {
  return {
    stroke: color,
    strokeWidth: STROKE,
    strokeMiterlimit: 10,
    fill: 'none',
  };
}

export function IsoDrawLoader({ size = 122, color = '#fff', speed = '3s' }: Props) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size, overflow: 'clip', ['--cp-iso-speed' as string]: speed }}
      aria-hidden="true"
    >
      {/* Fantasma del logo (queda de fondo mientras se dibuja) */}
      <svg viewBox="0 0 141 141" className="absolute inset-0 h-full w-full" style={{ opacity: 0.25 }}>
        <path d={P1} {...pathProps(color)} />
        <path d={P2} {...pathProps(color)} />
      </svg>

      {/* Trazo animado */}
      <div className="absolute inset-0" style={{ overflow: 'clip' }}>
        <svg viewBox="0 0 141 141" className="absolute inset-0 h-full w-full">
          <path className="cp-iso-p1" d={P1} {...pathProps(color)} />
        </svg>

        {/* Path-2 recortado a un círculo (esconde sus puntas tras el anillo). */}
        <div
          className="absolute"
          style={{
            width: `calc(100% - ${STROKE}px)`,
            height: `calc(100% - ${STROKE}px)`,
            top: STROKE / 2,
            left: STROKE / 2,
            borderRadius: '100%',
            overflow: 'clip',
          }}
        >
          <svg
            viewBox="0 0 141 141"
            className="absolute"
            style={{
              width: `calc(100% + ${STROKE}px)`,
              height: `calc(100% + ${STROKE}px)`,
              top: -STROKE / 2,
              left: -STROKE / 2,
            }}
          >
            <path className="cp-iso-p2" d={P2} {...pathProps(color)} />
          </svg>
        </div>
      </div>
    </div>
  );
}
