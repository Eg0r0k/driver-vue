import { nextTick, watch } from "vue";
import { createContext } from "../src/core/context";

describe("context config", () => {
  it("applies the driver.js defaults", () => {
    const ctx = createContext();

    expect(ctx.getConfig("animate")).toBe(true);
    expect(ctx.getConfig("duration")).toBe(400);
    expect(ctx.getConfig("stagePadding")).toBe(10);
    expect(ctx.getConfig("showButtons")).toEqual(["next", "previous", "close"]);
    expect(ctx.getConfig("overlayClickBehavior")).toBe("close");
  });

  it("lets the options override the defaults", () => {
    const ctx = createContext({ animate: false, stagePadding: 0 });

    expect(ctx.getConfig("animate")).toBe(false);
    expect(ctx.getConfig("stagePadding")).toBe(0);
    expect(ctx.getConfig("duration")).toBe(400);
  });

  it("replaces the config wholesale on setConfig", () => {
    const ctx = createContext({ animate: false });
    ctx.setConfig({ duration: 100 });

    expect(ctx.getConfig("animate")).toBe(true);
    expect(ctx.getConfig("duration")).toBe(100);
  });

  it("keeps config and state per instance", () => {
    const a = createContext({ duration: 1 });
    const b = createContext({ duration: 2 });
    a.setState("activeIndex", 3);

    expect(b.getConfig("duration")).toBe(2);
    expect(b.getState("activeIndex")).toBeUndefined();
  });
});

describe("context state", () => {
  it("mirrors public keys into the reactive state", async () => {
    const ctx = createContext();
    const seen: (number | undefined)[] = [];
    watch(
      () => ctx.state.activeIndex,
      value => seen.push(value)
    );

    ctx.setState("activeIndex", 1);
    await nextTick();
    ctx.setState("activeIndex", 2);
    await nextTick();

    expect(seen).toEqual([1, 2]);
    expect(ctx.getState("activeIndex")).toBe(2);
  });

  it("maps isInitialized to isActive as a boolean", () => {
    const ctx = createContext();
    ctx.setState("isInitialized", true);

    expect(ctx.state.isActive).toBe(true);
    ctx.setState("isInitialized", undefined);
    expect(ctx.state.isActive).toBe(false);
  });

  it("keeps internals out of the reactive state", () => {
    const ctx = createContext();
    ctx.setState("__activeStagePosition", { x: 1, y: 2, width: 3, height: 4 });

    expect(ctx.getState("__activeStagePosition")).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    expect(ctx.state.stage).toBeUndefined();
  });

  it("resets both stores", () => {
    const ctx = createContext();
    ctx.setState("isInitialized", true);
    ctx.setState("activeIndex", 4);
    ctx.state.stage = { x: 0, y: 0, width: 1, height: 1 };
    ctx.state.refreshTick = 5;

    ctx.resetState();

    expect(ctx.getState()).toEqual({});
    expect(ctx.state.isActive).toBe(false);
    expect(ctx.state.activeIndex).toBeUndefined();
    expect(ctx.state.stage).toBeUndefined();
    expect(ctx.state.refreshTick).toBe(0);
  });

  it("builds hook opts from the plain state", () => {
    const ctx = createContext({ duration: 9 });
    ctx.setState("activeIndex", 2);
    const opts = ctx.getHookOpts();

    expect(opts.index).toBe(2);
    expect(opts.config.duration).toBe(9);
    expect(opts.state.activeIndex).toBe(2);
  });
});

describe("context emitter", () => {
  it("keeps one listener per event and resets", () => {
    const ctx = createContext();
    const first = vi.fn();
    const second = vi.fn();

    ctx.listen("nextClick", first);
    ctx.listen("nextClick", second);
    ctx.emit("nextClick");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    ctx.resetEmitter();
    ctx.emit("nextClick");
    expect(second).toHaveBeenCalledTimes(1);
  });
});
