/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
