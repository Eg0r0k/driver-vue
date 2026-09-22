# driver-vue — Vue 3 / Nuxt 4 port of driver.js — design

Date: 2026-09-22
Upstream: https://github.com/nilbuild/driver.js (driver.js 1.8.0, `packages/driver`), cloned at `F:\driver.js-upstream`.

## 1. Problem

driver.js renders the popover, the overlay and the hint beacons imperatively
(`document.createElement`, `innerHTML`, inline `style`). A Vue/Nuxt app can only
theme it through CSS class overrides or by mutating DOM in `onPopoverRender`.
It cannot render its own components (design-system buttons, i18n, icons,
progress bars) inside the tour, and it cannot control the highlight animation
beyond `duration`.

Everything else about driver.js (API, behaviour, hooks, keyboard control,
async/wait-for-element, skip-missing, hints) is wanted as-is.

## 2. Goals

- Same public behaviour and vocabulary as driver.js 1.8: `driver()` config,
  `DriveStep`, `Popover`, hooks, `Driver` API methods, hints module.
- First-class styling in Vue:
  1. CSS custom properties for every default visual token.
  2. Same class names as upstream (`driver-popover`, `driver-popover-side-*`,
     `driver-active-element`, `driver-hint`, …) so existing CSS themes keep
     working.
  3. Slots on the rendering components to replace any part with own markup.
  4. A per-step (or global) `component` to render a custom popover.
  5. Headless usage: the reactive tour state and positioning composable are
     public, so a consumer may render everything themselves.
  6. Highlight (stage) animation is customizable: pluggable easing, a
     decoratable `.driver-stage` element that tracks the cutout, Vue
     `<Transition>` hooks on popover/overlay enter/leave, and a replaceable
     overlay component.
- Vue 3 (>= 3.5) library and a Nuxt 4 module.
- Tests with Vitest + Vue Test Utils. Docs and live demos with VitePress.
- Popover positioning via Floating UI (`@floating-ui/vue`).

Non-goals: Vue 2, Options API, IIFE/CDN build, React/other frameworks.

## 3. Repository layout

```
F:\driver-vue                       pnpm workspace (pnpm 10, turbo)
  packages/vue        driver-vue        the library
  packages/nuxt       nuxt-driver-vue   Nuxt 4 module wrapping the library
  apps/docs           VitePress site: guides + live demos + generated API
  apps/nuxt-playground Nuxt 4 app that consumes the module (manual/e2e check)
  docs/superpowers/   specs and plans
```

Tooling: TypeScript 6, Vite 7/8 + `@vitejs/plugin-vue` for the library
build (`vite build --lib`, ESM + CJS, `vue-tsc` for `.d.ts`), Vitest 4 with
`happy-dom` (jsdom fallback if a test needs it), `@vue/test-utils`,
`publint` + `@arethetypeswrong/cli` for the package, `typedoc` +
`typedoc-plugin-markdown` for the API reference, `vue-component-meta` for
component prop/slot/event tables in the docs.

## 4. Package `driver-vue`

### 4.1 Entry points

```
driver-vue            createDriver/driver, useDriver, DriverPlugin, components, types
driver-vue/hints      createHints/hints, useHints, DriverHints component, types
driver-vue/style.css  tour + popover + hints default styles (single file)
```

### 4.2 Architecture: engine → reactive state → components

```
              ┌────────────────────────────┐
 config ────► │ engine (src/core/*)        │  ports driver.ts / context.ts /
 hooks  ◄──── │  navigation, hooks, skip,  │  step.ts / highlight.ts / events.ts
              │  wait, scroll, focus trap, │  / utils.ts nearly 1:1
              │  stage animation loop      │
              └──────────┬─────────────────┘
                         │ writes
              ┌──────────▼─────────────────┐
              │ DriverState (shallowReactive)│  isActive, activeIndex, activeStep,
              │                            │  activeElement, stage rect, popover
              └──────────┬─────────────────┘  render model, transitioning …
                         │ read by
              ┌──────────▼─────────────────┐
              │ <DriverTour>               │  Teleport to body
              │   <DriverOverlay>  slot    │  SVG dim with cutout path
              │   <DriverStage>    slot    │  empty div tracking the cutout
              │   <DriverPopover>  slots   │  positioned with Floating UI
              └────────────────────────────┘
```

