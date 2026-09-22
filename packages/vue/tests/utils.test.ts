import { easeInOutQuad, getFocusableElements, resolveElement } from "../src/core/utils";

describe("resolveElement", () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="btn">Go</button>';
  });

  it("resolves selectors, elements and functions", () => {
    const btn = document.getElementById("btn")!;

    expect(resolveElement("#btn")).toBe(btn);
    expect(resolveElement(btn)).toBe(btn);
    expect(resolveElement(() => btn)).toBe(btn);
    expect(resolveElement("#missing")).toBeNull();
    expect(resolveElement(undefined)).toBeUndefined();
  });
});

describe("easeInOutQuad", () => {
  it("is normalized and symmetric", () => {
    expect(easeInOutQuad(0)).toBe(0);
    expect(easeInOutQuad(0.5)).toBe(0.5);
    expect(easeInOutQuad(1)).toBe(1);
    expect(easeInOutQuad(0.25)).toBeCloseTo(0.125);
    expect(easeInOutQuad(0.75)).toBeCloseTo(0.875);
  });
});

describe("getFocusableElements", () => {
  it("returns visible, enabled focusable descendants (and the parent itself)", () => {
    document.body.innerHTML = `
      <div id="root">
        <a href="#a">a</a>
        <button disabled>no</button>
        <button id="ok">ok</button>
        <input type="text" />
      </div>
      <button id="outer">outer</button>`;
    const root = document.getElementById("root")!;
    const outer = document.getElementById("outer")!;

    // happy-dom has no layout; treat every element as visible through getClientRects.
    document.querySelectorAll("*").forEach(el => {
      (el as HTMLElement).getClientRects = () => [{}] as unknown as DOMRectList;
    });

    const found = getFocusableElements([root, outer]);

    expect(found.map(el => el.tagName.toLowerCase() + (el.id ? "#" + el.id : ""))).toEqual([
      "a",
      "button#ok",
      "input",
      "button#outer",
    ]);
  });
});
