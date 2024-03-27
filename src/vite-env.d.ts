/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_MEMPOOL: string
  // readonly VITE_URL_RPC_EXPLORER: string
  readonly VITE_URL_ESPLORA: string
  readonly VITE_URL_BITGO: string
  readonly VITE_URL_BLOCKCYPHER: string
  readonly VITE_URL_BLOCKCHAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
