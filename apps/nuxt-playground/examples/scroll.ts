import type { ExampleContext, ExampleGroup } from "./types";
import { basicTourSteps } from "./shared";

// Both examples run the same tour; only `allowScroll` differs so the page's
// scrollability during the tour can be compared directly.
const tourWithScroll = (ctx: ExampleContext, allowScroll: boolean) => {
  ctx
    .configure({
      allowScroll,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: basicTourSteps,
    })
    .drive();
};

export const scrollGroup: ExampleGroup = {
  slug: "scroll",
  title: "Body Scrolling",
  intro: "Whether the page can still be scrolled while a tour is active.",
  examples: [
    {
      id: "scroll-allowed",
      title: "Scroll Allowed (default)",
      description: "While the tour is active you can still scroll the page with the wheel or trackpad.",
      run: ctx => {
        tourWithScroll(ctx, true);
      },
    },
    {
      id: "scroll-locked",
      title: "Scroll Locked",
      description: "With allowScroll:false the body is frozen: wheel and trackpad scrolling do nothing.",
      run: ctx => {
        tourWithScroll(ctx, false);
      },
    },
  ],
};
