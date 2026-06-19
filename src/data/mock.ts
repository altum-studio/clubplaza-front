// data/mock.ts
// Datos mock para desarrollo mientras el backend de Supabase no está conectado.
// Respetan EXACTAMENTE la forma de los tipos (types/index.ts) que devolverá la API.

import type { Promo, Socio } from '@/types';

export const MOCK_PROMOS: Promo[] = [
  {
    id: '1',
    titulo: '2x1 en hamburguesas',
    descripcion:
      'Pedís una hamburguesa y te llevás dos. Válido de lunes a jueves, en el local de Planta Baja.',
    categoria: 'gastronomia',
    local_nombre: 'Deli Moon',
    local_logo_url: '',
    imagen_url: '',
    vigente_desde: '2026-06-01',
    vigente_hasta: '2026-07-15',
    dias: [1, 2, 3, 4], // lunes a jueves
    como_usar: [
      'Mostrá tu credencial digital en la caja',
      'El local valida tu credencial y tu DNI',
      'Aplican el beneficio. ¡Listo!',
    ],
    es_mundialista: false,
    activo: true,
  },
  {
    id: '2',
    titulo: '20% OFF en toda la tienda',
    descripcion: 'Descuento en toda la colección de temporada. Sobre productos seleccionados.',
    categoria: 'indumentaria',
    local_nombre: 'Nyra',
    local_logo_url: '',
    imagen_url: '',
    vigente_desde: '2026-06-01',
    vigente_hasta: '2026-06-30',
    dias: [0, 1, 2, 3, 4, 5, 6], // todos los días
    como_usar: [
      'Mostrá tu credencial digital al vendedor',
      'Se aplica el 20% sobre el total de la compra',
    ],
    es_mundialista: false,
    activo: true,
  },
  {
    id: '3',
    titulo: '15% OFF en farmacia',
    descripcion: 'Descuento en perfumería y cuidado personal. No acumulable con obra social.',
    categoria: 'salud',
    local_nombre: 'Farmacia Maschwitz',
    local_logo_url: '',
    imagen_url: '',
    vigente_desde: '2026-06-01',
    vigente_hasta: '2026-08-31',
    dias: [1, 2, 3, 4, 5], // días de semana
    como_usar: ['Mostrá tu credencial digital en la caja', 'Aplican el 15% sobre productos seleccionados'],
    es_mundialista: false,
    activo: true,
  },
  {
    id: '4',
    titulo: '3 cuotas sin interés',
    descripcion: 'En toda la línea de tecnología. Con todas las tarjetas.',
    categoria: 'entretenimiento',
    local_nombre: 'iTech',
    local_logo_url: '',
    imagen_url: '',
    vigente_desde: '2026-06-01',
    vigente_hasta: '2026-07-31',
    dias: [0, 1, 2, 3, 4, 5, 6], // todos los días
    como_usar: ['Mostrá tu credencial al pagar', 'Elegí 3 cuotas sin interés en la terminal'],
    es_mundialista: false,
    activo: true,
  },
  {
    id: '5',
    titulo: '20% OFF en plantas',
    descripcion: 'Descuento en plantas, macetas y artículos de jardín.',
    categoria: 'otros',
    local_nombre: 'El Candil',
    local_logo_url: '',
    imagen_url: '',
    vigente_desde: '2026-06-01',
    vigente_hasta: '2026-06-30',
    dias: [5, 6, 0], // fin de semana (vie/sáb/dom)
    como_usar: ['Mostrá tu credencial en la caja', 'Aplican el 20% sobre plantas y jardín'],
    es_mundialista: false,
    activo: true,
  },
  {
    id: '6',
    titulo: '2x1 en café',
    descripcion: 'Llevá dos cafés al precio de uno. Todos los días hasta las 12h.',
    categoria: 'cafe',
    local_nombre: 'Persicco',
    local_logo_url: '',
    imagen_url: '',
    vigente_desde: '2026-06-01',
    vigente_hasta: '2026-07-15',
    dias: [0, 1, 2, 3, 4, 5, 6], // todos los días
    como_usar: ['Mostrá tu credencial en el mostrador', 'Válido para café de especialidad'],
    es_mundialista: false,
    activo: true,
  },
];

// Directorio de locales de Green Plaza (para el marquee de logos).
// TODO BACKEND: traer de la tabla `locales` (con logo real). Por ahora sin logo
// (se muestra el monograma). "L.13 (sin alquilar)" no se incluye.
export const MOCK_LOCALES: { nombre: string; logo_url: string }[] = [
  { nombre: 'Origen', logo_url: '' },
  { nombre: 'Farmacia Maschwitz', logo_url: '' },
  { nombre: 'Pannus', logo_url: '' },
  { nombre: 'La Juvenil', logo_url: '' },
  { nombre: 'Deli Moon', logo_url: '' },
  { nombre: 'Mapache', logo_url: '' },
  { nombre: 'Eneldo', logo_url: '' },
  { nombre: 'MaxiPet', logo_url: '' },
  { nombre: 'Matilda', logo_url: '' },
  { nombre: 'Bruce', logo_url: '' },
  { nombre: 'Super2000', logo_url: '' },
  { nombre: 'Persicco', logo_url: '' },
  { nombre: 'ADP y JVC', logo_url: '' },
  { nombre: 'Kaia Sushi', logo_url: '' },
  { nombre: 'Concept Vision', logo_url: '' },
  { nombre: 'SportClub', logo_url: '' },
  { nombre: 'Nyra', logo_url: '' },
  { nombre: 'El Candil', logo_url: '' },
  { nombre: 'iTech', logo_url: '' },
  { nombre: 'crumBread', logo_url: '' },
  { nombre: 'Ramallo Club', logo_url: '' },
];

export const MOCK_SOCIO: Socio = {
  id: 'mock-123',
  nombre: 'María González',
  email: 'maria@email.com',
  celular: '+54 9 11 1234-5678',
  dni: '30123456',
  fecha_nacimiento: '1990-05-15',
  numero_socio: 'GP-8K2D-4F9X',
  token_qr: 'clubplaza-token-mock-123',
  created_at: new Date('2026-06-01T12:00:00Z').toISOString(),
};
