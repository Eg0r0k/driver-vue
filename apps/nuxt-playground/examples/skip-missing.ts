import type { ExampleGroup } from "./types";

export const skipMissingGroup: ExampleGroup = {
  slug: "skip-missing",
  title: "Skip Missing",
  intro: "Steps whose target is not on the page can be skipped instead of falling back to a centered popover.",
  examples: [
    {
      id: "skip-missing-element",
      title: "Skip Missing Element",
      description:
        "With skipMissingElement on, steps whose target is not on the page (#not-on-page-*) are skipped, while present and element-less steps still show.",
      run: ctx => {
        ctx
          .configure({
            showProgress: true,
            skipMissingElement: true,
            steps: [
              {
                element: ".page-header",
                popover: { title: "Present", description: "This element exists, so it is shown." },
              },
              {
                element: "#not-on-page-1",
                popover: { title: "Skipped", description: "You should never see this. Its element is missing." },
              },
              {
                element: ".page-header h1",
                popover: { title: "Present", description: "The missing step above was skipped to get here." },
              },
              {
                element: "#not-on-page-2",
                popover: { title: "Skipped", description: "This one is skipped too." },
              },
              {
                popover: {
                  title: "Element-less Step",
                  description: "Steps without any element are intentional and never skipped.",
                },
              },
              {
                element: ".buttons",
                popover: { title: "Present", description: "The final present step." },
              },
            ],
          })
          .drive();
      },
    },
    {
      id: "skip-missing-step-level",
      title: "Skip Missing (Step Level)",
      description:
        "skipMissingElement can be set per step. Only the opted-in step is skipped when missing; others fall back to the centered popover.",
      run: ctx => {
        ctx
          .configure({
            showProgress: true,
            steps: [
              {
                element: ".page-header",
                popover: { title: "Present", description: "This element exists." },
              },
              {
                element: "#not-on-page",
                skipMissingElement: true,
                popover: { title: "Skipped", description: "Opted in at the step level, so it is skipped." },
              },
              {
                element: ".buttons",
                popover: { title: "Present", description: "We land here after the missing step is skipped." },
              },
            ],
          })
          .drive();
      },
    },
  ],
};
