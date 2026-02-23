/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TABLET_MANIFEST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
