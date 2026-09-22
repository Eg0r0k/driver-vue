<script setup lang="ts">
import { DriverBoxOverlay, easeInOutQuad, type Config } from "driver-vue";
import { basicTourSteps } from "~/examples/shared";

useHead({ title: "Highlight box animation · driver-vue playground" });

/**
 * Everything that shapes how the highlight box moves and looks, combined
 * from the library's hooks: `easing` + `duration` (the engine's frame-by-frame
 * animation), `stageClass` (effects on the box), `DriverBoxOverlay` with
 * `animate: false` (CSS-driven movement), the `overlay`/`stage` slots, and
 * the popover transition classes.
 */

const easings: Record<string, { label: string; fn: (t: number) => number }> = {
  easeInOutQuad: { label: "ease-in-out quad (driver.js default)", fn: easeInOutQuad },
  linear: { label: "linear", fn: t => t },
  easeOutCubic: { label: "ease-out cubic", fn: t => 1 - Math.pow(1 - t, 3) },
  easeOutBack: {
    label: "ease-out back (overshoot)",
    fn: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  },
  easeOutElastic: {
    label: "ease-out elastic",
    fn: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  },
  easeOutBounce: {
    label: "ease-out bounce",
    fn: t => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  },
};

const effects = [
  { value: "", label: "none (driver.js look)" },
  { value: "fx-outline", label: "white outline" },
  { value: "fx-glow", label: "pulsing glow" },
  { value: "fx-corners", label: "corner brackets" },
  { value: "fx-ripple", label: "ripple on arrival" },
  { value: "fx-rainbow", label: "rotating rainbow border" },
  { value: "fx-ants", label: "marching ants (stage slot)" },
];

const movements = [
  { value: "engine", label: "engine (JS frames, easing above)" },
  { value: "css-spring", label: "CSS transition: spring" },
  { value: "css-smooth", label: "CSS transition: smooth" },
  { value: "css-steps", label: "CSS transition: steps" },
];

const overlays = [
  { value: "svg", label: "SVG path (default)" },
  { value: "box", label: "box overlay (box-shadow)" },
  { value: "blur", label: "blurred backdrop (overlay slot)" },
];

const popoverEffects = [
  { value: "", label: "fade (default)" },
  { value: "fx-pop-scale", label: "scale in" },
  { value: "fx-pop-slide", label: "slide up" },
  { value: "fx-pop-flip", label: "flip in" },
];

const easing = ref("easeInOutQuad");
const duration = ref(600);
const padding = ref(10);
const radius = ref(8);
const effect = ref("fx-glow");
const movement = ref("engine");
const overlay = ref("svg");
const popoverEffect = ref("fx-pop-scale");
const overlayColor = ref("#0f172a");
const overlayOpacity = ref(0.65);

const cssMovement = computed(() => movement.value !== "engine");
const movementClass = computed(() =>
  movement.value === "css-spring"
    ? "fx-spring"
    : movement.value === "css-smooth"
      ? "fx-smooth"
      : movement.value === "css-steps"
        ? "fx-steps"
        : ""
);

const config = computed<Config>(() => ({
  steps: basicTourSteps,
  showProgress: true,
  duration: duration.value,
  easing: easings[easing.value]?.fn,
  stagePadding: padding.value,
  stageRadius: radius.value,
  overlayColor: overlayColor.value,
  overlayOpacity: overlayOpacity.value,
  // CSS-driven movement: the engine stops interpolating, the box overlay's
  // cutout and the stage box transition on their own.
  animate: !cssMovement.value,
  stageClass: [effect.value, movementClass.value].filter(Boolean).join(" "),
  overlayClass: movementClass.value,
  popoverClass: popoverEffect.value,
  components: {
    overlay: overlay.value === "box" || cssMovement.value ? DriverBoxOverlay : undefined,
  },
}));

const { drive, driver } = useDriver(config);

