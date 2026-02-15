/// <reference types="vite/client" />

// Type declarations for figma:asset imports (development only)
declare module 'figma:asset/*' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}