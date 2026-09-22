import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { click, createDriver, flush, navButton, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

// The footer button styling lives in src/style.css. happy-dom resolves the
// selectors below through getComputedStyle but does not understand custom
// properties, so the footer button rule is lifted out of the stylesheet with
// its var() references resolved against the :root tokens, and injected once;
// the harness only resets <body>, so it survives each test.
beforeAll(() => {
  const styleCss = readFileSync(
    resolve((globalThis as unknown as { process: { cwd(): string } }).process.cwd(), "src/style.css"),
    "utf8"
  );
  const rule = styleCss.match(/\.driver-popover-footer-btn \{[^}]*\}/)?.[0];
  const root = styleCss.match(/:root \{([^}]*)\}/)?.[1];
  if (!rule || !root) {
    throw new Error("footer button rule or :root tokens not found in style.css");
  }

  const tokens = new Map<string, string>();
  for (const [, name, value] of root.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens.set(name, value.trim());
  }

  const style = document.createElement("style");
  style.textContent = rule.replace(/var\((--[\w-]+)\)/g, (_, name) => tokens.get(name) ?? "0");
  document.head.appendChild(style);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const addCustomFooterButton = async (opts: {
  keepDefaultStyle: boolean;
}): Promise<{
  button: HTMLButtonElement;
  onClick: ReturnType<typeof vi.fn>;
}> => {
  const onClick = vi.fn();
  const button = document.createElement("button");
  button.id = "custom-footer-btn";
  button.innerText = "Custom";
  if (opts.keepDefaultStyle) {
    button.classList.add("driver-popover-footer-btn");
  }
  button.addEventListener("click", onClick);

  const d = createDriver({
    animate: false,
    steps: SAMPLE_STEPS,
    onPopoverRender: popover => {
      popover.footerButtons!.appendChild(button);
    },
  });
  await d.drive();

  return { button, onClick };
};

describe("footer button styling", () => {
  it("styles the built-in navigation buttons through the footer button class", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    const next = navButton("next")!;
    expect(next.classList.contains("driver-popover-footer-btn")).toBe(true);
    expect(navButton("prev")!.classList.contains("driver-popover-footer-btn")).toBe(true);

    const styles = getComputedStyle(next);
    expect(styles.paddingTop).toBe("3px");
    expect(styles.paddingLeft).toBe("7px");
    expect(styles.borderRadius).toBe("3px");
  });

  it("lets a custom footer button opt out of the default button styling", async () => {
    const { button } = await addCustomFooterButton({ keepDefaultStyle: false });

    const styles = getComputedStyle(button);
    expect(styles.paddingTop).not.toBe("3px");
    expect(styles.borderRadius).not.toBe("3px");
  });

  it("lets a custom footer button opt in to the default button styling", async () => {
    const { button } = await addCustomFooterButton({ keepDefaultStyle: true });

    const styles = getComputedStyle(button);
    expect(styles.paddingTop).toBe("3px");
    expect(styles.paddingLeft).toBe("7px");
    expect(styles.borderRadius).toBe("3px");
  });
});

describe("custom footer button click handling", () => {
  it("does not swallow clicks on a custom footer button that opted in to the style", async () => {
    const { button, onClick } = await addCustomFooterButton({ keepDefaultStyle: true });

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    button.dispatchEvent(event);
    await flush();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
  });

  it("still intercepts clicks on the built-in navigation buttons", async () => {
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onNextClick });
    await d.drive();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    navButton("next")!.dispatchEvent(event);
    await flush();

    expect(onNextClick).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("keeps a custom button in place until the next step renders", async () => {
    const { button } = await addCustomFooterButton({ keepDefaultStyle: true });
    expect(document.querySelector("#custom-footer-btn")).toBe(button);

    await click(navButton("next"));

    // A fresh popover mounted for step 2; the hook appended the same node again.
    expect(document.querySelector("#custom-footer-btn")).toBe(button);
    expect(button.closest(".driver-popover-navigation-btns")).not.toBeNull();
  });
});
