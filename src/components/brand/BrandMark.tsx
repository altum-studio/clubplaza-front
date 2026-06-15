// components/brand/BrandMark.tsx
// Isotipo sólido de Green Plaza + variante "loader" que se dibuja siguiendo su
// propio trazo (animación del splash, tomada del wireflow: morph A).

import { useId } from 'react';
import { ISO_PATH, ISO_VIEWBOX } from './isoPath';

interface BrandMarkProps {
  size?: number;
  color?: string;
  /** Si true, el logo se "dibuja" en loop (para el splash). */
  animated?: boolean;
}

export function BrandMark({ size = 120, color = '#fff', animated = false }: BrandMarkProps) {
  const rid = useId().replace(/:/g, '');
  const maskId = `cpm-${rid}`;

  if (!animated) {
    return (
      <svg viewBox={ISO_VIEWBOX} width={size} height={size} style={{ display: 'block' }}>
        <path d={ISO_PATH} fill={color} />
      </svg>
    );
  }

  return (
    <svg
      viewBox={ISO_VIEWBOX}
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <path
            className="cp-pen"
            d={ISO_PATH}
            pathLength={100}
            fill="none"
            stroke="#fff"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={100}
          />
        </mask>
      </defs>
      <path d={ISO_PATH} fill={color} mask={`url(#${maskId})`} />
    </svg>
  );
}
