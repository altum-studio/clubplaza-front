/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  // Medición de la landing de pauta (/sumate). Si están vacías no se carga nada.
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_GA_ID?: string;
  readonly VITE_GADS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
