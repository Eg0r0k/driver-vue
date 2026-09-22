import { computed, getCurrentScope, onScopeDispose, toValue, watch, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { createHints, type DriverHint, type Hints, type HintsConfig } from "../core/hints";

export type UseHintsReturn = {
  hints: Hints;
  isVisible: ComputedRef<boolean>;
  /** The open hint, if any. */
  active: ComputedRef<DriverHint | undefined>;
  activeId: ComputedRef<string | undefined>;
  /** Ids of the hints currently on the page. */
  mountedIds: ComputedRef<string[]>;

  show: Hints["show"];
  hide: Hints["hide"];
  open: Hints["open"];
  close: Hints["close"];
  toggle: Hints["toggle"];
  dismiss: Hints["dismiss"];
  restore: Hints["restore"];
  restoreAll: Hints["restoreAll"];
  setHints: Hints["setHints"];
  refresh: Hints["refresh"];
};

/**
 * Creates a hints instance bound to the current component: a reactive
 * `hints` list is re-applied on change and the beacons are hidden when the
 * component unmounts.
 *
 * ```ts
 * const { show } = useHints({ hints })
 * ```
 */
export function useHints(config: MaybeRefOrGetter<HintsConfig> = {}): UseHintsReturn {
  const hints = createHints(toValue(config));

  const isReactiveConfig = typeof config === "function" || (config !== null && typeof config === "object" && "value" in config);
  if (isReactiveConfig) {
    watch(
      () => toValue(config).hints,
      next => hints.setHints(next || []),
      { deep: true }
    );
  }

  if (getCurrentScope()) {
    onScopeDispose(() => hints.hide());
  }

  const state = hints.state;

  return {
    hints,
    isVisible: computed(() => state.isVisible),
    active: computed(() => (state.activeId ? state.mounted.find(entry => entry.id === state.activeId)?.hint : undefined)),
    activeId: computed(() => state.activeId),
    mountedIds: computed(() => state.mounted.map(entry => entry.id)),

    show: hints.show,
    hide: hints.hide,
    open: hints.open,
    close: hints.close,
    toggle: hints.toggle,
    dismiss: hints.dismiss,
    restore: hints.restore,
    restoreAll: hints.restoreAll,
    setHints: hints.setHints,
    refresh: hints.refresh,
  };
}
