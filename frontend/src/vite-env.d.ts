/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPIDERFOOT_API_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_KEY?: string
  readonly VITE_SUPABASE_REDIRECT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
