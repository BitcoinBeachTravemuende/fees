/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_MEMPOOL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
