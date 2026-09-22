<p align="center"><img src="./logo.svg" width="120" alt="driver-vue" /></p>

# driver-vue monorepo

Vue 3 / Nuxt 4 port of [driver.js](https://github.com/nilbuild/driver.js) whose popover, overlay, highlight and hint beacons are Vue components you can replace, slot into and style.

| Package | Path | What |
| --- | --- | --- |
| `driver-vue` | `packages/vue` | The library: engine, composables, plugin, components, styles |
| `nuxt-driver-vue` | `packages/nuxt` | Nuxt 4 module: plugin, auto-imports, components, CSS |
| docs | `apps/docs` | VitePress site with guides, live demos and generated API |
| playground | `apps/nuxt-playground` | Nuxt 4 app consuming the module |

## Develop

```sh
pnpm install
pnpm build            # every package
pnpm test             # driver-vue unit tests (watch)
pnpm test:run         # all tests once
pnpm typecheck
pnpm docs:dev         # VitePress with live demos
pnpm play:nuxt        # Nuxt playground
```

Design notes: `docs/superpowers/specs/2026-09-22-driver-vue-design.md`.

## License

MIT. driver.js is © Kamran Ahmed, MIT.
