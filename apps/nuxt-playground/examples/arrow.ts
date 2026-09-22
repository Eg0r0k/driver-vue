import type { ExampleGroup } from "./types";

// Scenarios for eyeballing the popover placement and arrow behaviour. Each
// description says what to look for.
export const arrowGroup: ExampleGroup = {
  slug: "arrow",
  title: "Popover position & arrow",
  intro:
    "The requested `side` and `align` are honoured when there is room; otherwise the popover flips or shifts, and the classes `driver-popover-side-*` / `driver-popover-align-*` reflect where it actually landed. The arrow always points at the element.",
  examples: [
    {
      id: "arrow-default-side",
      title: "Default Side",
      description: "No side set. The popover renders below the card with the arrow pointing up at it.",
      run: ctx => {
        ctx.configure().highlight({
          element: "#card-3",
          popover: {
            title: "Default Side",
            description: "No `side` was passed. It should appear below the element with the arrow pointing up at it.",
          },
        });
      },
    },
    {
      id: "arrow-tall-left-start",
      title: "Tall Element · Left · Start",
      description: "An element far taller than the popover. The arrow sits near the top of the popover.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".demo-container",
          popover: {
            title: "Tall · Left · Start",
            description: "The element spans the whole popover edge, so align=start parks the popover at the top.",
            side: "left",
            align: "start",
          },
        });
      },
    },
    {
      id: "arrow-tall-left-center",
      title: "Tall Element · Left · Center",
      description: "The same tall element; the popover and its arrow are vertically centered on it.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".demo-container",
          popover: {
            title: "Tall · Left · Center",
            description: "align=center centers the popover along the element's edge.",
            side: "left",
            align: "center",
          },
        });
      },
    },
    {
      id: "arrow-tall-left-end",
      title: "Tall Element · Left · End",
      description: "The same tall element; the popover sits near the bottom.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".demo-container",
          popover: {
            title: "Tall · Left · End",
            description: "align=end parks the popover at the bottom of the element.",
            side: "left",
            align: "end",
          },
        });
      },
    },
    {
      id: "arrow-small-left",
      title: "Small Element · Left · Center",
      description:
        "A small button and a tall popover: the arrow points at the button's vertical center, not the popover's.",
      run: ctx => {
        ctx.configure().highlight({
          element: "#card-3",
          popover: {
            title: "Small · Left",
            description:
              "Because the element does not span the popover, the arrow tracks the element rather than the popover's own alignment.",
            side: "left",
            align: "center",
          },
        });
      },
    },
    {
      id: "arrow-wide-bottom-start",
      title: "Wide Element · Bottom · Start",
      description: "A wide header and a narrower popover: the popover hangs off the left of the header.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".page-header",
          popover: {
            title: "Wide · Bottom · Start",
            description: "The element spans the whole popover edge horizontally, so align=start pins the popover left.",
            side: "bottom",
            align: "start",
          },
        });
      },
    },
    {
      id: "arrow-wide-bottom-center",
      title: "Wide Element · Bottom · Center",
      description: "The same wide header; the popover is centered horizontally under it.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".page-header",
          popover: {
            title: "Wide · Bottom · Center",
            description: "align=center centers the popover under the element.",
            side: "bottom",
            align: "center",
          },
        });
      },
    },
    {
      id: "arrow-wide-bottom-end",
      title: "Wide Element · Bottom · End",
      description: "The same wide header; the popover hangs off the right.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".page-header",
          popover: {
            title: "Wide · Bottom · End",
            description: "align=end pins the popover to the right.",
            side: "bottom",
            align: "end",
          },
        });
      },
    },
    {
      id: "arrow-right-end",
      title: "Small Element · Right · End",
      description: "The popover sits on the right of the card with the arrow on its left edge pointing at the card.",
      run: ctx => {
        ctx.configure().highlight({
          element: "#card-2",
          popover: {
            title: "Right · End",
            description: "Checks the right-edge arrow and that it stays attached and points back at the element.",
            side: "right",
            align: "end",
          },
        });
      },
    },
    {
      id: "arrow-top-start",
      title: "Top · Start",
      description: "The popover sits above the element when there is room, arrow on its bottom edge.",
      run: ctx => {
        ctx.configure().highlight({
          element: "#scrollable-area",
          popover: {
            title: "Top · Start",
            description: "There is room above the scrollable box, so the popover stays on top.",
            side: "top",
            align: "start",
          },
        });
      },
    },
    {
      id: "arrow-padding-bottom",
      title: "Stage Padding · Bottom",
      description:
        "stagePadding and popoverOffset set: a clean gap between element and popover, arrow connecting them.",
      run: ctx => {
        ctx.configure({ stagePadding: 10, popoverOffset: 10 }).highlight({
          element: "#card-3",
          popover: {
            title: "Padding · Bottom",
            description: "The popover clears the cutout by stagePadding plus popoverOffset.",
            side: "bottom",
            align: "center",
          },
        });
      },
    },
    {
      id: "arrow-flip-top",
      title: "Forced Top · Flips",
      description:
        "Asks for side=top on the header, which has no room above: the popover flips below and the arrow follows.",
      run: ctx => {
        ctx.configure().highlight({
          element: ".page-header",
          popover: {
            title: "Flip Test",
            description: "There is no room above the header, so it flips to bottom and the arrow points up.",
            side: "top",
            align: "center",
          },
        });
      },
    },
    {
      id: "arrow-shift-viewport",
      title: "Shift into Viewport",
      description: "Asks for align=end on the leftmost card: the popover shifts right so it stays inside the viewport.",
      run: ctx => {
        ctx.configure().highlight({
          element: "#card-1",
          popover: {
            title: "Shifted",
            description:
              "The alignment would push the popover off-screen, so it shifts back into view while the arrow keeps pointing at the card.",
            side: "bottom",
            align: "end",
          },
        });
      },
    },
    {
      id: "arrow-over-no-element",
      title: "No Element (over)",
      description: "No element: the popover is centered on screen like a modal, with no arrow.",
      run: ctx => {
        ctx.configure().highlight({
          popover: {
            title: "Centered Modal",
            description: "With no target element the popover centers itself and the arrow is hidden.",
          },
        });
      },
    },
  ],
};
