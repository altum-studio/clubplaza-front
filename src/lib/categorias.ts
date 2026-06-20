// lib/categorias.ts
// Etiquetas y metadatos de presentación por rubro de promo (tabla Green Plaza).

import type { Categoria } from '@/types';

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  gastronomia: 'Gastronomía',
  almacen: 'Almacén',
  salud: 'Salud y Bienestar',
  hogar: 'Hogar y Mascotas',
  servicios: 'Servicios',
  tecnologia: 'Tecnología y Movilidad',
};

export function labelCategoria(cat: Categoria): string {
  return CATEGORIA_LABEL[cat] ?? cat;
}

// Rubros para el filtro del Home (la 1ra opción resetea a "todos").
export const RUBROS: Array<{ value: Categoria | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos los rubros' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'almacen', label: 'Almacén' },
  { value: 'salud', label: 'Salud y Bienestar' },
  { value: 'hogar', label: 'Hogar y Mascotas' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'tecnologia', label: 'Tecnología y Movilidad' },
];
