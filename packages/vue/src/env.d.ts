/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// The dev-only warnings read NODE_ENV when a bundler provides it; there is no
// Node dependency, so the global is declared here instead of via @types/node.
declare var process: { env?: Record<string, string | undefined> } | undefined;
