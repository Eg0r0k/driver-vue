// vue-tsc emits declarations under dist/types mirroring src/. The package
// exports point at dist/index.d.ts and dist/hints.d.ts, so write thin
// re-export shims there (and .d.cts twins for the require condition).
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(import.meta.dirname, "../dist");
mkdirSync(dist, { recursive: true });

for (const entry of ["index", "hints"]) {
  const body = `export * from "./types/${entry}";\nexport { default } from "./types/${entry}";\n`;
  writeFileSync(resolve(dist, `${entry}.d.ts`), body);
  writeFileSync(resolve(dist, `${entry}.d.cts`), body);
}
