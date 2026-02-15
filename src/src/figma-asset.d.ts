// Type declarations for figma:asset imports (used during development)
// These are ignored during production builds via vite.config.ts external setting

declare module 'figma:asset/*' {
  const content: string;
  export default content;
}
