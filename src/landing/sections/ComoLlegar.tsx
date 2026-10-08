// landing/sections/ComoLlegar.tsx
// Mapa + cómo llegar a Green Plaza. Mobile-first: el mapa arriba a todo el
// ancho y debajo los modos de viaje como botones grandes (fáciles de tocar).
// En la compu: mapa a la izquierda, info a la derecha. Cada modo abre Google
// Maps con la ruta ya armada desde donde está la persona.

import { Bike, Bus, Car, Footprints, MapPin, Navigation } from 'lucide-react';
import { trackComoLlegar } from '../track';

// Destino tal como lo encuentra Google Maps. Si se quiere un pin exacto,
// reemplazar por coordenadas "lat,lng".
const DESTINO = 'Green Plaza, Ingeniero Maschwitz, Buenos Aires';
const q = encodeURIComponent(DESTINO);
const MAPA_EMBED = `https://www.google.com/maps?q=${q}&z=15&output=embed`;
const ruta = (modo: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=${modo}`;

const MODOS = [
  { id: 'driving', label: 'En auto', Icon: Car },
  { id: 'transit', label: 'Transporte', Icon: Bus },
  { id: 'bicycling', label: 'En bici', Icon: Bike },
  { id: 'walking', label: 'A pie', Icon: Footprints },
] as const;

export function ComoLlegar() {
  return (
    <section aria-labelledby="llegar-titulo" className="bg-white py-12 md:py-16">
      <div className="mx-auto grid max-w-[1080px] gap-6 px-5 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-10 md:px-[30px]">
        {/* Encabezado: en móvil va primero, en compu pasa a la columna derecha */}
        <div className="md:order-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-graytext">Cómo llegar</p>
          <h2 id="llegar-titulo" className="mt-1.5 text-[22px] font-extrabold leading-tight text-ink md:text-[30px]">
            Te esperamos en Green Plaza
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-[14px] text-graytext">
            <MapPin size={16} className="shrink-0 text-brand" aria-hidden="true" />
            Ingeniero Maschwitz, Buenos Aires
          </p>

          {/* Modos de viaje: 2x2 en móvil, botones grandes */}
          <p className="mt-6 text-[13px] font-bold text-ink">¿Cómo venís?</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {MODOS.map(({ id, label, Icon }) => (
              <a
                key={id}
                href={ruta(id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackComoLlegar(id)}
                className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 text-[14px] font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
              >
                <Icon size={20} className="shrink-0 text-brand" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>

          <a
            href={ruta('driving')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackComoLlegar('mapa')}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark active:scale-[0.99] md:w-auto"
          >
            <Navigation size={18} aria-hidden="true" />
            Abrir en Google Maps
          </a>
        </div>

        {/* Mapa */}
        <div className="overflow-hidden rounded-2xl border border-line-soft bg-fill shadow-sm md:order-1">
          <iframe
            title="Mapa de Green Plaza"
            src={MAPA_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block aspect-[4/3] w-full md:aspect-[16/11]"
          />
        </div>
      </div>
    </section>
  );
}
