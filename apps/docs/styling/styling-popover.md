# Styling Popover

The default popover is styled with CSS variables and the driver.js class names. Change the variables for colors and sizes, write rules against the class names for anything else, and use [slots or components](./custom-components) when you need different markup.

## With CSS variables

Pass a `popoverClass` (in the config or per step) and set the variables under it. This is the yellow theme from the driver.js docs:

<Demo
  id="popover-theme"
  title="Using CSS variables"
  button-text="Yellow theme"
  :config="{ showButtons: ['next', 'previous'], popoverClass: 'driverjs-theme' }"
  :steps="[
    { element: '#popover-theme .demo-box', popover: { align: 'start', side: 'left', title: 'Yellow theme', description: 'The popoverClass driverjs-theme sets the popover variables.' } },
    { element: '#popover-theme h4', popover: { align: 'start', side: 'bottom', title: 'Buttons', description: 'The footer buttons read the --driver-popover-btn-* variables.' } },
    { element: '#popover-theme .demo-button', popover: { align: 'start', side: 'left', title: 'Class rules', description: 'The equal-width buttons come from two plain CSS rules.' } },
  ]"
>
  <DemoBox prefix="pt" />
</Demo>

```ts
const { drive } = useDriver({
  popoverClass: "driverjs-theme",
  steps: [
    /* ... */
  ],
});
```

```css
.driver-popover.driverjs-theme {
  --driver-popover-bg: #fde047;
  --driver-popover-color: #000;
  --driver-popover-title-size: 20px;
  --driver-popover-progress-color: #000;
  --driver-popover-close-color: #9b9b9b;
  --driver-popover-close-hover-color: #000;
  --driver-popover-btn-bg: #000;
  --driver-popover-btn-hover-bg: #000;
  --driver-popover-btn-color: #fff;
  --driver-popover-btn-border: 2px solid #000;
  --driver-popover-btn-radius: 6px;
  --driver-popover-btn-font-size: 14px;
}

.driver-popover.driverjs-theme .driver-popover-footer-btn {
  flex: 1;
  text-align: center;
  padding: 5px 8px;
}

.driver-popover.driverjs-theme .driver-popover-navigation-btns {
  justify-content: space-between;
  gap: 3px;
}
```

The arrow follows `--driver-popover-bg`. The full list of variables is in [Theming](../guide/theming#css-variables).

## With class names

Every element carries the driver.js class names, so plain CSS works too. The same theme written the driver.js way:

```css
.driver-popover.driverjs-theme {
  background-color: #fde047;
  color: #000;
}

.driver-popover.driverjs-theme .driver-popover-title {
  font-size: 20px;
}

.driver-popover.driverjs-theme button {
  background-color: #000;
  color: #fff;
  border: 2px solid #000;
  border-radius: 6px;
}

.driver-popover.driverjs-theme .driver-popover-arrow-side-left.driver-popover-arrow {
  border-left-color: #fde047;
}

/* ... and the other three arrow sides */
```

The rendered side and alignment are in the `driver-popover-side-*` and `driver-popover-align-*` classes and in the `data-side` and `data-align` attributes. They reflect where the popover ended up, which is not always the requested side (see [Popover position](../examples/popover-position)). All class names are listed in [Theming](../guide/theming#class-names).

## Dark theme

A dark theme is another set of values for the same variables:

<ThemeDemo />

```css
.driver-popover.docs-dark-theme {
  --driver-popover-bg: #18181b;
  --driver-popover-color: #f4f4f5;
  --driver-popover-radius: 12px;
  --driver-popover-padding: 20px;
  --driver-popover-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  --driver-popover-progress-color: #a1a1aa;
  --driver-popover-close-color: #71717a;
  --driver-popover-close-hover-color: #fff;
  --driver-popover-btn-bg: #3866e8;
  --driver-popover-btn-hover-bg: #2f57cc;
  --driver-popover-btn-color: #fff;
  --driver-popover-btn-border: 1px solid transparent;
  --driver-popover-btn-radius: 8px;
  --driver-popover-btn-font-size: 13px;
}
```

## The arrow

The arrow is a CSS triangle, `.driver-popover-arrow`. Its size and color are variables; turn it off with `showArrow: false` in the config or per step:

```ts
useDriver({ showArrow: false });

const step = { element: "#x", popover: { title: "No arrow", showArrow: false } };
```

```css
.driver-popover {
  --driver-popover-arrow-size: 8px;
  --driver-popover-arrow-color: #111827;
}

.driver-popover-arrow-side-bottom {
  filter: drop-shadow(0 -1px 0 #e5e7eb);
}
```

The class `driver-popover-arrow-side-top|right|bottom|left` sets which edge the arrow is on. It is named like the popover side: `driver-popover-arrow-side-bottom` is on the top edge of a popover below its element. While the element is scrolled out of view the arrow can move to another edge, the one that faces the element. When there is nothing to point at (a step without an element, or no side with room) the arrow gets `driver-popover-arrow-none` and is hidden. Its offset along the edge is an inline style. To replace the arrow with your own element, use the [`#arrow` slot](./custom-components#the-arrow).

## While the element is out of view

When the highlighted element is scrolled out of the viewport, the popover stays pinned to the nearest edge and gets the class `driver-popover-away`. With `scrollBackOnClick` on, it also gets `driver-popover-scroll-back`, which sets `cursor: pointer`. Use them to show that the popover is detached:

```css
.driver-popover.driver-popover-away {
  opacity: 0.9;
}
```

The behaviour and its options are described in [Element out of view](../examples/scroll-away).

## Changing the DOM with a hook

`onPopoverRender` runs once the popover is in the DOM, with references to its parts. Here it adds a "Go to first" button, as in the driver.js docs:

<CustomButtonDemo />

```ts
const { drive, driver } = useDriver({
  onPopoverRender: (popover, { config, state }) => {
    const firstButton = document.createElement("button");
    firstButton.className = "driver-popover-footer-btn";
    firstButton.innerText = "Go to first";
    popover.footerButtons?.prepend(firstButton);

    firstButton.addEventListener("click", () => driver.drive(0));
  },
  steps: [
    /* ... */
  ],
});
```

The parts are `wrapper`, `arrow`, `title`, `description`, `footer`, `progress`, `previousButton`, `nextButton`, `closeButton` and `footerButtons`. A part that a [custom body](./custom-components) does not render is `null`, hence the `?.`. In Vue code, a slot is usually simpler than DOM changes.
