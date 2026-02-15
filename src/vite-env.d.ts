/// <reference types="vite/client" />

// Type declarations for figma:asset imports (development only)
declare module 'figma:asset/*' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// SVG imports
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Explicitly declare services modules to help TypeScript resolution
declare module '../services/chat' {
  export * from './services/chat';
}

declare module './services/chat' {
  export * from '../services/chat.d';
}