declare module '*.svg?raw' {
  const content: string;
  export default content;
}
declare module '*.hbs?raw' {
  const content: string;
  export default content;
}
declare module '*?raw' {
  const content: string;
  export default content;
}
declare module '*.pcss' {
  const content: { [className: string]: string };
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly [key: string]: unknown;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
