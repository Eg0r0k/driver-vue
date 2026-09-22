import type { Config, Driver } from "driver-vue";

/** What every example's `run` receives. */
export type ExampleContext = {
  /**
   * The shared driver of the plugin, rendered by the `<DriverTour />` in the
   * layout. `configure()` resets it with a new config (steps included) and
   * returns it, so `configure({...}).highlight({...})` reads like driver.js.
   */
  configure: (config?: Config) => Driver;
  /** The shared driver as-is (config from the previous example). */
  driver: Driver;
  /**
   * An extra, independent driver rendered by its own `<DriverTour>` in the
   * layout. Destroyed when the next example runs.
   */
  create: (config?: Config) => Driver;
  /** Writes to the log panel on the page (instead of the console). */
  log: (...parts: unknown[]) => void;
  /** Shows a notice on the page (instead of `window.alert`). */
  notice: (message: string) => void;
  /** Stops every driver started by the examples. */
  reset: () => void;
};

export type Example = {
  id: string;
  title: string;
  description: string;
  run: (ctx: ExampleContext) => void;
};

export type ExampleGroup = {
  slug: string;
  title: string;
  /** Short intro shown above the examples. */
  intro?: string;
  examples: Example[];
};
