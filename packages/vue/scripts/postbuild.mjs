// vue-tsc emits declarations under dist/types mirroring src/. The package
// exports point at dist/index.d.ts and dist/hints.d.ts, so write thin
// re-export shims there (and .d.cts twins for the require condition).
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const dist = resolve(import.meta.dirname, "../dist");
mkdirSync(dist, { recursive: true });

// The entries import the stylesheet for the Vite build; that side-effect
// import has no place in the declarations (it would fail to resolve there).
const CSS_IMPORT = /^import ["']\.\/style\.css["'];?\r?\n/m;

for (const entry of ["index", "hints"]) {
  const file = resolve(dist, `types/${entry}.d.ts`);
  writeFileSync(file, readFileSync(file, "utf8").replace(CSS_IMPORT, ""));

  const body = `export * from "./types/${entry}.js";\n`;
  writeFileSync(resolve(dist, `${entry}.d.ts`), body);
  writeFileSync(resolve(dist, `${entry}.d.cts`), body);
}

// Node16-style resolution needs explicit extensions on relative specifiers,
// mapped onto the emitted declarations: `./core/driver` becomes
// `./core/driver.js` (found as driver.d.ts), `./X.vue` becomes `./X.vue.js`
// (found as X.vue.d.ts) and a directory becomes `./dir/index.js`. Bundler
// resolution accepts all of these too.
const withExtension = (fromFile, specifier) => {
  if (!specifier.startsWith(".") || /\.(js|mjs|cjs|json|css)$/.test(specifier)) {
    return specifier;
  }

  const base = resolve(dirname(fromFile), specifier);
  if (existsSync(`${base}.d.ts`)) {
    return `${specifier}.js`;
  }
  if (existsSync(join(base, "index.d.ts"))) {
    return `${specifier}/index.js`;
  }

  return specifier;
};

const walk = dir => {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) {
      walk(file);
    } else if (file.endsWith(".d.ts")) {
      const source = readFileSync(file, "utf8");
      const rewritten = source.replace(
        /(from\s+|import\s*\(\s*)(["'])([^"']+)(["'])/g,
        (_, prefix, open, specifier, close) => `${prefix}${open}${withExtension(file, specifier)}${close}`
      );
      writeFileSync(file, rewritten);
    }
  }
};

walk(resolve(dist, "types"));
