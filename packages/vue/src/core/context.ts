import { shallowReactive } from "vue";
import type { Config, Driver, DriverState, GetConfig, GetState, HookOpts, SetState, State } from "../types";
import { easeInOutQuad } from "./utils";

// Per-instance config, state and emitter, threaded through the helpers so
// nothing falls back to shared module-level state.
//
// The engine works on the plain driver.js `State` (public keys plus the `__`
// internals). Every public key it writes is mirrored into `state`, a
// shallowReactive `DriverState`, which is what the components render from.
// Vue-only fields (stage, transitioning, popover model, refreshTick) live in
// the reactive state only and are written directly by the engine.

export function createDefaultConfig(): Config {
  return {
    animate: true,
    duration: 400,
    allowClose: true,
    allowScroll: true,
    overlayClickBehavior: "close",
    overlayOpacity: 0.7,
    smoothScroll: false,
    disableActiveInteraction: false,
    advanceOnClick: false,
    skipMissingElement: false,
    waitForElement: 0,
    showProgress: false,
    stagePadding: 10,
    stageRadius: 5,
    popoverOffset: 10,
    showButtons: ["next", "previous", "close"],
    disableButtons: [],
    overlayColor: "#000",
    easing: easeInOutQuad,
    teleportTo: "body",
    zIndex: 10000,
  };
}

function createConfigStore() {
  let currentConfig: Config = {};

  function configure(config: Config = {}) {
    currentConfig = {
      ...createDefaultConfig(),
      ...config,
    };
  }

  const getConfig: GetConfig = (<K extends keyof Config>(key?: K) => {
    return key ? currentConfig[key] : currentConfig;
  }) as GetConfig;

  configure();

  return { getConfig, configure };
}

export function createInitialState(): DriverState {
  return {
    isActive: false,
    activeIndex: undefined,
    activeStep: undefined,
    activeElement: undefined,
    previousStep: undefined,
    previousElement: undefined,
    transitioning: false,
    stage: undefined,
    popover: undefined,
    popoverDom: undefined,
    refreshTick: 0,
  };
}

// Plain state keys whose writes are mirrored into the reactive state.
const MIRRORED: { [K in keyof State]?: keyof DriverState } = {
  isInitialized: "isActive",
  activeIndex: "activeIndex",
  activeStep: "activeStep",
  activeElement: "activeElement",
  previousStep: "previousStep",
  previousElement: "previousElement",
  popover: "popoverDom",
};

function createStateStore() {
  let currentState: State = {};
  const reactiveState = shallowReactive<DriverState>(createInitialState());

  const getState: GetState = (<K extends keyof State>(key?: K) => {
    return key ? currentState[key] : currentState;
  }) as GetState;

  const setState: SetState = (key, value) => {
    currentState[key] = value;

    const mirror = MIRRORED[key];
    if (mirror) {
      (reactiveState as any)[mirror] = key === "isInitialized" ? !!value : value;
    }
  };

  function resetState() {
    currentState = {};
    Object.assign(reactiveState, createInitialState());
  }

  return { getState, setState, resetState, state: reactiveState };
}

export type AllowedEvents =
  | "overlayClick"
  | "activeElementClick"
  | "escapePress"
  | "nextClick"
  | "prevClick"
  | "closeClick"
  | "arrowRightPress"
  | "arrowLeftPress";

function createEmitter() {
  let registeredListeners: Partial<{ [key in AllowedEvents]: () => void }> = {};

  function listen(hook: AllowedEvents, callback: () => void) {
    registeredListeners[hook] = callback;
  }

  function emit(hook: AllowedEvents) {
    registeredListeners[hook]?.();
  }

  function reset() {
    registeredListeners = {};
  }

  return { listen, emit, reset };
}

export type Context = {
  getConfig: GetConfig;
  setConfig: (config?: Config) => void;

  /** The reactive, Vue-facing state. */
  state: DriverState;

  getState: GetState;
  setState: SetState;
  resetState: () => void;

  listen: (hook: AllowedEvents, callback: () => void) => void;
  emit: (hook: AllowedEvents) => void;
  resetEmitter: () => void;

  getDriver: () => Driver;
  setDriver: (driver: Driver) => void;

  getHookOpts: (stateOverride?: State) => HookOpts;
};

export function createContext(options: Config = {}): Context {
  const config = createConfigStore();
  config.configure(options);

  const state = createStateStore();
  const emitter = createEmitter();

  let driver: Driver;

  return {
    getConfig: config.getConfig,
    setConfig: config.configure,

    state: state.state,

    getState: state.getState,
    setState: state.setState,
    resetState: state.resetState,

    listen: emitter.listen,
    emit: emitter.emit,
    resetEmitter: emitter.reset,

    getDriver: () => driver,
    setDriver: (value: Driver) => {
      driver = value;
    },

    getHookOpts: (stateOverride?: State) => {
      const activeState = stateOverride || state.getState();

      return {
        config: config.getConfig(),
        state: activeState,
        driver,
        index: activeState.activeIndex,
      };
    },
  };
}
