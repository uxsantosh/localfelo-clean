/// <reference types="vite/client" />

/**
 * ✅ STEP 3: Environment Variable Definitions
 * Type-safe access to environment variables
 */

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // ✅ WhatsApp Configuration
  readonly VITE_WHATSAPP_PROVIDER?: 'interakt' | 'twilio' | 'gupshup' | 'none';
  readonly VITE_WHATSAPP_API_URL?: string;
  readonly VITE_WHATSAPP_API_KEY?: string;
  
  // Other environment variables
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
