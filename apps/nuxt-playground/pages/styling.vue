<script setup lang="ts">
import type { DriveStep } from "driver-vue";
import CardPopover from "~/components/CardPopover.vue";
import CustomPopover from "~/components/CustomPopover.vue";
import RatingPopover from "~/components/RatingPopover.vue";

useHead({ title: "Vue: slots & components · driver-vue playground" });

/**
 * Every way the tour UI can be replaced with your own Vue markup: the
 * `popover` slot, the part slots, a per-step component, a global component,
 * CSS variables, the `overlay` and `stage` slots, and `stageClass`.
 */
const { log } = useExampleRunner();

const shortSteps: DriveStep[] = [
  {
    element: ".page-header",
    popover: {
      title: "Your popover",
      description: "The wrapper and the arrow are positioned by driver-vue; the body is yours.",
    },
  },
  {
    element: ".buttons",
    popover: { title: "Any component", description: "Design-system buttons, icons, i18n, whatever you already have." },
  },
  {
    element: ".feature-list",
    popover: {
      title: "Same engine",
      description: "Keyboard, hooks and scrolling behave exactly as before.",
      side: "top",
    },
  },
];

// a. The whole body through the popover slot.
const slotTour = useDriver({ steps: shortSteps });

// b. Single parts through the part slots.
const partsTour = useDriver({ showProgress: true, steps: shortSteps });

// c. A component on one step, a default popover on the next.
const stepTour = useDriver({
  steps: [
    {
      element: "#card-2",
      popover: {
        title: "Rate this feature",
        component: RatingPopover,
        props: { question: "How useful was the highlight?", onRate: (stars: number) => log("rated", stars, "stars") },
      },
    },
    { element: "#card-3", popover: { title: "A regular step", description: "This one renders the default popover." } },
  ],
});

// d. One component for every step of the tour.
const cardTour = useDriver({ steps: shortSteps, components: { popover: CardPopover } });

// e. CSS variables through popoverClass.
const darkTour = useDriver({ steps: shortSteps, popoverClass: "theme-dark" });
const yellowTour = useDriver({ steps: shortSteps, popoverClass: "driverjs-theme", showProgress: true });

// f. The overlay slot.
const overlayTour = useDriver({ steps: shortSteps, stagePadding: 8, stageRadius: 10 });

// g. The stage slot.
const stageTour = useDriver({ steps: shortSteps, stagePadding: 12 });

// h. stageClass / overlayClass.
const glowTour = useDriver({ steps: shortSteps, stageClass: "fx-glow", overlayClass: "sl-tinted" });

const cutoutStyle = (
  stage: { x: number; y: number; width: number; height: number },
  padding: number,
  radius: number
) => ({
  left: `${stage.x - padding}px`,
  top: `${stage.y - padding}px`,
  width: `${stage.width + padding * 2}px`,
  height: `${stage.height + padding * 2}px`,
  borderRadius: `${radius}px`,
});
</script>

<template>
  <div class="page">
    <section class="fx-controls">
      <h2>Vue: slots &amp; components</h2>
      <p class="fx-hint">
        The popover, the overlay and the highlight box are Vue components. Replace any of them with your own markup
        through slots on <code>&lt;DriverTour&gt;</code>, a component per step, or a component for the whole tour. Each
        section below runs its own driver.
      </p>
    </section>

    <section class="sl-section">
      <h3>a. The <code>popover</code> slot</h3>
      <p>The positioned wrapper and the arrow stay; everything inside is the slot.</p>
      <button type="button" class="demo-button" @click="slotTour.drive()">Run</button>
      <pre class="fx-code">
&lt;DriverTour :driver="driver"&gt;
  &lt;template #popover="{ popover, index, total, isLast, next, prev, close }"&gt;
    &lt;MyCard :title="popover.title" :progress="(index + 1) / total" ... /&gt;
  &lt;/template&gt;
&lt;/DriverTour&gt;</pre>
    </section>

    <section class="sl-section">
      <h3>b. Part slots</h3>
      <p>Keep the default popover and swap only the title, the progress, the buttons or the close control.</p>
      <button type="button" class="demo-button" @click="partsTour.drive()">Run</button>
      <pre v-pre class="fx-code">
&lt;template #title="{ popover }"&gt;🧭 {{ popover.title }}&lt;/template&gt;
&lt;template #progress="{ index, total }"&gt;dots...&lt;/template&gt;
&lt;template #next="{ next, isLast }"&gt;&lt;button @click="next"&gt;...&lt;/button&gt;&lt;/template&gt;</pre>
    </section>

    <section class="sl-section">
      <h3>c. A component on one step</h3>
      <p>
        <code>popover.component</code> renders a component as the body of that step only; it receives the slot props
        plus <code>popover.props</code>. The rating is written to the log.
      </p>
      <button type="button" class="demo-button" @click="stepTour.drive()">Run</button>
      <pre class="fx-code">
{ element: "#card-2", popover: { title: "Rate this feature", component: RatingPopover,
    props: { question: "How useful was the highlight?", onRate: stars =&gt; log(stars) } } }</pre>
    </section>

    <section class="sl-section">
      <h3>d. A component for the whole tour</h3>
      <p><code>components.popover</code> in the config is the default body for every step.</p>
      <button type="button" class="demo-button" @click="cardTour.drive()">Run</button>
      <pre class="fx-code">useDriver({ steps, components: { popover: CardPopover } })</pre>
    </section>

    <section class="sl-section">
      <h3>e. Theming with CSS variables</h3>
      <p>Every default visual is a custom property; a theme is a class that sets a few of them.</p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="darkTour.drive()">Dark theme</button>
        <button type="button" class="demo-button" @click="yellowTour.drive()">driver.js yellow</button>
      </div>
      <pre class="fx-code">
