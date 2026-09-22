import type { ExampleGroup } from "./types";

export const instancesGroup: ExampleGroup = {
  slug: "instances",
  title: "Multiple Instances",
  intro: "Several drivers can live on one page, each with its own config, steps and state.",
  examples: [
    {
      id: "multiple-instances",
      title: "Independent Instances",
      description:
        "Two drivers created back-to-back keep their own config, steps and state. Instance A drives first, then hands off to Instance B; the log shows each report its own config.",
      run: ctx => {
        // A is created first, then B: the order that used to leak config across instances.
        const instanceA = ctx.configure({
          overlayColor: "#1d4ed8",
          showProgress: true,
          showButtons: ["next", "previous"],
          steps: [
            {
              element: ".page-header",
              popover: {
                title: "Instance A",
                description:
                  "This tour belongs to the first driver: blue overlay, progress shown. It was created before Instance B.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: ".feature-list",
              popover: {
                title: "Still Instance A",
                description:
                  "Instance B was created afterwards with different settings, yet this tour still runs Instance A's own config and steps.",
                side: "top",
                align: "start",
              },
            },
          ],
          onDestroyed: () => instanceB.drive(),
        });

        const instanceB = ctx.create({
          overlayColor: "#15803d",
          showProgress: false,
          showButtons: ["next"],
          steps: [
            {
              element: ".buttons",
              popover: {
                title: "Instance B",
                description:
                  "A second, independent driver: green overlay, no progress, different steps. Creating it never disturbed Instance A.",
                side: "top",
                align: "start",
              },
            },
            {
              popover: {
                title: "Fully Isolated",
                description:
                  "Config, steps, active state and hooks are scoped per instance, so any number of drivers can coexist on one page.",
              },
            },
          ],
        });

        ctx.log("Instance A overlayColor:", instanceA.getConfig().overlayColor);
        ctx.log("Instance B overlayColor:", instanceB.getConfig().overlayColor);

        instanceA.drive();
      },
    },
  ],
};
