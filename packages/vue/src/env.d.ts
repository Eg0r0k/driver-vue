/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

// The dev-only warnings read NODE_ENV when a bundler provides it; there is no
// Node dependency, so the global is declared here instead of via @types/node.
declare let process: { env?: Record<string, string | undefined> } | undefined;
