import type { ExampleGroup } from "./types";
import { basicTourSteps } from "./shared";

export const tourGroup: ExampleGroup = {
  slug: "tour",
  title: "Tour",
  intro: "Multi-step tours: navigation, progress, async steps, overlay clicks and the hooks that control the flow.",
  examples: [
    {
      id: "animated-tour",
      title: "Animated Tour",
      description: "A multi-step tour with progress and navigation buttons.",
      run: ctx => {
        ctx
          .configure({
            showProgress: true,
            showButtons: ["next", "previous", "close"],
            steps: basicTourSteps,
          })
          .drive();
      },
    },
    {
      id: "non-animated-tour",
      title: "Non-Animated Tour",
      description: "The same tour with animation disabled and a tinted overlay.",
      run: ctx => {
        ctx
          .configure({
            animate: false,
            overlayColor: "blue",
            overlayOpacity: 0.3,
            showProgress: true,
            steps: basicTourSteps,
          })
          .drive();
      },
    },
    {
      id: "async-tour",
      title: "Asynchronous Tour",
      description: "Control the tour flow and create elements on the fly via onNextClick.",
      run: ctx => {
        // Inserted into the stage's normal flow, right after the buttons row,
        // so the new element is visible where the reader is already looking.
        // It lives until the tour is destroyed, so Previous finds it too.
        const createCard = (): HTMLElement => {
          const existing = document.querySelector<HTMLElement>(".dynamic-el");
          if (existing) {
            return existing;
          }

          const card = document.createElement("div");
          card.className = "dynamic-el";
          card.textContent = "Created on the fly ✨ — this card did not exist when the tour started";
          document.querySelector(".buttons")?.insertAdjacentElement("afterend", card);
          ctx.log("Created", card);

          return card;
        };

        const driverObj = ctx.configure({
          animate: true,
          overlayOpacity: 0.3,
          showProgress: true,
          progressText: "{{current}} / {{total}}",
          onDestroyed: () => {
            document.querySelector(".dynamic-el")?.remove();
          },
          steps: [
            {
              element: ".page-header",
              popover: {
                title: "Async driver-vue",
                description: "Override `onNextClick` to take full control over when the tour advances.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: ".page-header h1",
              popover: {
                title: "Async Test",
                description: "By overriding `onNextClick` you get control over the tour.",
                side: "left",
                align: "start",
                onNextClick: () => {
                  createCard();
                  driverObj.moveNext();
                },
              },
            },
            {
              element: ".dynamic-el",
              popover: {
                title: "Dynamic Elements",
                description:
                  "This card was created right before we moved here. It stays until the tour ends, so Previous finds it as well.",
              },
            },
            {
              element: ".page-header sup",
              popover: {
                title: "Improved Hooks",
                description: "Hooks let you run logic before and after each step is highlighted.",
                side: "bottom",
                align: "start",
              },
            },
            {
              popover: {
                title: "No Element",
                description: "You can now have popovers without elements as well.",
              },
            },
            {
              element: "#scrollable-area",
              popover: {
                title: "Scrollable Areas",
                description: "There are no issues with scrollable element tours either.",
              },
            },
            {
              element: "#third-scroll-paragraph",
              popover: {
                title: "Nested Scrolls",
                description: "Even nested scrollable elements work.",
              },
            },
          ],
        });

        driverObj.drive();
      },
    },
    {
      id: "interactive-tour",
      title: "Interactive Tour (form)",
      description:
        "The highlighted element stays interactive: fill the form fields as you go. The last step advances when the submit button is clicked.",
      run: ctx => {
        ctx
          .configure({
            animate: true,
            disableActiveInteraction: false,
            showProgress: true,
            steps: [
              {
                element: "#form-name",
                popover: {
                  title: "Your name",
                  description: "Type your name into the highlighted field, then press Next.",
                  side: "right",
                  align: "start",
                },
              },
              {
                element: "#form-email",
                popover: {
                  title: "Your email",
                  description: "Fill in an email address. The field is fully interactive while highlighted.",
                  side: "right",
                  align: "start",
                },
              },
              {
                element: "#form-agree",
                popover: {
                  title: "Opt in",
                  description: "Tick the checkbox if you would like product updates.",
                  side: "right",
                  align: "start",
                },
              },
              {
                element: "#form-submit",
                advanceOnClick: true,
                popover: {
                  title: "Submit",
                  description: "Click the highlighted Submit button to finish the tour.",
                  side: "bottom",
                  align: "start",
                },
              },
            ],
          })
          .drive();
      },
    },
    {
      id: "confirm-exit-tour",
      title: "Confirm on Exit",
      description: "Ask for confirmation before the tour is destroyed.",
      run: ctx => {
        const driverObj = ctx.configure({
          animate: true,
          overlayColor: "green",
          overlayOpacity: 0.3,
          steps: basicTourSteps,
          onDestroyStarted: () => {
            if (driverObj.hasNextStep()) {
              const confirmed = window.confirm("Are you sure?");
              ctx.log("Exit confirmation:", confirmed ? "confirmed" : "cancelled");
              if (!confirmed) {
                return;
              }
            }

            driverObj.destroy();
          },
        });

        driverObj.drive();
      },
    },
    {
      id: "prevent-destroy",
      title: "Prevent Destroy",
      description:
        "The tour cannot be closed until its last step: Escape, the close button and the overlay all run onDestroyStarted, which refuses early.",
      run: ctx => {
        const driverObj = ctx.configure({
          animate: true,
          showProgress: true,
          steps: basicTourSteps,
          onDestroyStarted: () => {
            if (driverObj.isLastStep()) {
              driverObj.destroy();
              return;
            }

            ctx.notice("Finish the tour first");
            ctx.log("Destroy refused on step", driverObj.getActiveIndex());
          },
        });

        driverObj.drive();
      },
    },
    {
      id: "progress-tour",
      title: "Progress Text",
      description: "Show the default progress indicator.",
      run: ctx => {
        ctx.configure({ animate: true, steps: basicTourSteps, showProgress: true }).drive();
      },
    },
    {
      id: "progress-tour-template",
      title: "Progress Text Template",
      description: "Customise the progress text template.",
      run: ctx => {
        ctx
          .configure({
            animate: true,
            steps: basicTourSteps,
            showProgress: true,
            progressText: "{{current}} of {{total}} done",
          })
          .drive();
      },
    },
    {
      id: "reconfigure-steps",
      title: "Re-Configuring Steps",
      description: "Replace the steps after the driver has been created.",
      run: ctx => {
        const driverObj = ctx.configure({ animate: true, steps: basicTourSteps, showProgress: true });

        driverObj.setSteps([
          { element: "h1", popover: { description: "This is a new description" } },
          { element: "p", popover: { description: "This is another new description" } },
        ]);

        driverObj.drive();
      },
    },
    {
      id: "disable-keyboard-control",
      title: "Disable Keyboard Control",
      description: "Turn off arrow-key and escape navigation.",
      run: ctx => {
        const driverObj = ctx.configure({
          animate: true,
          steps: basicTourSteps,
          showProgress: true,
          allowKeyboardControl: false,
        });

        driverObj.setSteps([
          { element: "h1", popover: { description: "This is a new description" } },
          { element: "p", popover: { description: "This is another new description" } },
        ]);

        driverObj.drive();
      },
    },
    {
      id: "tour-button-listeners",
      title: "Tour Button Listeners",
      description: "Drive the tour manually from global button listeners (shows notices).",
      run: ctx => {
        const driverObj = ctx.configure({
          onNextClick: () => {
            ctx.notice("Next Clicked");
            driverObj.moveNext();
          },
          onPrevClick: () => {
            ctx.notice("Previous Clicked");
            driverObj.movePrevious();
          },
          onCloseClick: () => driverObj.destroy(),
          steps: [
            { popover: { title: "Some title", description: "Some description" } },
            { popover: { title: "Another title", description: "Some description" } },
            { popover: { title: "Yet another title", description: "Some description" } },
          ],
        });

        driverObj.drive();
      },
    },
    {
      id: "click-overlay-to-next",
      title: "Click Overlay to Next",
      description: "Advance the tour when the overlay is clicked.",
      run: ctx => {
        ctx
          .configure({
            animate: true,
            overlayClickBehavior: "nextStep",
            steps: basicTourSteps,
          })
          .drive();
      },
    },
    {
      id: "click-overlay-to-handle",
      title: "Custom Overlay Click",
      description: "Handle overlay clicks with a custom callback.",
      run: ctx => {
        ctx
          .configure({
            animate: true,
            overlayClickBehavior: () => ctx.notice("Clicking me"),
            steps: basicTourSteps,
          })
          .drive();
      },
    },
  ],
};
