interface ImportMetaEnv {
  readonly VITE_API_KEY?: string;
  // add other VITE_ vars here as needed
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