The engine never creates UI DOM. It still touches the *target* element (adds
`driver-active-element`, aria attributes, scrolls it into view), the `body`
(`driver-active`, `driver-fade` / `driver-simple`, `driver-no-scroll`,
`--driver-animation-duration`), and window/document listeners. These are
behaviour, not presentation, and keep CSS parity.

### 4.3 State (`DriverState`)

```ts
type StageRect = { x: number; y: number; width: number; height: number }

interface DriverState {
  isActive: boolean
  activeIndex?: number
  activeStep?: DriveStep            // resolved step (same shape upstream stores)
  activeElement?: Element           // undefined for the element-less (centered) step
  previousStep?: DriveStep
  previousElement?: Element
  transitioning: boolean            // stage animation in flight
  stage?: StageRect                 // current (possibly interpolated) cutout rect, without padding
  popover?: PopoverRenderModel      // undefined while hidden (during transition)
  refreshTick: number               // bumped by refresh(); components re-measure
}

interface PopoverRenderModel {
  title?: string
  description?: string
  showButtons: AllowedButtons[]
  disableButtons: AllowedButtons[]
  showProgress: boolean
  progressText: string              // already interpolated "1 of 3"
  nextBtnText: string
  prevBtnText: string
  doneButton: boolean
  popoverClass: string
  side: Side
  align: Alignment
  centered: boolean                 // element-less step: center in viewport
  component?: Component             // step.popover.component ?? config.components.popover
  onNextClick(): void; onPrevClick(): void; onCloseClick(): void
}
```

Internal engine-only fields (transition callback, wait cancel, the stage
position used by the interpolation, resize frame handle, `__activeElement`
vs `activeElement` semantics from upstream) stay in a plain non-reactive
object. Public getters (`getState`, `getActiveIndex`, …) keep upstream
semantics: `activeStep`/`activeElement` update at the start of a transfer,
`__active*` at the end.

### 4.4 Config and types

`Config`, `DriveStep`, `Popover`, `DriverHook`, `HookOpts`, `State`, `Side`,
`Alignment`, `AllowedButtons` are kept verbatim, with these additions:

- `Config.easing?: (t: number) => number` — stage interpolation easing,
  default `easeInOutQuad`.
- `Config.components?: { popover?: Component; overlay?: Component }` — global
  component overrides.
- `Popover.component?: Component` — per-step popover component.
- `Popover.props?: Record<string, unknown>` — extra props passed to that
  component.
- `Config.teleportTo?: string | Element` — default `body`.
- `Config.zIndex?: number` — base z-index (CSS variable), default `10000`.

Changed/removed:

- `PopoverDOM` is still delivered to `onPopoverRender(popover, opts)` after the
  default popover mounts (wrapper, arrow, title, description, footer, progress,
  previousButton, nextButton, closeButton, footerButtons). With a custom
  popover component only `wrapper` is guaranteed; the other keys are `null`
  when the component does not render the corresponding `data-driver` part.
- `title` and `description` are rendered with `v-html` for parity (upstream
  uses `innerHTML`; existing tours contain markup like `&larr;`). Documented as
  trusted content; slots are the safe alternative.

### 4.5 Public API

