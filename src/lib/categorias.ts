// lib/categorias.ts
// Etiquetas y metadatos de presentación por categoría de promo.

import type { Categoria } from '@/types';

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  gastronomia: 'Gastronomía',
  indumentaria: 'Indumentaria',
  salud: 'Salud',
  cafe: 'Café',
  entretenimiento: 'Entretenimiento',
  otros: 'Otros',
};

export function labelCategoria(cat: Categoria): string {
  return CATEGORIA_LABEL[cat] ?? 'Otros';
}

// Rubros para los filtros del Home (incluye "Todos").
export const RUBROS: Array<{ value: Categoria | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'indumentaria', label: 'Indumentaria' },
  { value: 'salud', label: 'Salud' },
  { value: 'entretenimiento', label: 'Entretenimiento' },
  { value: 'cafe', label: 'Café' },
  { value: 'otros', label: 'Otros' },
];
