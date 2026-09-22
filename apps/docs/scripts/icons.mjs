// Renders the PNG icons the docs need (favicon, apple touch icon, social
// image) from the repository logo, so `logo.svg` at the root stays the single
// source. Runs as part of the docs build.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const root = resolve(import.meta.dirname, "../../..");
const publicDir = resolve(import.meta.dirname, "../public");
const svg = readFileSync(resolve(root, "logo.svg"), "utf8");

const sizes = [
  ["favicon-32.png", 32],
  ["favicon-192.png", 192],
  ["apple-touch-icon.png", 180],
  ["logo-512.png", 512],
];

for (const [name, size] of sizes) {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(resolve(publicDir, name), png);
}

writeFileSync(resolve(publicDir, "logo.svg"), svg);
writeFileSync(resolve(publicDir, "favicon.svg"), svg);
console.log(`icons: ${sizes.map(([name]) => name).join(", ")}, logo.svg, favicon.svg`);