```ts
// factory (framework-agnostic apart from @vue/reactivity)
createDriver(config?: Config): Driver      // alias: driver()
interface Driver extends UpstreamDriver {   // all 25 upstream methods, same semantics
  state: Readonly<DriverState>              // reactive
}

// composable
useDriver(config?: MaybeRefOrGetter<Config>): UseDriverReturn
// - merges plugin defaults (inject) → config
// - creates the driver, destroys it in onScopeDispose
// - watches a reactive config and calls setConfig
// - returns { driver, ...toRefs(state), isFirstStep, isLastStep, hasNextStep,
//             hasPreviousStep, drive, highlight, moveNext, movePrevious,
//             moveTo, destroy, refresh }

// plugin
DriverPlugin / createDriverPlugin(options?: DriverPluginOptions)
interface DriverPluginOptions {
  defaults?: Config                 // merged under every useDriver() config
  components?: boolean | string     // register components globally (prefix, default "Driver")
}
// provides DRIVER_DEFAULTS_KEY (InjectionKey<Config>) and a lazily created
// shared driver under DRIVER_KEY for <DriverTour> without a :driver prop.

// injection helpers
provideDriver(driver), injectDriver()

// positioning composable (for headless / custom popovers)
useDriverPosition(options: {
  reference: MaybeRefOrGetter<Element | StageRect | undefined>
  floating: Ref<HTMLElement | null>
  arrow?: Ref<HTMLElement | null>
  side: MaybeRefOrGetter<Side>; align: MaybeRefOrGetter<Alignment>
  offset: MaybeRefOrGetter<number>; padding: MaybeRefOrGetter<number>
  centered?: MaybeRefOrGetter<boolean>
}): { floatingStyles, arrowStyles, placement, side, align, update }
```

### 4.6 Components

All components are `<script setup lang="ts">`, SFC order script → template →
style, no scoped styles (styles ship in `style.css`, classes are the public
theming contract).

**`<DriverTour>`** — the render root. Props: `driver?: Driver` (falls back to
injected). Renders inside `<Teleport :to="teleportTo">`, only on the client
(`onMounted` gate), and only while `state.isActive`.

Slots (all receive `TourSlotProps`):

| slot | replaces | extra scope |
|---|---|---|
| `overlay` | the whole `<DriverOverlay>` | `stage`, `padding`, `radius`, `color`, `opacity`, `onClick` |
| `stage` | content of `<DriverStage>` | `stage`, `padding`, `radius` |
| `popover` | content inside the positioned `.driver-popover` wrapper (arrow stays) | `popover` model, `placement`, `arrowStyles` |
| `arrow` | the arrow element | `side`, `arrowStyles` |
| `title`, `description`, `close`, `progress`, `prev`, `next`, `footer` | the matching part of `<DriverPopover>` | — |

```ts
interface TourSlotProps {
  driver: Driver
  step: DriveStep; index: number; total: number
  element?: Element
  isFirst: boolean; isLast: boolean; hasNext: boolean; hasPrev: boolean
  popover: PopoverRenderModel
  next(): void; prev(): void; close(): void
}
```

Precedence for the popover body: `#popover` slot → `step.popover.component`
→ `config.components.popover` → `<DriverPopover>` default.

**`<DriverOverlay>`** — `<svg class="driver-overlay">` with the evenodd path
from `generateStageSvgPathString` (ported), `viewBox` refreshed on resize,
click on the path → `driver` overlay click handling. Wrapped in
`<Transition name="driver-overlay" appear>`. Props: `stage`, `padding`,
`radius`, `color`, `opacity`.

**`<DriverStage>`** — `<div class="driver-stage">` absolutely positioned at
the padded cutout, `pointer-events: none`, no visual by default. Exposes the
rect as CSS variables (`--driver-stage-x/y/width/height`) so users can add
glow/pulse/outline purely in CSS, and takes the `stage` slot for custom
decorations. Also sets `data-transitioning`.

**`<DriverPopover>`** — same DOM as upstream `createPopover()` with the same
classes and ids (`driver-popover-content`, `driver-popover-title`,
`driver-popover-description`), `role="dialog"`, `aria-*`, `type="button"`
buttons, `driver-popover-done-btn`, `driver-popover-btn-disabled`, side/align
classes derived from the *rendered* placement. Positioned with
`useDriverPosition`. Wrapped in `<Transition name="driver-popover" appear>`.
After mount it reports its `PopoverDOM` to the engine (`onPopoverRender`),
focuses the first focusable element (popover then anchor), re-measures when
images load. Buttons `stopPropagation` so app listeners never see them, and
clicks in title/description are left alone (links work).

