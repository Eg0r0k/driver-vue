import type { ExampleGroup } from "./types";
import { basicTourSteps } from "./shared";

export const apiGroup: ExampleGroup = {
  slug: "api",
  title: "API & Hooks",
  intro: "Lifecycle hooks, state getters and the instance methods; everything reports to the log panel.",
  examples: [
    {
      id: "hooks",
      title: "Lifecycle Hooks",
      description: "Log every lifecycle hook to the log panel as elements are highlighted.",
      run: ctx => {
        const describe = (element?: Element) => element?.textContent?.trim().slice(0, 10) || " - N/A -";

        const driverObj = ctx.configure({
          animate: true,
          onDeselected: (element, step) => ctx.log(`Deselected: ${describe(element)}`, step),
          onHighlightStarted: (element, step) => ctx.log(`Highlight Started: ${describe(element)}`, step),
          onHighlighted: (element, step) => ctx.log(`Highlighted: ${describe(element)}`, step),
          onDestroyed: (element, step) => ctx.log(`Destroyed: ${describe(element)}`, step),
        });

        driverObj.highlight({
          element: "#hooks-list",
          popover: { title: "Hooks", description: "Watch the log panel to follow each hook as it fires." },
        });

        window.setTimeout(() => {
          driverObj.highlight({
            popover: { title: "Popup Hook", description: "There is no element below this popover." },
          });
        }, 1000);

        window.setTimeout(() => {
          driverObj.highlight({
            element: "ul.feature-list",
            popover: { description: "Back to an element again." },
          });
        }, 2000);
      },
    },
    {
      id: "api-test",
      title: "API Test",
      description: "Read tour state (index, first/last step) inside onPopoverRender.",
      run: ctx => {
        const driverObj = ctx.configure({
          animate: true,
          steps: basicTourSteps,
          disableActiveInteraction: true,
          showProgress: true,
          progressText: "{{current}} of {{total}} done",
          onPopoverRender: popover => {
            popover.title!.innerHTML = `${driverObj.getActiveIndex()} ${driverObj.hasNextStep() ? "Yes" : "No"} ${
              driverObj.hasPreviousStep() ? "Yes" : "No"
            }`;
            popover.description!.innerHTML = `${driverObj.isFirstStep() ? "Yes" : "No"} ${
              driverObj.isLastStep() ? "Yes" : "No"
            }`;

            ctx.log("Active index:", driverObj.getActiveIndex());
            ctx.log("Active step:", driverObj.getActiveStep());
          },
        });

        driverObj.drive(4);
      },
    },
    {
      id: "is-active",
      title: "Is Active?",
      description: "Check whether a driver instance is currently active (shows a notice).",
      run: ctx => {
        const driverObj = ctx.configure();
        ctx.notice(`isActive: ${driverObj.isActive()}`);
      },
    },
    {
      id: "activate-check",
      title: "Activate and Check",
      description: "Highlight, then report the active status before and after destroying.",
      run: ctx => {
        const driverObj = ctx.configure({ showButtons: [] });

        driverObj.highlight({
          element: "#card-1",
          popover: {
            title: "Check if driver is active",
            description: "This will report the status after 2 seconds.",
            side: "bottom",
            align: "start",
          },
        });

        setTimeout(() => {
          ctx.notice(`Status: ${driverObj.isActive()}. Destroying driver...`);
          ctx.log(`Status before destroy: ${driverObj.isActive()}`);
          driverObj.destroy();
          setTimeout(() => {
            ctx.notice(`Status: ${driverObj.isActive()}`);
            ctx.log(`Status after destroy: ${driverObj.isActive()}`);
          }, 0);
        }, 2000);
      },
    },
    {
      id: "destroy",
      title: "Destroy",
      description: "Tear down any active driver instance.",
      run: ctx => {
        ctx.driver.destroy();
        ctx.log("destroy() called; active:", ctx.driver.isActive());
      },
    },
  ],
};