useDriver({ steps, popoverClass: "theme-dark" })

.driver-popover.theme-dark {
  --driver-popover-bg: #111827;
  --driver-popover-color: #f9fafb;
  --driver-popover-arrow-color: #111827;
  --driver-popover-radius: 12px;
}</pre>
    </section>

    <section class="sl-section">
      <h3>f. The <code>overlay</code> slot</h3>
      <p>
        A div with a gradient tint and a box-shadow cutout instead of the SVG path; the click still closes the tour.
      </p>
      <button type="button" class="demo-button" @click="overlayTour.drive()">Run</button>
      <pre class="fx-code">
&lt;template #overlay="{ stage, padding, radius, onClick }"&gt;
  &lt;div class="sl-catcher" @click="onClick" /&gt;
  &lt;div class="sl-cutout" :style="{ left: stage.x - padding + 'px', ... }" /&gt;
&lt;/template&gt;</pre>
    </section>

    <section class="sl-section">
      <h3>g. The <code>stage</code> slot</h3>
      <p>Decorations rendered inside the box that tracks the cutout: here a "Step N" chip above it.</p>
      <button type="button" class="demo-button" @click="stageTour.drive()">Run</button>
      <pre v-pre class="fx-code">
&lt;template #stage="{ index }"&gt;
  &lt;span class="sl-chip"&gt;Step {{ index + 1 }}&lt;/span&gt;
&lt;/template&gt;</pre>
    </section>

    <section class="sl-section">
      <h3>h. <code>stageClass</code> and <code>overlayClass</code></h3>
      <p>No slots at all: give the box and the overlay a class and style them in CSS.</p>
      <button type="button" class="demo-button" @click="glowTour.drive()">Run</button>
      <pre class="fx-code">useDriver({ steps, stageClass: "fx-glow", overlayClass: "sl-tinted" })</pre>
    </section>

    <Stage />

    <ClientOnly>
      <DriverTour :driver="slotTour.driver">
        <template #popover="props">
          <CustomPopover v-bind="props" />
        </template>
      </DriverTour>

      <DriverTour :driver="partsTour.driver">
        <template #title="{ popover }">
          <header class="sl-title">🧭 {{ popover.title }}</header>
        </template>
        <template #progress="{ index, total }">
          <span class="sl-dots" aria-hidden="true">
            <i v-for="n in total" :key="n" class="sl-dot" :class="{ 'sl-dot-on': n === index + 1 }" />
          </span>
        </template>
        <template #close="{ close }">
          <button type="button" class="sl-close" aria-label="Close" @click="close()">×</button>
        </template>
        <template #prev="{ prev, hasPrev }">
          <button type="button" class="sl-btn" :disabled="!hasPrev" @click="prev()">Back</button>
        </template>
        <template #next="{ next, isLast }">
          <button type="button" class="sl-btn sl-btn-primary" @click="next()">{{ isLast ? "Finish" : "Next" }}</button>
        </template>
      </DriverTour>

      <DriverTour :driver="stepTour.driver" />
      <DriverTour :driver="cardTour.driver" />
      <DriverTour :driver="darkTour.driver" />
      <DriverTour :driver="yellowTour.driver" />

      <DriverTour :driver="overlayTour.driver">
        <template #overlay="{ stage, padding, radius, onClick }">
          <div class="sl-catcher" @click="onClick" />
          <div class="sl-cutout" :style="cutoutStyle(stage, padding, radius)" />
        </template>
      </DriverTour>

      <DriverTour :driver="stageTour.driver">
        <template #stage="{ index }">
          <span class="sl-chip">Step {{ index + 1 }}</span>
        </template>
      </DriverTour>

      <DriverTour :driver="glowTour.driver" />
    </ClientOnly>
  </div>
</template>

<style scoped>
.sl-section {
  display: grid;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.sl-section h3 {
  margin: 0;
  font-size: 16px;
}

.sl-section p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
}

.sl-section .demo-button {
  justify-self: start;
}

/* Part slots */
.sl-title {
  font-size: 18px;
  font-weight: 700;
}

.sl-dots {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}

.sl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
}

.sl-dot-on {
  background: #4f46e5;
}

.sl-close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: 0;
  background: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
}

.sl-btn {
  padding: 0.3rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
}

.sl-btn + .sl-btn {
  margin-left: 4px;
}

.sl-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.sl-btn-primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

/* Overlay slot */
.sl-catcher {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: auto;
}

.sl-cutout {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  box-shadow: 0 0 0 200vmax rgba(30, 27, 75, 0.7);
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.12), transparent 60%);
}

/* Stage slot */
.sl-chip {
  position: absolute;
  left: 0;
  bottom: 100%;
  margin-bottom: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #4f46e5;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