// The blurred overlay: an even-odd polygon clip-path leaves the cutout sharp
// and interactive (clip-path also clips hit-testing).
const blurClip = (stage: { x: number; y: number; width: number; height: number }, pad: number) => {
  const x1 = stage.x - pad;
  const y1 = stage.y - pad;
  const x2 = stage.x + stage.width + pad;
  const y2 = stage.y + stage.height + pad;
  return {
    clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px, ${x2}px ${y1}px, ${x1}px ${y1}px)`,
  };
};

const snippet = computed(() => {
  const lines = [
    `useDriver({`,
    `  duration: ${duration.value},`,
    cssMovement.value ? `  animate: false, // CSS moves the box` : `  easing: ${easing.value},`,
    `  stagePadding: ${padding.value}, stageRadius: ${radius.value},`,
    effect.value || movementClass.value
      ? `  stageClass: "${[effect.value, movementClass.value].filter(Boolean).join(" ")}",`
      : undefined,
    movementClass.value ? `  overlayClass: "${movementClass.value}",` : undefined,
    popoverEffect.value ? `  popoverClass: "${popoverEffect.value}",` : undefined,
    overlay.value === "box" || cssMovement.value ? `  components: { overlay: DriverBoxOverlay },` : undefined,
    `});`,
    overlay.value === "blur" ? `// + <template #overlay="{ stage, padding, onClick }"> ... </template>` : undefined,
    effect.value === "fx-ants"
      ? `// + <template #stage> <svg class="fx-ants-svg"><rect .../></svg> </template>`
      : undefined,
  ];
  return lines.filter(Boolean).join("\n");
});
</script>

<template>
  <div class="page">
    <section class="fx-controls">
      <h2>Highlight box animation</h2>
      <p class="fx-hint">
        The box that spotlights an element is a real element (<code>.driver-stage</code>) plus the overlay's cutout.
        Shape its movement with <code>easing</code>/<code>duration</code> or hand it to CSS, decorate it with
        <code>stageClass</code> or the <code>stage</code> slot, swap the overlay, and animate the popover with the
        transition classes. Every control below changes the tour live.
      </p>

      <div class="fx-grid">
        <label class="fx-field">
          Movement
          <select v-model="movement">
            <option v-for="item in movements" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>

        <label class="fx-field">
          Easing (engine movement)
          <select v-model="easing" :disabled="cssMovement">
            <option v-for="(item, key) in easings" :key="key" :value="key">{{ item.label }}</option>
          </select>
        </label>

        <label class="fx-field">
          Duration: {{ duration }} ms
          <input v-model.number="duration" type="range" min="100" max="2000" step="50" />
        </label>

        <label class="fx-field">
          Box effect
          <select v-model="effect">
            <option v-for="item in effects" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>

        <label class="fx-field">
          Overlay
          <select v-model="overlay">
            <option v-for="item in overlays" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>

        <label class="fx-field">
          Popover enter
          <select v-model="popoverEffect">
            <option v-for="item in popoverEffects" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>

        <label class="fx-field">
          Stage padding: {{ padding }} px
          <input v-model.number="padding" type="range" min="0" max="40" />
        </label>

        <label class="fx-field">
          Stage radius: {{ radius }} px
          <input v-model.number="radius" type="range" min="0" max="40" />
        </label>

        <label class="fx-field">
          Overlay opacity: {{ overlayOpacity }}
          <input v-model.number="overlayOpacity" type="range" min="0" max="1" step="0.05" />
        </label>

        <label class="fx-field">
          Overlay color
          <input v-model="overlayColor" type="color" />
        </label>
      </div>

      <div class="fx-row">
        <button type="button" class="demo-button" @click="drive()">Run the tour</button>
        <button
          type="button"
          class="demo-button"
          @click="
            driver.highlight({
              element: '#card-3',
              popover: { title: 'Highlight', description: 'One element, same effects.' },
            })
          "
        >
          Highlight a card
        </button>
      </div>

      <pre class="fx-code">{{ snippet }}</pre>
    </section>

    <Stage />

    <ClientOnly>
      <DriverTour :driver="driver">
        <template v-if="effect === 'fx-ants'" #stage="{ radius: r }">
          <svg class="fx-ants-svg">
            <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" :rx="r" />
          </svg>
        </template>

        <template v-if="overlay === 'blur'" #overlay="{ stage, padding: pad, onClick }">
          <div class="fx-blur-overlay" :class="movementClass" :style="blurClip(stage, pad)" @click="onClick" />
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>
