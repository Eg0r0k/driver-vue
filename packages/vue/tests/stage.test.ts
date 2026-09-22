import { generateStageSvgPathString, getPaddedStage } from "../src/core/stage";

const viewport = { width: 1000, height: 800 };

describe("stage path", () => {
  it("draws the full viewport and the padded cutout", () => {
    const path = generateStageSvgPathString(
      { x: 100, y: 200, width: 50, height: 20 },
      { padding: 10, radius: 5 },
      viewport
    );

    expect(path).toContain("M1000,0L0,0L0,800L1000,800L1000,0Z");
    // x - padding + radius, y - padding
    expect(path).toContain("M95,190 h60");
  });

  it("caps the radius to half of the smallest side", () => {
    const path = generateStageSvgPathString(
      { x: 0, y: 0, width: 4, height: 4 },
      { padding: 0, radius: 50 },
      viewport
    );

    expect(path).toContain("a2,2 0 0 1 2,2");
  });

  it("never produces a negative radius", () => {
    const path = generateStageSvgPathString(
      { x: 0, y: 0, width: 0, height: 0 },
      { padding: 0, radius: -5 },
      viewport
    );

    expect(path).toContain("a0,0 0 0 1 0,0");
  });
});

describe("padded stage", () => {
  it("expands the rect by the padding on every side", () => {
    expect(getPaddedStage({ x: 10, y: 20, width: 30, height: 40 }, 5)).toEqual({
      x: 5,
      y: 15,
      width: 40,
      height: 50,
    });
  });
});
