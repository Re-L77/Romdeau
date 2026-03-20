/// <reference types="vite/client" />

declare module "@tailwindcss/vite";

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
