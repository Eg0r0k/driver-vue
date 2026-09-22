import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, shallowRef, type Ref } from "vue";
import { useDriverPosition, type UseDriverPositionReturn } from "../src/composables/useDriverPosition";
import type { Alignment, Side, StageRect } from "../src/types";

// Exercises the positioning composable through a small host component, the way
// <DriverPopover> and any custom popover use it. happy-dom does no layout, so
// the reference is a plain rect and the floating box reports its size through
// offsetWidth/offsetHeight.

const settle = async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
};

const ELEMENT: StageRect = { x: 400, y: 400, width: 200, height: 20 };

type HostOptions = {
  reference?: StageRect | Element;
  side?: Side;
  align?: Alignment;
  offset?: number;
  padding?: number;
  centered?: boolean;
  size?: { width: number; height: number };
};

const mountHost = (options: HostOptions = {}) => {
  const side = ref<Side>(options.side ?? "bottom");
  const align = ref<Alignment>(options.align ?? "start");
  const centered = ref(!!options.centered);
  const reference = shallowRef<StageRect | Element | undefined>("reference" in options ? options.reference : ELEMENT);
  const size = options.size ?? { width: 200, height: 100 };

  let position!: UseDriverPositionReturn;

  const Host = defineComponent({
    setup: () => {
      const floating = ref<HTMLElement | null>(null);
      const arrow = ref<HTMLElement | null>(null);

      position = useDriverPosition({
        reference,
        floating,
        arrow,
        side,
        align,
        offset: options.offset ?? 10,
        padding: options.padding ?? 0,
        centered,
      });

      return () =>
        h("div", { ref: floating, class: "box", style: position.floatingStyles.value }, [
          h("div", { ref: arrow, class: "arrow", style: position.arrowStyles.value }),
        ]);
    },
  });

  const wrapper = mount(Host, { attachTo: document.body });
  const box = wrapper.element as HTMLElement;
  Object.defineProperty(box, "offsetWidth", { value: size.width, configurable: true });
  Object.defineProperty(box, "offsetHeight", { value: size.height, configurable: true });

  return { wrapper, box, position, side, align, centered, reference, settle };
};

describe("useDriverPosition", () => {
  it("positions the floating element with fixed left/top styles", async () => {
    const { box, position, settle } = mountHost({ side: "top" });
    await settle();
    await position.update();
    await settle();

    // top: 400 - 10 - 100 = 290; left: 400.
    expect(box.style.position).toBe("fixed");
    expect(box.style.top).toBe("290px");
    expect(box.style.left).toBe("400px");
    expect(position.isPositioned.value).toBe(true);
  });

  it("reports the requested side and alignment when they fit", async () => {
    const { position, settle } = mountHost({ side: "right", align: "end" });
    await settle();
    await position.update();
    await settle();

    expect(position.side.value).toBe("right");
    expect(position.align.value).toBe("end");
  });

  it("maps align center to the plain placement", async () => {
    const { position, box, settle } = mountHost({ side: "bottom", align: "center" });
    await settle();
    await position.update();
    await settle();

    expect(position.align.value).toBe("center");
    // Element center x 500 minus half the box width.
    expect(box.style.left).toBe("400px");
  });

  it("expands the reference by the padding", async () => {
    const { box, position, settle } = mountHost({ side: "top", padding: 10 });
    await settle();
    await position.update();
    await settle();

    // top: (400 - 10) - 10 - 100 = 280; left: 390.
    expect(box.style.top).toBe("280px");
    expect(box.style.left).toBe("390px");
  });

  it("flips to the opposite side when there is no room", async () => {
    const { position, settle } = mountHost({
      side: "top",
      reference: { x: 400, y: 20, width: 200, height: 20 },
    });
    await settle();
    await position.update();
    await settle();

    expect(position.side.value).toBe("bottom");
  });

  it("reacts to a changed side", async () => {
    const { position, side, settle } = mountHost({ side: "bottom" });
    await settle();
    await position.update();
    await settle();
    expect(position.side.value).toBe("bottom");

    side.value = "left";
    await settle();
    await position.update();
    await settle();

    expect(position.side.value).toBe("left");
  });

  it("reads the live rect of an element reference", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.getBoundingClientRect = () =>
      ({
        x: 100,
        y: 300,
        top: 300,
        left: 100,
        right: 300,
        bottom: 320,
        width: 200,
        height: 20,
        toJSON: () => {},
      }) as DOMRect;

    const { box, position, settle } = mountHost({ side: "top", reference: el });
    await settle();
    await position.update();
    await settle();

    expect(box.style.top).toBe("190px");
    expect(box.style.left).toBe("100px");

    el.getBoundingClientRect = () =>
      ({
        x: 500,
        y: 600,
        top: 600,
        left: 500,
        right: 700,
        bottom: 620,
        width: 200,
        height: 20,
        toJSON: () => {},
      }) as DOMRect;
    await position.update();
    await settle();

    expect(box.style.top).toBe("490px");
    expect(box.style.left).toBe("500px");
    el.remove();
  });

  it("centers in the viewport and reports 'over' when centered", async () => {
    const { box, position, settle } = mountHost({ centered: true });
    await settle();

    expect(position.side.value).toBe("over");
    expect(box.style.position).toBe("fixed");
    expect(box.style.left).toBe("50%");
    expect(box.style.top).toBe("50%");
    expect(box.style.transform).toBe("translate(-50%, -50%)");
    expect(position.arrowStyles.value).toEqual({});
  });

  it("offsets the arrow along the edge facing the reference", async () => {
    const { position, settle } = mountHost({ side: "bottom", align: "start" });
    await settle();
    await position.update();
    await settle();

    // A bottom placement has a horizontal edge: only `left` is set.
    expect(position.arrowStyles.value.left).toMatch(/px$/);
    expect(position.arrowStyles.value.top).toBe("");
  });

  it("switches the arrow axis for a side placement", async () => {
    const { position, settle } = mountHost({ side: "right", align: "start" });
    await settle();
    await position.update();
    await settle();

    expect(position.arrowStyles.value.top).toMatch(/px$/);
    expect(position.arrowStyles.value.left).toBe("");
  });

  it("keeps the requested side and the initial styles without a reference", async () => {
    const { box, position, settle } = mountHost({ reference: undefined });
    await settle();
    await position.update();
    await settle();

    expect(position.side.value).toBe("bottom");
    expect(box.style.position).toBe("fixed");
    expect(box.style.left).toBe("0px");
    expect(box.style.top).toBe("0px");
  });
});

// Keep the Ref import in use for the host typing.
export type { Ref };
