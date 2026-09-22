# Styling Popover

Pick the level that fits: CSS variables for colors and sizes, the driver.js class names for anything the variables do not cover, slots and components when you need your own markup.

## With CSS variables

Pass a `popoverClass` (globally or per step) and redefine the variables under it. The classic driver.js yellow theme becomes a dozen lines:

<Demo
  id="popover-theme"
  title="Using CSS variables"
  button-text="Yellow theme"
  :config="{ prevBtnText: '&larr; Previous', nextBtnText: 'Next &rarr;', doneBtnText: 'Done', showButtons: ['next', 'previous'], popoverClass: 'driverjs-theme' }"
  :steps="[
    { element: '#popover-theme .demo-box', popover: { align: 'start', side: 'left', title: 'Style however you want', description: 'You can use the default class names and override the styles or you can pass a custom class name to the popoverClass option either globally or per step.' } },
    { element: '#popover-theme h4', popover: { align: 'start', side: 'bottom', title: 'Style however you want', description: 'You can use the default class names and override the styles or you can pass a custom class name to the popoverClass option either globally or per step.' } },
    { element: '#popover-theme .demo-button', popover: { align: 'start', side: 'left', title: 'Style however you want', description: 'You can use the default class names and override the styles or you can pass a custom class name to the popoverClass option either globally or per step.' } },
  ]"
>
  <DemoBox prefix="pt" />
</Demo>

```ts
const { drive } = useDriver({
  popoverClass: "driverjs-theme",
  steps: [/* ... */],
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

The arrow color follows `--driver-popover-arrow-color`, which defaults to the background, so the arrow needs no extra rules. The complete variable list is in [Theming](../guide/theming#css-variables).

## With class names

Every element carries the driver.js class names, so plain CSS works too. This is the same theme written the driver.js way:

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

The rendered side and alignment are reflected in `driver-popover-side-*` and `driver-popover-align-*` classes and in `data-side` / `data-align` attributes, after the popover flipped to fit the viewport.

## Dark theme

Because the defaults are variables, a dark theme is just another set of values:

<ThemeDemo />

```css
.driver-popover.docs-dark-theme {
  --driver-popover-bg: #18181b;
  --driver-popover-color: #f4f4f5;
  --driver-popover-radius: 12px;
  --driver-popover-padding: 20px;
  --driver-popover-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  --driver-popover-progress-color: #a1a1aa;
  --driver-popover-btn-bg: #4f46e5;
  --driver-popover-btn-hover-bg: #4338ca;
  --driver-popover-btn-color: #fff;
  --driver-popover-btn-border: 1px solid transparent;
  --driver-popover-btn-radius: 8px;
}
```

## The arrow

The arrow is a CSS triangle (`.driver-popover-arrow`) whose visible side is set by `driver-popover-arrow-side-top|right|bottom|left`; the offset along the edge is inline. Three levels:

```ts
// Off, globally or per step
useDriver({ showArrow: false });
{ element: "#x", popover: { title: "No arrow", showArrow: false } }
```

```css
/* Restyled: size and colour are variables, the rest is plain CSS */
.driver-popover {
  --driver-popover-arrow-size: 8px;
  --driver-popover-arrow-color: #111827;
}
.driver-popover-arrow-side-bottom {
  filter: drop-shadow(0 -1px 0 #e5e7eb);
}
```

```vue
<!-- Replaced: your own element, positioned by the slot props -->
<DriverTour>
  <template #arrow="{ arrowSide, arrowStyles }">
    <svg v-if="arrowSide !== 'over'" class="my-arrow" :data-side="arrowSide" :style="arrowStyles" viewBox="0 0 16 8">
      <path d="M0 8 L8 0 L16 8" />
    </svg>
  </template>
</DriverTour>
```

`arrowStyles` carries the `left` or `top` offset along the popover's edge; `arrowSide` says which edge (named like the popover side: `bottom` means the arrow sits on the popover's top edge and points up). Hints take the same `showArrow` in `HintsConfig` and per hint in `popover`.

## Modifying the DOM with a hook

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
  steps: [/* ... */],
});
```

`footerButtons` is `null` when a custom body does not render a footer, hence the `?.`.

## With your own markup

When CSS is not enough, replace parts of the popover with slots, or the whole body with a component. That is the subject of [Custom Components](./custom-components).
