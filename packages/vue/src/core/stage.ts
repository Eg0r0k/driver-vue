import type { StageRect } from "../types";

export type StageOptions = {
  padding: number;
  radius: number;
};

export type Viewport = {
  width: number;
  height: number;
};

export const getViewport = (): Viewport => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
};

/** The padded cutout box (what the overlay cuts out and what `.driver-stage` covers). */
export const getPaddedStage = (stage: StageRect, padding: number): StageRect => ({
  x: stage.x - padding,
  y: stage.y - padding,
  width: stage.width + padding * 2,
  height: stage.height + padding * 2,
});

export const generateStageSvgPathString = (
  stage: StageRect,
  options: StageOptions,
  viewport: Viewport = getViewport()
): string => {
  const windowX = viewport.width;
  const windowY = viewport.height;

  const stagePadding = options.padding;
  const stageRadius = options.radius;

  const stageWidth = stage.width + stagePadding * 2;
  const stageHeight = stage.height + stagePadding * 2;

  const limitedRadius = Math.min(stageRadius, stageWidth / 2, stageHeight / 2);

  const normalizedRadius = Math.floor(Math.max(limitedRadius, 0));

  const highlightBoxX = stage.x - stagePadding + normalizedRadius;
  const highlightBoxY = stage.y - stagePadding;
  const highlightBoxWidth = stageWidth - normalizedRadius * 2;
  const highlightBoxHeight = stageHeight - normalizedRadius * 2;

  return `M${windowX},0L0,0L0,${windowY}L${windowX},${windowY}L${windowX},0Z
    M${highlightBoxX},${highlightBoxY} h${highlightBoxWidth} a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},${normalizedRadius} v${highlightBoxHeight} a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},${normalizedRadius} h-${highlightBoxWidth} a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},-${normalizedRadius} v-${highlightBoxHeight} a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},-${normalizedRadius} z`;
};
