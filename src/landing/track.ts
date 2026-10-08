// landing/track.ts
// Medición de la landing de pauta. Todo es opt-in por variable de entorno:
//   VITE_META_PIXEL_ID  → Pixel de Meta
//   VITE_GA_ID          → Google Analytics 4
//   VITE_GADS_ID        → Google Ads
// Si no hay IDs no se carga ningún script de terceros y `track()` no hace nada.
//
// También captura los parámetros de campaña (utm_*, fbclid, gclid) para:
//  - pasarlos al link de registro (así la app sabe de qué anuncio vino el socio),
//  - guardarlos como "primer contacto" en localStorage (`clubplaza.utm`).

type Fbq = ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID?.trim();
const GA_ID = import.meta.env.VITE_GA_ID?.trim();
const GADS_ID = import.meta.env.VITE_GADS_ID?.trim();

const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
const UTM_STORAGE_KEY = 'clubplaza.utm';

function loadScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function initMetaPixel(id: string) {
  // Snippet oficial de Meta, tipado.
  if (window.fbq) return;
  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) (fbq.callMethod as (...a: unknown[]) => void)(...args);
    else fbq.queue!.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  loadScript('https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', id);
  fbq('track', 'PageView');
}

function initGtag(ids: string[]) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag necesita el objeto `arguments`, no un array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${ids[0]}`);
  window.gtag('js', new Date());
  for (const id of ids) window.gtag('config', id);
}

let started = false;

/** Arranca la medición (una sola vez). Sin IDs configurados, no hace nada. */
export function initTracking() {
  if (started) return;
  started = true;
  captureCampaign();
  if (PIXEL_ID) initMetaPixel(PIXEL_ID);
  const googleIds = [GA_ID, GADS_ID].filter((x): x is string => !!x);
  if (googleIds.length) initGtag(googleIds);
}

/** Toque en un botón de "Quiero mi credencial". `ubicacion` dice cuál (hero, sticky, final…). */
export function trackCtaClick(ubicacion: string) {
  window.fbq?.('trackCustom', 'ClickQuieroCredencial', { ubicacion });
  window.gtag?.('event', 'cta_click', { ubicacion });
}

/** Toque en "Sumate a la comunidad" de WhatsApp. */
export function trackWhatsappClick() {
  window.fbq?.('trackCustom', 'ClickWhatsapp');
  window.gtag?.('event', 'whatsapp_click');
}

/** Toque en "Cómo llegar" (modo: auto, transporte, bici, a pie, mapa). */
export function trackComoLlegar(modo: string) {
  window.fbq?.('trackCustom', 'ClickComoLlegar', { modo });
  window.gtag?.('event', 'como_llegar_click', { modo });
}

function currentCampaignParams(): URLSearchParams {
  const now = new URLSearchParams(window.location.search);
  const out = new URLSearchParams();
  for (const k of CAMPAIGN_KEYS) {
    const v = now.get(k);
    if (v) out.set(k, v);
  }
  return out;
}

// Guarda el primer contacto de campaña (no lo pisa si ya existe).
function captureCampaign() {
  try {
    const params = currentCampaignParams();
    if ([...params.keys()].length === 0) return;
    if (localStorage.getItem(UTM_STORAGE_KEY)) return;
    localStorage.setItem(
      UTM_STORAGE_KEY,
      JSON.stringify({ ...Object.fromEntries(params), landing: '/sumate', ts: new Date().toISOString() }),
    );
  } catch {
    /* localStorage no disponible (modo privado): seguimos sin guardar */
  }
}

/** Devuelve `path` con los parámetros de campaña de la visita actual pegados. */
export function withCampaign(path: string): string {
  const params = currentCampaignParams();
  const qs = params.toString();
  if (!qs) return path;
  return path + (path.includes('?') ? '&' : '?') + qs;
}
