import type { ExampleContext, ExampleGroup } from "./types";
import { basicTourSteps } from "./shared";

// Each example runs the same tour at a different `duration` so the effect on
// both the stage slide and the fade-in can be compared side by side.
const tourWithDuration = (ctx: ExampleContext, duration: number) => {
  ctx
    .configure({
      duration,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: basicTourSteps,
    })
    .drive();
};

export const durationGroup: ExampleGroup = {
  slug: "duration",
  title: "Animation Duration",
  intro: "One `duration` controls both the stage slide between elements and the popover fade-in.",
  examples: [
    {
      id: "duration-fast",
      title: "Fast (150ms)",
      description: "The spotlight snaps between steps and the popover fades in almost instantly.",
      run: ctx => {
        tourWithDuration(ctx, 150);
      },
    },
    {
      id: "duration-default",
      title: "Default (400ms)",
      description: "The default speed: slide and fade-in both run over 400ms.",
      run: ctx => {
        tourWithDuration(ctx, 400);
      },
    },
    {
      id: "duration-slow",
      title: "Slow (1200ms)",
      description: "The hole glides slowly and the popover fade-in is clearly visible.",
      run: ctx => {
        tourWithDuration(ctx, 1200);
      },
    },
    {
      id: "duration-very-slow",
      title: "Very Slow (2500ms)",
      description: "An exaggerated transition, useful for confirming slide and fade stay in sync.",
      run: ctx => {
        tourWithDuration(ctx, 2500);
      },
    },
  ],
};
