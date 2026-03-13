/// <reference types="vite/client" />

// Type declaration for App module alias
declare module 'App' {
  import App from '../App';
  export default App;
}

// Type declarations for figma:asset imports (development only)
declare module 'figma:asset/*' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_VERSION: string
  readonly VITE_BUILD_TIME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}