// data/mock.ts
// Datos mock para desarrollo mientras el backend de Supabase no está conectado.
// Respetan EXACTAMENTE la forma de los tipos (types/index.ts) que devolverá la API.

import type { Promo, Socio } from '@/types';

// Ruta a los logos reales de cada local (en public/locales/<slug>.svg).
// El slug coincide con slugify(nombre) para que el marquee resuelva solo.
const logo = (slug: string) => `${import.meta.env.BASE_URL}locales/${slug}.svg`;

// Días de la semana (0=Dom … 6=Sáb) para el campo `dias`.
const TODOS = [0, 1, 2, 3, 4, 5, 6];
const LUN_VIE = [1, 2, 3, 4, 5];
const LUN_SAB = [1, 2, 3, 4, 5, 6];
const FINDE = [5, 6, 0];

// Pasos genéricos: con credencial vs. pagando con un banco.
const PASOS_CRED = [
  'Mostrá tu credencial digital en la caja',
  'El local valida tu credencial y tu DNI',
  'Aplican el beneficio. ¡Listo!',
];
const PASOS_BANCO = [
  'Mostrá tu credencial digital al pagar',
  'Pagá con la tarjeta del banco indicado',
  'Se aplica el descuento / las cuotas',
];

// Factory para no repetir la forma de Promo (mock; el backend la traerá de Supabase).
let _id = 0;
const mk = (
  categoria: Promo['categoria'],
  local: string,
  slug: string,
  titulo: string,
  descripcion: string,
  dias: number[],
  pasos: string[] = PASOS_CRED,
): Promo => ({
  id: String(++_id),
  titulo,
  descripcion,
  categoria,
  local_nombre: local,
  local_logo_url: logo(slug),
  imagen_url: '',
  vigente_desde: '2026-06-01',
  vigente_hasta: '2026-12-31',
  dias,
  como_usar: pasos,
  es_mundialista: false,
  activo: true,
});

export const MOCK_PROMOS: Promo[] = [
  // ── Gastronomía ──────────────────────────────────────────────
  mk('gastronomia', 'Bruce', 'bruce', '2x1 en hamburguesas', 'Pedís una hamburguesa y te llevás dos. De lunes a jueves.', [1, 2, 3, 4]),
  mk('gastronomia', 'Almacen de Pizzas', 'almacen-de-pizzas', 'Pizza grande + bebida', 'Llevate una pizza grande con bebida a precio fijo, todos los días.', TODOS),
  mk('gastronomia', 'Kaia Sushi', 'kaia-sushi', '20% OFF en combinados', 'Descuento en combinados de sushi para llevar o comer en el local.', [3, 4]),
  mk('gastronomia', 'Persicco', 'persicco', '2x1 en helados', 'Llevá dos helados de especialidad al precio de uno.', TODOS),
  mk('gastronomia', 'Juan Valdez Cafe', 'juan-valdez-cafe', 'Café + medialuna', 'Tu café de especialidad con medialuna sin costo extra. De lunes a viernes.', LUN_VIE),
  mk('gastronomia', 'Pannus', 'pannus', '15% OFF en panadería', 'Descuento en panadería y bollería recién horneada.', TODOS),
  mk('gastronomia', 'La Juvenil', 'la-juvenil', '10% OFF en pastas frescas', 'Descuento en toda la línea de pastas frescas. Fin de semana.', FINDE),
  mk('gastronomia', 'SomosPalta', 'somospalta', 'Bowl saludable 20% OFF', 'Descuento en bowls y opciones de gastronomía natural. De lunes a viernes.', LUN_VIE),
  mk('gastronomia', 'crumBread', 'crumbread', '3ra milanesa a mitad de precio', 'Pedís dos milanesas y la tercera sale al 50%. Sábados y domingos.', [6, 0]),
  mk('gastronomia', 'Ramallo Club', 'ramallo-club', '2x1 en sándwiches de miga', 'Docena de sándwiches de miga al 2x1, todos los días.', TODOS),

  // ── Almacén ──────────────────────────────────────────────────
  mk('almacen', 'Super2000', 'super2000', '15% OFF en la 2da unidad', 'Llevando dos productos iguales, el segundo tiene 15% de descuento.', TODOS),
  mk('almacen', 'Deli Moon', 'deli-moon', '10% OFF en kiosco', 'Descuento en golosinas, bebidas y artículos de kiosco.', TODOS),
  mk('almacen', 'Eneldo', 'eneldo', '20% OFF en dietética', 'Descuento en productos de dietética seleccionados. De lunes a viernes.', LUN_VIE),
  mk('almacen', 'Matilda', 'matilda', '2x1 en libros seleccionados', 'Llevá dos libros de la mesa destacada al precio de uno.', TODOS),

  // ── Salud y Bienestar ────────────────────────────────────────
  mk('salud', 'Farmacia Maschwitz', 'farmacia-maschwitz', '15% OFF en perfumería', 'Descuento en perfumería y cuidado personal. No acumulable con obra social.', LUN_VIE),
  mk('salud', 'Concept Vision', 'concept-vision', '30% OFF en armazones', 'Descuento en armazones seleccionados al comprar tus lentes recetados.', TODOS),
  mk('salud', 'SportClub', 'sportclub', '1er mes de gimnasio gratis', 'Inscribite y el primer mes corre por nuestra cuenta.', TODOS),

  // ── Hogar y Mascotas ─────────────────────────────────────────
  mk('hogar', 'MaxiPet', 'maxipet', '20% OFF en alimento premium', 'Descuento en alimento premium para perros y gatos.', TODOS),
  mk('hogar', 'El Candil', 'el-candil', '20% OFF en plantas', 'Descuento en plantas, macetas y artículos de jardín. Fin de semana.', FINDE),
  mk('hogar', 'Mapache', 'mapache', '15% OFF en pinturas', 'Descuento en pinturas y accesorios para tu hogar. De lunes a sábado.', LUN_SAB),

  // ── Servicios ────────────────────────────────────────────────
  mk('servicios', 'Nyra', 'nyra', '25% OFF en faciales', 'Descuento en tratamientos faciales del centro de estética. De lunes a viernes.', LUN_VIE),
  mk('servicios', 'BoyCut barbershop', 'boycut-barbershop', 'Corte + barba combo', 'Corte de pelo y arreglo de barba a precio combinado, todos los días.', TODOS),

  // ── Tecnología y Movilidad ───────────────────────────────────
  mk('tecnologia', 'iTech', 'itech', '3 cuotas sin interés', 'En toda la línea de tecnología, con todas las tarjetas.', TODOS),
  mk('tecnologia', 'BYD', 'byd', 'Bonificación en patentamiento', 'Llevando tu 0km, bonificamos parte del patentamiento.', TODOS),

  // ── Pagando con banco (para probar) ──────────────────────────
  mk('almacen', 'Super2000', 'super2000', '25% OFF con Banco Galicia', 'Pagando con tarjetas Banco Galicia. Jueves, viernes y sábados.', [4, 5, 6], PASOS_BANCO),
  mk('gastronomia', 'Persicco', 'persicco', '30% OFF con Santander', 'Pagando con tarjetas Santander los lunes. Tope de reintegro por operación.', [1], PASOS_BANCO),
  mk('tecnologia', 'iTech', 'itech', '12 cuotas con BBVA', '12 cuotas sin interés en tecnología pagando con tarjetas BBVA.', TODOS, PASOS_BANCO),
  mk('gastronomia', 'Bruce', 'bruce', '20% OFF con Banco Nación', 'Descuento pagando con tarjetas Banco Nación. Solo los miércoles.', [3], PASOS_BANCO),
  mk('salud', 'Concept Vision', 'concept-vision', '6 cuotas con Banco Macro', 'Financiá tus lentes en 6 cuotas sin interés con tarjetas Banco Macro.', TODOS, PASOS_BANCO),
];