Popover positioning through Floating UI: reference is a virtual element whose
rect is the target's rect expanded by `stagePadding` (with `contextElement`
set for `autoUpdate`), placement = `${side}-${align}`, middleware
`offset(popoverOffset)`, `flip()`, `shift({ padding: 10 })`, `arrow()`; if no
placement fits, fall back to the upstream behaviour (centered horizontally,
pinned 10px from the bottom, arrow hidden). `centered` steps use CSS centering
and hide the arrow. Rendered side/align come from the final placement and are
emitted as `driver-popover-side-*` / `driver-popover-align-*` classes, plus
`data-side` / `data-align` attributes.

**`<DriverHints>`** — see §5.

### 4.7 Engine details (ported modules)

| upstream | port | change |
|---|---|---|
| `context.ts` | `core/context.ts` | state store is `shallowReactive`; public/`__` split preserved |
| `driver.ts` | `core/driver.ts` | identical flow; `destroy` clears state → components unmount |
| `step.ts` | `core/step.ts` | `resolveStepPopover` returns `PopoverRenderModel` instead of calling `renderPopover` |
| `highlight.ts` | `core/highlight.ts` | identical animation loop writing `state.stage`; popover model set at halfway point of an animated transfer, immediately otherwise |
| `overlay.ts` | `core/stage.ts` (path math) + `<DriverOverlay>` | interpolation moves to highlight; SVG creation removed |
| `events.ts` | `core/events.ts` | identical (keyboard, focus trap, resize/scroll → refresh, document click → advanceOnClick) |
| `click.ts` | dropped | components handle their own clicks |
| `popover.ts` / `position.ts` | `<DriverPopover>` + `useDriverPosition` | Floating UI replaces the custom algorithm; arrow-target helpers kept for the fallback/over case |
| `utils.ts` | `core/utils.ts` | identical |
| `hints.ts` | `hints/` (engine + component) | same split |

SSR: every engine entry that touches `window`/`document` is guarded; on the
server `createDriver` returns an inert instance (`drive()` is a no-op). The
components render nothing until mounted.

### 4.8 Styles (`style.css`)

Same rules as upstream `driver.css` + `popover.css` + `hints.css`, with values
lifted into custom properties (defaults equal upstream):

```
--driver-z-index, --driver-animation-duration, --driver-animation-easing
--driver-overlay-color, --driver-overlay-opacity   (also settable via config)
--driver-popover-bg, --driver-popover-color, --driver-popover-radius,
--driver-popover-padding, --driver-popover-shadow, --driver-popover-min-width,
--driver-popover-max-width, --driver-popover-font-family,
--driver-popover-title-size, --driver-popover-description-size,
--driver-popover-btn-bg, --driver-popover-btn-color, --driver-popover-btn-border,
--driver-popover-btn-radius, --driver-popover-arrow-size
--driver-hint-size, --driver-hint-color, --driver-hint-animation-duration
```

Transitions: `.driver-popover-enter-active/-from/…` and
`.driver-overlay-enter-active/…` classes (Vue `<Transition>` names), defaulting
to the upstream fade, so overriding the animation is plain CSS. `.driver-stage`
ships positioned but unstyled.

## 5. Hints (`driver-vue/hints`)

Engine `core/hints.ts` ported from upstream with the same `Hints` API
(`show/hide/open/close/dismiss/restore/restoreAll/setHints/getHints/getActive/isVisible/refresh`)
and config (`HintsConfig`, `DriverHint`, `HintBeacon`, `HintPopover`, `HintHook`).
State: `shallowReactive({ isVisible, mounted: MountedHint[], activeId, overlayRect })`
where a `MountedHint` carries `{ id, hint, element, rect, hidden }`; beacon
positions are computed in the engine on refresh (same anchor math) and
rendered by `<DriverHints>`.

`<DriverHints :hints="hints">` renders every beacon (`<button class="driver-hint">`
with pulse + dot, `driver-hint-hidden`, `aria-*`), the optional overlay and the
open hint's popover (reusing `<DriverPopover>` in hint mode: one "Got it"
button, `driver-hint-popover` class). Slots: `beacon` (`{ hint, id, open,
isOpen }`), `popover` (`{ hint, dismiss, close }`), plus the popover part slots.
Visibility via `IntersectionObserver` and the "tour takes over" MutationObserver
are kept in the engine. `useHints(config)` mirrors `useDriver`.

