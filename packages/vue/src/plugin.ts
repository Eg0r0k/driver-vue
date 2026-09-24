import { inject, provide, shallowRef, type App, type InjectionKey, type Plugin, type ShallowRef } from "vue";
import { createDriver } from "./core/driver";
import DriverTour from "./components/DriverTour.vue";
import DriverPopover from "./components/DriverPopover.vue";
import DriverOverlay from "./components/DriverOverlay.vue";
import DriverBoxOverlay from "./components/DriverBoxOverlay.vue";
import DriverStage from "./components/DriverStage.vue";
import type { Config, Driver } from "./types";

/** Config defaults merged under every `useDriver()` config. */
export const DRIVER_DEFAULTS_KEY: InjectionKey<Config> = Symbol("driver-vue:defaults");

/** The app-wide shared driver, created lazily on first use. */
export const DRIVER_KEY: InjectionKey<ShallowRef<Driver | undefined>> = Symbol("driver-vue:driver");

export type DriverPluginOptions = {
  /** Config applied to every driver created through `useDriver()` and to the shared instance. */
  defaults?: Config;
  /**
   * Register the components globally: `true` registers `DriverTour`,
   * `DriverPopover`, `DriverOverlay`, `DriverBoxOverlay` and `DriverStage`; a string changes the
   * `Driver` prefix (`"Tour"` registers `TourTour`, ...). (default: false)
   */
  components?: boolean | string;
};

const COMPONENTS = {
  Tour: DriverTour,
  Popover: DriverPopover,
  Overlay: DriverOverlay,
  BoxOverlay: DriverBoxOverlay,
  Stage: DriverStage,
};

/**
 * Installs driver-vue: provides the config defaults and a lazily created
 * shared driver (used by `<DriverTour>` without a `driver` prop and by
 * `useDriver()` with `{ shared: true }`), and optionally registers the
 * components globally.
 *
 * ```ts
 * app.use(DriverPlugin, { defaults: { animate: true }, components: true })
 * ```
 */
export const createDriverPlugin = (options: DriverPluginOptions = {}): Plugin<[DriverPluginOptions?]> => ({
  install: (app: App, installOptions: DriverPluginOptions = {}) => {
    const merged = { ...options, ...installOptions };
    const defaults = { ...(options.defaults || {}), ...(installOptions.defaults || {}) };

    const shared = shallowRef<Driver>();

    app.provide(DRIVER_DEFAULTS_KEY, defaults);
    app.provide(DRIVER_KEY, shared);

    if (merged.components) {
      const prefix = typeof merged.components === "string" ? merged.components : "Driver";
      for (const [name, component] of Object.entries(COMPONENTS)) {
        app.component(`${prefix}${name}`, component);
      }
    }
  },
});

/** The plugin with no preset options; pass options to `app.use`. */
export const DriverPlugin: Plugin<[DriverPluginOptions?]> = createDriverPlugin();

/** Provide a driver to the subtree; `<DriverTour>` and `useDriver({ shared: true })` pick it up. */
export const provideDriver = (driver: Driver): void => {
  provide(DRIVER_KEY, shallowRef(driver));
};

export type InjectDriver = {
  (options: { optional: true }): ShallowRef<Driver | undefined> | undefined;
  (options?: { optional?: false }): ShallowRef<Driver>;
};

/**
 * The nearest provided driver: one from `useDriver()` in an ancestor, from
 * `provideDriver()`, or the app-wide one from `DriverPlugin` (created on
 * first access).
 */
export const injectDriver: InjectDriver = ((options: { optional?: boolean } = {}) => {
  const shared = inject(DRIVER_KEY, undefined);
  const defaults = inject(DRIVER_DEFAULTS_KEY, undefined);

  if (!shared) {
    if (options.optional) {
      return undefined;
    }

    throw new Error("[driver-vue] No driver provided: install DriverPlugin or call provideDriver().");
  }

  if (!shared.value) {
    shared.value = createDriver(defaults);
  }

  return shared;
}) as InjectDriver;

/** The config defaults installed by `DriverPlugin`, or an empty object. */
export const injectDriverDefaults = (): Config => inject(DRIVER_DEFAULTS_KEY, undefined) ?? {};
