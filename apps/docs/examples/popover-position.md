# Popover Position

Control the popover position with `side` and `align`. `side` is the side of the element the popover is placed on (`top`, `right`, `bottom`, `left`; default `bottom`). `align` is how the popover is aligned along that side: `start` lines its leading edge up with the element, `center` centers it, `end` lines up the trailing edges (default `start`).

> The popover adjusts itself to fit the viewport: if `left` / `start` does not fit, it flips to the other side and shifts along the edge. The rendered side and alignment are exposed as `driver-popover-side-*` / `driver-popover-align-*` classes and `data-side` / `data-align` attributes. Scroll so the box is near an edge to see it in action.

```ts
const { highlight } = useDriver();

highlight({
  element: "#sample-box",
  popover: {
    title: "Left start example",
    description: "We have side set to <mark>left</mark> and align set to <mark>start</mark>.",
    side: "left",
    align: "start",
  },
});
```

<div id="sample-box" class="demo-box" style="align-items: center; padding: 48px">
  <p>Use the buttons below to show the popover.</p>
</div>

<div style="margin-top: 12px">
<Demo inline button-text="Left start" :highlight="{ element: '#sample-box', popover: { title: 'Left start example', description: 'We have side set to <mark>left</mark> and align set to <mark>start</mark>. PS, we can use HTML in the title and description.', side: 'left', align: 'start' } }" />
<Demo inline button-text="Left center" :highlight="{ element: '#sample-box', popover: { title: 'Left center example', description: 'We have side set to <mark>left</mark> and align set to <mark>center</mark>.', side: 'left', align: 'center' } }" />
<Demo inline button-text="Left end" :highlight="{ element: '#sample-box', popover: { title: 'Left end example', description: 'We have side set to <mark>left</mark> and align set to <mark>end</mark>.', side: 'left', align: 'end' } }" />
<Demo inline button-text="Top start" :highlight="{ element: '#sample-box', popover: { title: 'Top start example', description: 'We have side set to <mark>top</mark> and align set to <mark>start</mark>.', side: 'top', align: 'start' } }" />
<Demo inline button-text="Top center" :highlight="{ element: '#sample-box', popover: { title: 'Top center example', description: 'We have side set to <mark>top</mark> and align set to <mark>center</mark>.', side: 'top', align: 'center' } }" />
<Demo inline button-text="Top end" :highlight="{ element: '#sample-box', popover: { title: 'Top end example', description: 'We have side set to <mark>top</mark> and align set to <mark>end</mark>.', side: 'top', align: 'end' } }" />
<Demo inline button-text="Right start" :highlight="{ element: '#sample-box', popover: { title: 'Right start example', description: 'We have side set to <mark>right</mark> and align set to <mark>start</mark>.', side: 'right', align: 'start' } }" />
<Demo inline button-text="Right center" :highlight="{ element: '#sample-box', popover: { title: 'Right center example', description: 'We have side set to <mark>right</mark> and align set to <mark>center</mark>.', side: 'right', align: 'center' } }" />
<Demo inline button-text="Right end" :highlight="{ element: '#sample-box', popover: { title: 'Right end example', description: 'We have side set to <mark>right</mark> and align set to <mark>end</mark>.', side: 'right', align: 'end' } }" />
<Demo inline button-text="Bottom start" :highlight="{ element: '#sample-box', popover: { title: 'Bottom start example', description: 'We have side set to <mark>bottom</mark> and align set to <mark>start</mark>.', side: 'bottom', align: 'start' } }" />
<Demo inline button-text="Bottom center" :highlight="{ element: '#sample-box', popover: { title: 'Bottom center example', description: 'We have side set to <mark>bottom</mark> and align set to <mark>center</mark>.', side: 'bottom', align: 'center' } }" />
<Demo inline button-text="Bottom end" :highlight="{ element: '#sample-box', popover: { title: 'Bottom end example', description: 'We have side set to <mark>bottom</mark> and align set to <mark>end</mark>.', side: 'bottom', align: 'end' } }" />
</div>

## Offsets

`popoverOffset` is the gap between the cutout and the popover (default `10`); `stagePadding` grows the cutout itself. Positioning is done by Floating UI; the composable behind it, `useDriverPosition`, is exported for [headless](../styling/headless) use.