## 6. Nuxt module `nuxt-driver-vue`

`defineNuxtModule` (`@nuxt/kit`, built with `@nuxt/module-builder`):

- options: `{ defaults?: Config; components?: boolean; css?: boolean; prefix?: string }`
- adds a client plugin that installs `DriverPlugin` with `defaults` from module
  options merged with `runtimeConfig.public.driver`
- `addImports` for `useDriver`, `useHints`, `createDriver`, `createHints`
- `addComponent` for `DriverTour`, `DriverPopover`, `DriverOverlay`,
  `DriverStage`, `DriverHints` (prefix configurable)
- pushes `driver-vue/style.css` into `nuxt.options.css` when `css !== false`
- `apps/nuxt-playground` consumes it through the workspace and has a page
  running a tour and hints, used to verify SSR renders without errors.

## 7. Testing

- Unit tests in `packages/vue/tests`, Vitest + happy-dom, `@vue/test-utils`.
- A harness mirroring upstream `tests/utils.ts`: `DEMO_HTML`, `SAMPLE_STEPS`,
  `createDriver()` mounting `<DriverTour :driver>` into `document.body`,
  `nextFrame()`, DOM query helpers (`popoverEl`, `navButton`, …).
- Port the upstream suites by area, keeping test names where behaviour is the
  same: navigation, lifecycle, hooks, events/keyboard, highlight, overlay,
  placement (side/align classes), popover (buttons, texts, progress, class,
  accessibility contract, state exposure), custom buttons via
  `onPopoverRender`, advance-on-click, skip-missing, wait-for-element, scroll,
  interactions, config, stage path, hints. Assertions that checked
  `style.display` become existence checks.
- New suites: slots (`#popover`, `#title`, …), per-step `component`,
  `useDriver` (creation/dispose/reactive config through a host component),
  `useDriverPosition` (side/align → classes, centered, fallback), plugin
  install + injection, `DriverStage` CSS variables, transitions classes,
  SSR (`renderToString` of `<DriverTour>` yields nothing and no errors).
- Nuxt: `@nuxt/test-utils` smoke test that the playground renders with the
  module (optional if the runtime proves too slow; the playground build is the
  hard check).

## 8. Documentation (`apps/docs`, VitePress)

- Guides ported from upstream: installation, basic usage, configuration,
  theming, styling popover, styling overlay, styling hints, simple highlight,
  static tour, animated tour, async tour, interactive tour, multi-page tour,
  popover position, tour progress, buttons, confirm on exit, prevent destroy,
  hints, API.
- New guides: **Custom components (slots)**, **Headless usage**, **Highlight
  animation**, **Nuxt**, **Migrating from driver.js**.
- Every example is a live demo: a `<Demo>` component rendering a real tour
  in the page with the code shown below (VitePress markdown + Vue SFC in
  `.vitepress/theme`).
- API reference: `typedoc` + `typedoc-plugin-markdown` from
  `packages/vue/src/index.ts` and `hints.ts` into `apps/docs/api/`;
  component tables generated by a script using `vue-component-meta` into
  `apps/docs/api/components.md`. Both run in `docs:build`.

## 9. Error handling

- Missing element: identical to upstream (dummy centered step / skip / wait).
- `drive()` with no steps logs `No steps to drive through` and destroys.
- `<DriverTour>` without a driver (no prop, no plugin) warns once in dev and
  renders nothing.
- `useDriver` outside a component scope still works (no `onScopeDispose`),
  matching `createDriver`.
- Engine calls into user hooks are not wrapped; errors propagate as upstream.

## 10. Open assumptions

- Package names `driver-vue` and `nuxt-driver-vue` (both free on npm).
- Docs written in English (library convention); the user is addressed in Russian.
- Floating UI's flip/shift replaces the upstream positioning algorithm; the
  rendered-side classes and arrow behaviour are preserved, exact pixel parity
  is not a goal.
