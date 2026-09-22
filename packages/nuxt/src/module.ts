import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";
import type { Config } from "driver-vue";

export interface ModuleOptions {
  /**
   * Config merged under every driver created through `useDriver()` and the
   * shared instance rendered by `<DriverTour />` without a `driver` prop.
   * Only serializable values survive the trip through runtime config; pass
   * hooks and components from the app instead.
   */
  defaults?: Config;
  /** Register the driver-vue components globally. (default: true) */
  components?: boolean;
  /** Add `driver-vue/style.css` to the app. (default: true) */
  css?: boolean;
  /** Prefix of the registered components, e.g. `DriverTour`. (default: "Driver") */
  prefix?: string;
}

export interface ModulePublicRuntimeConfig {
  driver: {
    defaults?: Config;
  };
}

const COMPOSABLES = ["useDriver", "createDriver", "driver", "useDriverPosition", "provideDriver", "injectDriver"];

const COMPONENTS = ["Tour", "Popover", "Overlay", "Stage"];

const HINT_COMPOSABLES = ["useHints", "createHints", "hints"];

const HINT_COMPONENTS = ["Hints", "HintBeacon"];

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-driver-vue",
    configKey: "driver",
    compatibility: {
      nuxt: ">=4.0.0",
    },
  },
  defaults: {
    components: true,
    css: true,
    prefix: "Driver",
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Runtime config from nuxt.config wins over the module option, key by key.
    const existing = (nuxt.options.runtimeConfig.public.driver ?? {}) as Partial<ModulePublicRuntimeConfig["driver"]>;
    nuxt.options.runtimeConfig.public.driver = {
      ...existing,
      defaults: { ...(options.defaults ?? {}), ...(existing.defaults ?? {}) },
    };

    nuxt.options.build.transpile.push("driver-vue");

    if (options.css !== false) {
      nuxt.options.css.push("driver-vue/style.css");
    }

    addPlugin(resolver.resolve("./runtime/plugin"));

    addImports(COMPOSABLES.map(name => ({ name, from: "driver-vue" })));
    addImports(HINT_COMPOSABLES.map(name => ({ name, from: "driver-vue/hints" })));

    if (options.components !== false) {
      const prefix = options.prefix ?? "Driver";
      for (const name of COMPONENTS) {
        addComponent({
          name: `${prefix}${name}`,
          export: `Driver${name}`,
          filePath: "driver-vue",
        });
      }
      for (const name of HINT_COMPONENTS) {
        addComponent({
          name: `${prefix}${name}`,
          export: `Driver${name}`,
          filePath: "driver-vue/hints",
        });
      }
    }
  },
});
