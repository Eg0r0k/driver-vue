# driver-vue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Vue 3 / Nuxt 4 port of driver.js 1.8 whose popover, overlay, stage and hint beacons are Vue components (slots, per-step components, headless state), with full behavioural parity, Vitest tests and VitePress docs.

**Architecture:** The upstream engine (`driver.ts`, `context.ts`, `step.ts`, `highlight.ts`, `events.ts`, `hints.ts`) is ported almost 1:1 but writes to a `shallowReactive` state instead of creating DOM. `<DriverTour>` / `<DriverHints>` teleport into `body` and render `<DriverOverlay>`, `<DriverStage>`, `<DriverPopover>` from that state; `<DriverPopover>` is positioned by Floating UI through `useDriverPosition`. A Vue plugin provides defaults and a shared instance; the Nuxt module wires the plugin, auto-imports and CSS.

**Tech Stack:** pnpm workspace + turbo, TypeScript 6, Vue 3.5, Vite + `@vitejs/plugin-vue` (lib build) + `vue-tsc`, `@floating-ui/vue`, Vitest 4 + happy-dom + `@vue/test-utils`, `@nuxt/kit` + `@nuxt/module-builder`, VitePress 1.6, `typedoc` + `typedoc-plugin-markdown`, `vue-component-meta`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-22-driver-vue-design.md` (read it first).
- Upstream source for reference: `F:\driver.js-upstream\packages\driver\src` and `tests`.
- Package names: `driver-vue` (packages/vue), `nuxt-driver-vue` (packages/nuxt).
- Vue `>=3.5`, Nuxt `^4`. Composition API + `<script setup lang="ts">` only. SFC order: script → template → style.
- Keep upstream class names, ids, aria attributes and body classes exactly (see spec §4.6, §4.8).
- Keep upstream `Config`, `DriveStep`, `Popover`, `Driver`, `Hints*` type names and members; additions listed in spec §4.4.
- `title`/`description` render with `v-html` (parity). Slots are the safe alternative.
- Every engine function touching `window`/`document` must be SSR-safe.
- Tests: Vitest, `happy-dom`, `@vue/test-utils`; assert behaviour through DOM, no snapshot-only tests.
- Commit after every task with a conventional message.

---

## File map

```
packages/vue/
  package.json, tsconfig.json, vite.config.ts, vitest.config.ts, typedoc.json
  src/
    index.ts                 public entry (tour)
    hints.ts                 public entry (hints)
    style.css                all default styles + CSS variables
    types.ts                 Config, DriveStep, Popover, Side, Alignment, AllowedButtons, DriverHook, HookOpts, State,
                             StageRect, PopoverRenderModel, PopoverDOM, DriverState, Driver
    core/context.ts          createContext: config store, reactive state store, internal store, emitter, hook opts
    core/utils.ts            resolveElement, isScrollable, easeInOutQuad, getFocusableElements, bringInView, isElementVisible, isBrowser
    core/stage.ts            generateStageSvgPathString(stage, {padding, radius}, viewport)
    core/step.ts             shouldSkipStep, findReachableIndex, resolveNextHook/PrevHook/CloseHook, resolveTourStep,
                             resolveStepPopover → PopoverRenderModel
    core/highlight.ts        highlight, refreshActiveHighlight, transferHighlight (rAF loop → state.stage), destroyHighlight
    core/events.ts           initEvents/destroyEvents/requireRefresh (keyboard, focus trap, resize/scroll, document click)
    core/driver.ts           createDriver(config): Driver  (+ export const driver = createDriver)
    core/hints.ts            createHints(config): Hints with reactive HintsState
    composables/useDriver.ts
    composables/useHints.ts
    composables/useDriverPosition.ts
    composables/useTeleportTarget.ts   resolves teleportTo + client-only flag
    plugin.ts                DriverPlugin, createDriverPlugin, DRIVER_KEY, DRIVER_DEFAULTS_KEY, provideDriver, injectDriver
    components/DriverTour.vue
    components/DriverOverlay.vue
    components/DriverStage.vue
    components/DriverPopover.vue
    components/DriverHints.vue
    components/DriverHintBeacon.vue
    components/types.ts      TourSlotProps, HintSlotProps
  tests/
    utils.ts                 harness (DEMO_HTML, SAMPLE_STEPS, createDriver mounting <DriverTour>, nextFrame, queries)
    *.test.ts                one file per upstream suite + new suites (see Task 11–12)
packages/nuxt/
  package.json, tsconfig.json, build.config.ts
  src/module.ts, src/runtime/plugin.ts
