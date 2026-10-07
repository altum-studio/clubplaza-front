// landing/links.ts
// Destinos de la landing. Todos apuntan a la app (mismo dominio), respetando el
// BASE_URL del build. El registro lleva los parámetros de campaña pegados.

import { withCampaign } from './track';

const BASE = import.meta.env.BASE_URL;

export const urlRegistro = () => withCampaign(`${BASE}registro`);
export const URL_INGRESAR = `${BASE}ingresar`;
export const URL_BENEFICIOS = `${BASE}beneficios`;
export const URL_TERMINOS = `${BASE}terminos`;

/** La propia landing, con la campaña actual (para el QR "seguí en tu celular"). */
export const urlLandingAbsoluta = () => withCampaign(`${window.location.origin}${BASE}sumate`);

// Mismo canal que usa el Home de la app ("Sumate a la comunidad").
export const URL_WHATSAPP = 'https://whatsapp.com/channel/0029Vb8ZC3GKWEKxW7QxLN3l';

export const IMG_HERO_MOBILE = `${BASE}landing/hero-mobile.jpg`;
export const IMG_HERO_DESKTOP = `${BASE}landing/hero-desktop.jpg`;
