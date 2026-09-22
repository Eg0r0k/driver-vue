import type { ExampleGroup } from "./types";

export const highlightGroup: ExampleGroup = {
  slug: "highlight",
  title: "Highlight",
  intro: "Spotlight a single element with `highlight()`: no tour, no navigation, just the overlay and a popover.",
  examples: [
    {
      id: "simple-highlight",
      title: "Simple Highlight",
      description: "Highlight a single element without animation.",
      run: ctx => {
        ctx.configure({ animate: false }).highlight({
          element: "#large-paragraph-text",
          popover: {
            title: "driver-vue",
            description:
              "Highlight anything, anywhere on the page. Yes, literally anything including SVG portions and scrollable items.",
            align: "start",
            side: "top",
          },
        });
      },
    },
    {
      id: "animated-highlight",
      title: "Animated Highlight",
      description: "Highlight with animation and lifecycle hooks written to the log.",
      run: ctx => {
        ctx
          .configure({
            animate: true,
            popoverOffset: 10,
            stagePadding: 10,
            onDeselected: (element, step) => ctx.log("Deselected element", element, step),
            onHighlightStarted: (element, step) => ctx.log("Started highlighting element", element, step),
            onHighlighted: (element, step) => ctx.log("Highlighted element", element, step),
          })
          .highlight({
            element: "h2",
            popover: {
              title: "MIT License",
              description: "A lightweight engine to drive the user's focus, rendered with Vue.",
              side: "bottom",
              align: "start",
            },
          });
      },
    },
    {
      id: "transition-highlight",
      title: "Transition Highlight",
      description: "Re-highlight different elements to watch the stage and popover transition between them.",
      run: ctx => {
        const driverObj = ctx.configure({
          animate: true,
          onDeselected: (element, step) => ctx.log("Deselected element", element, step),
          onHighlightStarted: (element, step) => ctx.log("Started highlighting element", element, step),
          onHighlighted: (element, step) => ctx.log("Highlighted element", element, step),
        });

        driverObj.highlight({
          popover: { title: "driver-vue", description: "Highlight anything, anywhere on the page." },
        });

        window.setTimeout(() => {
          driverObj.highlight({
            element: ".buttons button:first-child",
            popover: { title: "driver-vue", description: "Highlight anything, anywhere on the page." },
          });
        }, 2000);

        window.setTimeout(() => {
          driverObj.highlight({
            popover: { title: "driver-vue", description: "Highlight anything, anywhere on the page." },
          });
        }, 4000);

        window.setTimeout(() => {
          driverObj.highlight({ element: "h2", popover: { description: "driver-vue" } });
        }, 6000);
      },
    },
    {
      id: "off-screen-highlight",
      title: "Off Screen Highlight",
      description: "Highlight an element that is taller than the viewport.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".demo-container",
          popover: {
            title: "Off Screen Highlight",
            description: "The page scrolls to bring partially off-screen elements into view automatically.",
            side: "bottom",
            align: "start",
          },
        });
      },
    },
    {
      id: "nested-highlight",
      title: "Nested Element Highlight",
      description: "Highlight a deeply nested inline element.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".page-header h1 sup",
          popover: {
            title: "Nested Highlight",
            description: "Even tiny nested elements are highlighted precisely without z-index hacks.",
            side: "bottom",
            align: "start",
          },
        });
      },
    },
    {
      id: "svg-highlight",
      title: "SVG Element",
      description: "Highlight a single shape inside an inline SVG.",
      run: ctx => {
        ctx.configure({ stagePadding: 6, stageRadius: 6 }).highlight({
          element: "#svg-bar-2",
          popover: {
            title: "SVG Portions",
            description: "Any element with a box works, including shapes inside an inline SVG chart.",
            side: "right",
            align: "start",
          },
        });
      },
    },
    {
      id: "form-field-highlight",
      title: "Form Field",
      description: "Highlight an input and keep it interactive, so the user can type while reading the hint.",
      run: ctx => {
        ctx.configure({ disableActiveInteraction: false }).highlight({
          element: "#form-email",
          popover: {
            title: "Contextual Help",
            description: "The highlighted field stays focusable and typeable. Try entering an email address.",
            side: "right",
            align: "center",
          },
        });
      },
    },
    {
      id: "dark-highlight",
      title: "Super Dark Highlight",
      description: "Increase the overlay opacity for a darker backdrop.",
      run: ctx => {
        ctx.configure({ animate: true, overlayOpacity: 0.9 }).highlight({ element: "ul.feature-list" });
      },
    },
    {
      id: "dim-highlight",
      title: "Super Dim Highlight",
      description: "Lower the overlay opacity for a subtle backdrop.",
      run: ctx => {
        ctx.configure({ animate: true, overlayOpacity: 0.2 }).highlight({ element: ".buttons" });
      },
    },
    {
      id: "backdrop-color",
      title: "Backdrop Color",
      description: "Tint the overlay with a custom colour.",
      run: ctx => {
        ctx.configure({ overlayColor: "blue", overlayOpacity: 0.3 }).highlight({ element: "#card-1" });
      },
    },
    {
      id: "scrollable-area",
      title: "Scrollable Area",
      description: "Highlight an element inside a scrollable container.",
      run: ctx => {
        ctx.configure({ animate: true }).highlight({ element: "#scrollable-area" });
      },
    },
    {
      id: "inner-scroll-area",
      title: "Inner Scroll Area",
      description: "Highlight a paragraph nested inside the scrollable container.",
      run: ctx => {
        ctx.configure({ animate: true }).highlight({ element: "#third-scroll-paragraph" });
      },
    },
    {
      id: "no-element",
      title: "No Element",
      description: "Show a popover that is not attached to any element, with HTML content.",
      run: ctx => {
        ctx
          .configure({
            animate: true,
            onDestroyed: (element, step) => ctx.log("Close modal", element, step),
            onDeselected: (element, step) => ctx.log("Deselected element", element, step),
            onHighlightStarted: (element, step) => ctx.log("Started highlighting element", element, step),
            onHighlighted: (element, step) => ctx.log("Highlighted element", element, step),
          })
          .highlight({
            popover: {
              showButtons: [],
              description:
                "<div class='gif-popover'><img style='max-width: 100%' src='https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExajhtbHRuc21hbHRmaGdtMjB5NTNmOTljaW9xZzU1Z3piMjh1aWpqdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cMnt7i2RykmpW/200.webp' /><p>Go and build something cool!</p></div>",
            },
          });
      },
    },
    {
      id: "disallow-close",
      title: "Disallow Close",
      description:
        "Prevent the overlay click and Escape from closing the highlight (use the Run button of another example, or the reset, to leave).",
      run: ctx => {
        ctx.configure({ animate: true, allowClose: false }).highlight({
          element: ".buttons",
          popover: {
            title: "No Way Out",
            description: "allowClose: false disables the close button, Escape and the overlay click.",
            showButtons: ["next"],
            nextBtnText: "Got it",
            onNextClick: (_element, _step, opts) => opts.driver.destroy(),
          },
        });
      },
    },
  ],
};
