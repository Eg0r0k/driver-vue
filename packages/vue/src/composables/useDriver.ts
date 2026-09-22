import {
  computed,
  getCurrentInstance,
  getCurrentScope,
  onScopeDispose,
  provide,
  shallowRef,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";
import { createDriver } from "../core/driver";
import { DRIVER_KEY, injectDriver, injectDriverDefaults } from "../plugin";
import { isDummyElement } from "../core/utils";
import type { Config, Driver, DriveStep, PopoverRenderModel, StageRect } from "../types";

export type UseDriverOptions = {
  /**
   * Use the app-wide driver from `DriverPlugin` instead of creating one. Its
   * config is replaced by the merged config on every change, and it is not
   * destroyed when the component unmounts.
   */
  shared?: boolean;
};

export type UseDriverReturn = {
  driver: Driver;

  isActive: ComputedRef<boolean>;
  activeIndex: ComputedRef<number | undefined>;
  activeStep: ComputedRef<DriveStep | undefined>;
  /** The highlighted element; undefined for a centered, element-less step. */
  activeElement: ComputedRef<Element | undefined>;
  previousStep: ComputedRef<DriveStep | undefined>;
  previousElement: ComputedRef<Element | undefined>;
  stage: ComputedRef<StageRect | undefined>;
  popover: ComputedRef<PopoverRenderModel | undefined>;
  transitioning: ComputedRef<boolean>;

  isFirstStep: ComputedRef<boolean>;
  isLastStep: ComputedRef<boolean>;
  hasNextStep: ComputedRef<boolean>;
  hasPreviousStep: ComputedRef<boolean>;

  drive: Driver["drive"];
  highlight: Driver["highlight"];
  moveNext: Driver["moveNext"];
  movePrevious: Driver["movePrevious"];
  moveTo: Driver["moveTo"];
  refresh: Driver["refresh"];
  destroy: Driver["destroy"];
  setSteps: Driver["setSteps"];
  setConfig: Driver["setConfig"];
};

/**
 * Creates a driver bound to the current component: the plugin defaults are
 * merged under `config`, a reactive `config` is re-applied on change, the
 * driver is provided to the component's subtree (so a `<DriverTour />` there
 * renders it), and the tour is destroyed when the component unmounts.
 *
 * ```ts
 * const { drive, isActive } = useDriver({ steps })
 * ```
 */
export const useDriver = (config: MaybeRefOrGetter<Config> = {}, options: UseDriverOptions = {}): UseDriverReturn => {
  const defaults = injectDriverDefaults();
  const resolve = (): Config => ({ ...defaults, ...toValue(config) });

  let driver: Driver;
  if (options.shared) {
    driver = injectDriver().value;
    driver.setConfig(resolve());
  } else {
    driver = createDriver(resolve());
  }

  // A reactive config (ref/getter) is re-applied whenever it changes.
  const isReactiveConfig =
    typeof config === "function" || (config !== null && typeof config === "object" && "value" in config);
  if (isReactiveConfig) {
    watch(resolve, next => driver.setConfig(next), { deep: true });
  }

  if (!options.shared) {
    if (getCurrentScope()) {
      onScopeDispose(() => driver.destroy());
    }

    // A <DriverTour /> in this component (or below it) renders this driver
    // without a prop; the plugin's shared instance stays the fallback elsewhere.
    if (getCurrentInstance()) {
      provide(DRIVER_KEY, shallowRef(driver));
    }
  }

  const state = driver.state;

  return {
    driver,

    isActive: computed(() => state.isActive),
    activeIndex: computed(() => state.activeIndex),
    activeStep: computed(() => state.activeStep),
    activeElement: computed(() => (isDummyElement(state.activeElement) ? undefined : state.activeElement)),
    previousStep: computed(() => state.previousStep),
    previousElement: computed(() => state.previousElement),
    stage: computed(() => state.stage),
    popover: computed(() => state.popover),
    transitioning: computed(() => state.transitioning),

    // These depend on the live DOM (skipped steps) as well as the index, so
    // they re-evaluate when the active index or the popover changes.
    isFirstStep: computed(() => (void state.activeIndex, void state.popover, driver.isFirstStep())),
    isLastStep: computed(() => (void state.activeIndex, void state.popover, driver.isLastStep())),
    hasNextStep: computed(() => (void state.activeIndex, void state.popover, driver.hasNextStep())),
    hasPreviousStep: computed(() => (void state.activeIndex, void state.popover, driver.hasPreviousStep())),

    drive: driver.drive,
    highlight: driver.highlight,
    moveNext: driver.moveNext,
    movePrevious: driver.movePrevious,
    moveTo: driver.moveTo,
    refresh: driver.refresh,
    destroy: driver.destroy,
    setSteps: driver.setSteps,
    setConfig: driver.setConfig,
  };
};

export type { Ref };