// Directorio de locales de Green Plaza (para el marquee de logos).
// TODO BACKEND: traer de la tabla `locales` (con logo real). Por ahora sin logo
// (se muestra el monograma). Orden por código; L.01 y St.05 (sin definir) se omiten.
export const MOCK_LOCALES: { nombre: string; logo_url: string }[] = [
  { nombre: 'Farmacia Maschwitz', logo_url: logo('farmacia-maschwitz') }, // L.02 · Farmacia
  { nombre: 'Pannus', logo_url: logo('pannus') }, // L.03 · Panadería
  { nombre: 'La Juvenil', logo_url: logo('la-juvenil') }, // L.04 · Fábrica de pastas
  { nombre: 'Deli Moon', logo_url: logo('deli-moon') }, // L.05 · Kiosco
  { nombre: 'Mapache', logo_url: logo('mapache') }, // L.06y07 · Pinturería
  { nombre: 'Eneldo', logo_url: logo('eneldo') }, // L.08y09 · Dietética
  { nombre: 'MaxiPet', logo_url: logo('maxipet') }, // L.10 · Petshop
  { nombre: 'Matilda', logo_url: logo('matilda') }, // L.11 · Librería
  { nombre: 'Bruce', logo_url: logo('bruce') }, // L.12 · Hamburguesería
  { nombre: 'SomosPalta', logo_url: logo('somospalta') }, // L.13 · Gastronomía natural
  { nombre: 'Super2000', logo_url: logo('super2000') }, // L.14 · Supermercado
  { nombre: 'Persicco', logo_url: logo('persicco') }, // L.15 · Heladería
  { nombre: 'Almacen de Pizzas', logo_url: logo('almacen-de-pizzas') }, // L.16 · Pizzería
  { nombre: 'Juan Valdez Cafe', logo_url: logo('juan-valdez-cafe') }, // L.17 · Café
  { nombre: 'Kaia Sushi', logo_url: logo('kaia-sushi') }, // L.18 · Sushi
  { nombre: 'Concept Vision', logo_url: logo('concept-vision') }, // L.19 · Óptica
  { nombre: 'SportClub', logo_url: logo('sportclub') }, // L.20 · Gimnasio
  { nombre: 'Nyra', logo_url: logo('nyra') }, // L.21 · Centro de estética
  { nombre: 'El Candil', logo_url: logo('el-candil') }, // St.01 · Vivero
  { nombre: 'iTech', logo_url: logo('itech') }, // St.02 · Tecnología
  { nombre: 'crumBread', logo_url: logo('crumbread') }, // St.03 · Milanesería
  { nombre: 'BoyCut barbershop', logo_url: logo('boycut-barbershop') }, // St.04 · Barbería
  { nombre: 'Ramallo Club', logo_url: logo('ramallo-club') }, // St.06 · Sándwich de miga
  { nombre: 'BYD', logo_url: logo('byd') }, // St.07 · Concesionaria
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