apps/docs/            VitePress (Task 14)
apps/nuxt-playground/ Nuxt 4 app (Task 13)
scripts/component-meta.mjs   vue-component-meta → apps/docs/api/components.md
```

---

### Task 1: Workspace scaffold

**Files:** root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.npmrc`, `.prettierrc`, `packages/vue/package.json`, `packages/vue/tsconfig.json`, `packages/vue/vite.config.ts`, `packages/vue/vitest.config.ts`, `packages/vue/src/index.ts` (placeholder export), `packages/vue/tests/smoke.test.ts`.

**Produces:** a workspace where `pnpm -F driver-vue test:run` runs a Vue component test with happy-dom, `pnpm -F driver-vue build` emits `dist/index.mjs`, `dist/index.cjs`, `dist/hints.*`, `dist/style.css`, `dist/*.d.ts`.

- [ ] Write root files; `packages/vue/package.json` with `exports` for `.`, `./hints`, `./style.css`, `peerDependencies: { vue: ">=3.5.0" }`, `dependencies: { "@floating-ui/vue": "^2" }`.
- [ ] `vite.config.ts`: `build.lib` with entries `index` and `hints`, `formats: ['es','cjs']`, `rollupOptions.external: ['vue', '@floating-ui/vue', '@floating-ui/dom']`, `cssFileName: 'style'`; `vite-plugin-dts`-free: run `vue-tsc --declaration --emitDeclarationOnly` for types.
- [ ] `tests/smoke.test.ts`: mount `defineComponent` rendering `<div>hi</div>`, assert text. Run: `pnpm -F driver-vue test:run` → PASS.
- [ ] Commit `chore: scaffold workspace and driver-vue package`.

### Task 2: Types + context + utils + stage path

**Files:** `src/types.ts`, `src/core/context.ts`, `src/core/utils.ts`, `src/core/stage.ts`; tests `tests/context.test.ts`, `tests/stage.test.ts`, `tests/utils.test.ts`.

**Produces:**
```ts
createContext(options?: Config): Context
interface Context {
  getConfig: GetConfig; setConfig(config?: Config): void
  state: DriverState                       // shallowReactive
  getState: GetState; setState: SetState; resetState(): void   // State = public + __ internals (upstream shape)
  listen/emit/resetEmitter; getDriver/setDriver; getHookOpts(stateOverride?)
}
generateStageSvgPathString(stage: StageRect, options: { padding; radius }, viewport?: { width; height }): string
```
`setState` writes public keys into `state` (reactive) and `__` keys into a plain object; `getState()` merges both for hook opts. `resetState()` resets both and sets `state.isActive=false, stage=undefined, popover=undefined, transitioning=false`.

- [ ] Port `context.test.ts` and `stage.test.ts` from upstream (same cases), add a reactivity test: `watch(() => ctx.state.activeIndex)` fires on `setState('activeIndex', 1)`.
- [ ] Implement; run tests; commit `feat(core): context, utils, stage geometry`.

### Task 3: Step resolution + engine (driver) + highlight + events

**Files:** `src/core/step.ts`, `src/core/highlight.ts`, `src/core/events.ts`, `src/core/driver.ts`; tests `tests/engine.test.ts` (engine-level tests without components: navigation, hooks order, skip-missing, wait-for-element, keyboard events, state exposure).

**Produces:** `createDriver(config?: Config): Driver` where `Driver` has all upstream methods plus `state: DriverState` and internal `__reportPopoverDom(dom: PopoverDOM): void` (called by `<DriverPopover>` after mount; runs `onPopoverRender`). `resolveStepPopover(ctx, element, step): PopoverRenderModel`. `highlight()` sets `state.popover` either immediately or at the halfway point of an animated transfer (upstream `hasDelayedPopover`), hides it (`state.popover = undefined`) at transfer start. Overlay click / next / prev / close reach the engine through `ctx.emit('overlayClick')` etc. — expose `driver.__emit(event)`? No: expose handlers on the popover model (`onNextClick`, `onPrevClick`, `onCloseClick`) and `driver.__overlayClick()`.

- [ ] Port from upstream verbatim where possible; replace `renderStepPopover` with `ctx.setState('popover', resolveStepPopover(...))`, `hidePopover` with `ctx.setState('popover', undefined)`, `trackActiveElement/transitionStage` with writes to `state.stage` + `state.transitioning`, `refreshOverlay` with `state.refreshTick++`.
- [ ] Tests: port `navigation`, `lifecycle` (hook order, body classes), `hooks`, `skip-missing`, `wait-for-element`, `keyboard` (Escape/Arrow via `window` keyup), `config`, `animation` (stage interpolates over frames with fake timers/rAF), `interactions` parts that don't need the popover DOM.
- [ ] Commit `feat(core): tour engine with reactive state`.

### Task 4: `useDriverPosition` composable

**Files:** `src/composables/useDriverPosition.ts`; `tests/position.test.ts`.

**Produces:**
```ts
useDriverPosition(options: {
  reference: MaybeRefOrGetter<Element | StageRect | undefined>
  floating: Ref<HTMLElement | null>; arrow?: Ref<HTMLElement | null>
  side: MaybeRefOrGetter<Side>; align: MaybeRefOrGetter<Alignment>
  offset: MaybeRefOrGetter<number>; padding: MaybeRefOrGetter<number>   // padding expands the reference rect
  centered?: MaybeRefOrGetter<boolean>; open?: MaybeRefOrGetter<boolean>
}): { floatingStyles: ComputedRef<CSSProperties>; arrowStyles: ComputedRef<CSSProperties>;
      side: ComputedRef<Side | 'over'>; align: ComputedRef<Alignment>; update(): void; isPositioned: Ref<boolean> }
```
Uses `useFloating` from `@floating-ui/vue` with a computed virtual element (`getBoundingClientRect` = element rect expanded by `padding`, `contextElement` = element), `placement = side-align`, middleware `offset(offset)`, `flip()`, `shift({ padding: 10 })`, `arrow({ element })`, `whileElementsMounted: autoUpdate`. `centered` → `side='over'`, styles `position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%)`. When Floating UI reports the reference is off-screen on every side (`middlewareData.flip` overflow all > 0 and shift can't fit — detect by comparing final rects), fall back to `left: calc(50% - w/2); bottom: 10px`, `side='over'`. Arrow styles: `{ left: x+'px' } | { top: y+'px' }` plus the static side per Floating UI `staticSide` map.

- [ ] Tests with mocked `getBoundingClientRect` on a host component: side/align mapping, centered styles, arrow side class naming (`driver-popover-arrow-side-*` inverted naming per upstream comment: rendered side `bottom` → arrow side `bottom`… keep upstream: side class equals rendered side; arrow class `driver-popover-arrow-side-{opposite? }` — NOTE upstream: popover side `left` → arrow class `driver-popover-arrow-side-left` sits at `left:100%` i.e. on the popover's right edge pointing right. So arrow class = rendered side, unchanged.)
- [ ] Commit `feat: useDriverPosition (Floating UI)`.

### Task 5: `DriverOverlay`, `DriverStage`, `DriverPopover`, `DriverTour`, `style.css`

**Files:** `src/components/*.vue`, `src/components/types.ts`, `src/composables/useTeleportTarget.ts`, `src/style.css`, `src/index.ts`; tests `tests/utils.ts` harness + `tests/popover.test.ts`, `tests/overlay.test.ts`, `tests/highlight.test.ts`, `tests/placement.test.ts`, `tests/custom-buttons.test.ts`, `tests/events.test.ts`, `tests/click.test.ts`, `tests/scroll.test.ts`, `tests/advance-on-click.test.ts`, `tests/backward-compat.test.ts`.

**Produces:** components per spec §4.6 with `TourSlotProps`; harness:
```ts
createDriver(config?): Driver           // creates driver AND mounts <DriverTour :driver> into document.body
useDriverHarness()                      // beforeEach DEMO_HTML, afterEach destroy+unmount
nextFrame(), popoverEl(), popoverTitle(), popoverDescription(), progressText(), navButton('next'|'prev'|'close'), pressKey(key)
```
- [ ] Write harness; port upstream suites (assert existence instead of `style.display`; `innerHTML` assertions → `innerHTML` on the rendered button still valid since v-html).
- [ ] Implement components + CSS (values from upstream `driver.css`/`popover.css` lifted into variables per spec §4.8).
- [ ] Commit `feat: default components, tour renderer and styles`.

### Task 6: Slots, per-step component, transitions, stage variables

**Files:** `tests/slots.test.ts`, `tests/stage-element.test.ts`, `tests/transitions.test.ts`, component edits.

- [ ] Tests: `#popover` slot receives `TourSlotProps` and replaces body; `#title` replaces title only; `#overlay` replaces svg; `#stage` renders inside `.driver-stage`; `step.popover.component` rendered with props `{...TourSlotProps, ...popover.props}`; `config.components.popover` fallback precedence; `.driver-stage` has `--driver-stage-x` etc.; `.driver-popover` root has `driver-popover-enter-active` during enter (use `transitionStub: false` in VTU global config and `appear`).
- [ ] Commit `feat: slots, custom popover components, stage decorations`.

### Task 7: `useDriver`, plugin, injection, SSR guard

**Files:** `src/composables/useDriver.ts`, `src/plugin.ts`, `tests/use-driver.test.ts`, `tests/plugin.test.ts`, `tests/ssr.test.ts`.

- [ ] Tests: `useDriver` in host component returns refs mirroring state; destroys on unmount; reactive config getter updates `getConfig()`; plugin `defaults` merged; `<DriverTour>` without prop uses the injected shared driver; `renderToString(DriverTour)` returns `<!---->`-like empty output without throwing; `createDriver()` under `vi.stubGlobal('window', undefined)` returns inert instance.
- [ ] Commit `feat: useDriver, DriverPlugin, SSR safety`.

### Task 8: Hints engine

**Files:** `src/core/hints.ts`, `src/hints.ts` entry; `tests/hints-engine.test.ts`.

**Produces:** `createHints(config?: HintsConfig): Hints` (+ `hints` alias) with `state: HintsState`:
```ts
interface HintsState { isVisible: boolean; activeId?: string; mounted: MountedHint[]; overlayRect?: StageRect; refreshTick: number;
  popover?: HintPopoverRenderModel }
interface MountedHint { id: string; hint: DriverHint; element: Element; x: number; y: number; hidden: boolean }
```
Beacon click → `hints.toggle(id)` (exposed). Popover model built by the engine as in upstream `popoverOptions`. Overlay path/rect from `overlayRect`. `onPopoverRender` fed by `hints.__reportPopoverDom`.

- [ ] Port upstream `hints.test.ts` cases that do not depend on beacon DOM (id resolution, dismiss/restore/restoreAll, setHints, show/hide idempotence, active tracking, hooks, tour-takes-over MutationObserver, IntersectionObserver closes).
- [ ] Commit `feat(hints): engine with reactive state`.

### Task 9: `DriverHints` + `DriverHintBeacon` components, `useHints`

**Files:** `src/components/DriverHints.vue`, `src/components/DriverHintBeacon.vue`, `src/composables/useHints.ts`, `tests/hints.test.ts` (DOM-level: beacons rendered with classes/aria, popover opens/closes, overlay, slots `beacon`/`popover`).

- [ ] `<DriverPopover>` gains a `mode: 'tour' | 'hint'` prop (hint: single next button text = buttonText, class `driver-hint-popover`).
- [ ] Commit `feat(hints): components and useHints`.

### Task 10: Package build + lint

- [ ] `pnpm -F driver-vue build`; `publint`; `attw`; `vue-tsc --noEmit` clean. Fix `exports`/types. Commit `build: driver-vue dist and package checks`.

### Task 11: Nuxt module

**Files:** `packages/nuxt/*`, `apps/nuxt-playground/*` (nuxt.config.ts with `modules: ['nuxt-driver-vue']`, `app.vue` with `<DriverTour />`, `pages/index.vue` running a tour + hints).

- [ ] Module per spec §6. `pnpm -F nuxt-driver-vue build` (module-builder) then `pnpm -F nuxt-playground build` succeeds; `nuxi generate` or `node .output/server/index.mjs` + curl `/` returns 200 with no driver DOM in SSR HTML.
- [ ] Commit `feat(nuxt): nuxt-driver-vue module and playground`.

### Task 12: Docs (VitePress) + API generation

**Files:** `apps/docs/**`, `packages/vue/typedoc.json`, `scripts/component-meta.mjs`.

- [ ] VitePress config with sidebar: Introduction (installation, basic usage, configuration, theming, migrating from driver.js, nuxt), Styling (popover, overlay, highlight animation, custom components/slots, headless, hints), Examples (simple highlight, static tour, animated tour, async tour, interactive tour, multi-page tour, popover position, tour progress, buttons, confirm on exit, prevent destroy, hints), API (generated).
- [ ] Theme: `.vitepress/theme/index.ts` installs `DriverPlugin`, imports `driver-vue/style.css`, registers `<Demo>` (button + tour/highlight config, shows the code) and demo-specific components (custom popover with design-system-like buttons, glow stage, custom overlay).
- [ ] `typedoc.json` → `apps/docs/api/reference`; `scripts/component-meta.mjs` uses `vue-component-meta` `createComponentMetaChecker` on `packages/vue/tsconfig.json` to write props/slots/events tables for each component to `apps/docs/api/components.md`. `docs:build` runs both then `vitepress build`.
- [ ] `pnpm -F driver-docs build` succeeds. Commit `docs: VitePress site with live demos and generated API`.

### Task 13: Final verification

- [ ] `pnpm -r test:run`, `pnpm -r build`, `pnpm -r typecheck`, `pnpm lint:package` all green; README at root and package; update spec assumptions if any changed. Commit `chore: release-ready checks`.
