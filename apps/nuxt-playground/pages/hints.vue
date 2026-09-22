<script setup lang="ts">
import type { DriverHint } from "driver-vue/hints";

useHead({ title: "Hints · driver-vue playground" });

/**
 * The hints module: beacons pinned to elements that open a popover on click.
 * Every section owns a hints instance and its <DriverHints>.
 */
const { log, showNotice: notice } = useExampleRunner();
const shared = injectDriver();

const STORAGE_KEY = "driver-vue-playground-dismissed-hints";

// 1. Basic hints.
const basic = useHints({
  hints: [
    {
      element: ".page-header h1",
      id: "title",
      popover: {
        title: "Hints",
        description:
          "A hint is a self-contained callout: one beacon, one popover, one dismiss button. No steps, no next and previous.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#card-3",
      id: "cards",
      popover: {
        title: "Open in Any Order",
        description:
          "Every beacon is live at once. Opening this one closed the other, since only one hint is ever open.",
        side: "top",
        align: "center",
      },
    },
    {
      element: ".feature-list",
      id: "features",
      popover: {
        title: "Click, Escape or Click Away",
        description:
          "Clicking the beacon again, pressing Escape or clicking outside closes the popover but keeps the beacon. Only Got it dismisses the hint.",
        side: "right",
        align: "start",
      },
    },
  ],
});

// 2. Beacon placement.
const placement = useHints({
  hints: [
    {
      element: "#card-1",
      id: "top-start",
      beacon: { side: "top", align: "start" },
      popover: { title: "top / start", description: "The beacon sits on the top edge, at its start.", side: "top" },
    },
    {
      element: "#card-2",
      id: "top-end",
      popover: {
        title: "top / end (default)",
        description: "With no beacon config a hint lands on the top-right corner.",
        side: "top",
      },
    },
    {
      element: "#card-4",
      id: "bottom-center",
      beacon: { side: "bottom", align: "center" },
      popover: { title: "bottom / center", description: "Centered along the bottom edge.", side: "bottom" },
    },
    {
      element: "#card-6",
      id: "right-center",
      beacon: { side: "right", align: "center" },
      popover: { title: "right / center", description: "Centered on the right edge.", side: "right" },
    },
    {
      element: "#large-paragraph-text",
      id: "static",
      beacon: { side: "left", align: "center", animate: false },
      popover: {
        title: "No Pulse",
        description:
          "animate: false drops the pulse and leaves a static dot. The pulse also stops on its own when the reader prefers reduced motion.",
        side: "right",
        align: "start",
      },
    },
  ],
});

// 3. Overlay mode.
const overlay = useHints({
  overlay: true,
  overlayOpacity: 0.5,
  hints: [
    {
      element: "#form-name",
      id: "name",
      popover: {
        title: "Spotlight",
        description: "With overlay: true the page dims and the element is cut out like a tour step.",
      },
    },
    {
      element: "#form-submit",
      id: "submit",
      beacon: { side: "right", align: "center" },
      popover: {
        title: "Still interactive",
        description: "The element inside the cutout keeps working; clicking the dim closes the hint.",
      },
    },
  ],
});

// 4. Button text, hidden button, onButtonClick.
const buttons = useHints({
  buttonText: "Thanks, understood",
  hints: [
    {
      element: "#card-1",
      id: "instance-text",
      popover: { title: "Instance text", description: "The dismiss button reads the instance-level buttonText." },
    },
    {
      element: "#card-2",
      id: "hint-text",
      popover: { title: "Hint text", description: "This hint overrides it.", buttonText: "Got it, thanks" },
    },
    {
      element: "#card-3",
      id: "no-button",
      popover: {
        title: "No button",
        description:
          "showButton: false leaves a popover that only closes on Escape, outside click or programmatically.",
        showButton: false,
      },
    },
    {
      element: "#card-4",
      id: "hook",
      popover: {
        title: "onButtonClick",
        description: "The button runs a hook instead of dismissing. Check the log; the hint stays.",
        buttonText: "Log it",
        onButtonClick: (element, hint) => log("onButtonClick", hint.id, element),
      },
    },
  ],
});

// 5. Dismiss / restore / setHints.
const setA: DriverHint[] = [
  {
    element: ".page-header",
    id: "a-header",
    popover: { title: "Set A", description: "Dismiss me with Got it, then bring me back below." },
  },
  {
    element: ".buttons",
    id: "a-buttons",
    popover: { title: "Set A too", description: "restoreAll brings every dismissed hint back." },
  },
];
const setB: DriverHint[] = [
  {
    element: "#scrollable-area",
    id: "b-scroll",
    popover: { title: "Set B", description: "setHints swapped the whole list and cleared the dismissals." },
  },
  {
    element: "#demo-svg",
    id: "b-svg",
    beacon: { side: "top", align: "center" },
    popover: { title: "SVG too", description: "Any element, SVG included." },
  },
];
const managed = useHints({ hints: setA, onDismiss: (_element, hint) => log("dismissed", hint.id) });
const currentSet = ref<"A" | "B">("A");
const swapSet = () => {
  currentSet.value = currentSet.value === "A" ? "B" : "A";
  managed.setHints(currentSet.value === "A" ? setA : setB);
};

// 6. Persisted dismissals through localStorage.
const readDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};
const persistedAll: DriverHint[] = [
  {
    element: ".page-header",
    id: "persist-header",
    popover: {
      title: "Dismiss Me",
      description: "Hit Got it, then reload the page. This hint will not come back.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: ".buttons",
    id: "persist-buttons",
    popover: {
      title: "And Me",
      description: "Each dismissal is stored by its id, so the rest of the hints are unaffected.",
      side: "top",
      align: "start",
    },
  },
];
const persistedCount = ref(0);
const persisted = useHints({
  hints: [],
  onDismiss: (_element, hint) => {
    const dismissed = new Set(readDismissed());
    dismissed.add(hint.id!);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed]));
    persistedCount.value = dismissed.size;
  },
});
const showPersisted = () => {
  // Filtering up front is all it takes; the library keeps no storage of its
  // own, which leaves the policy (and the key) entirely yours.
  const dismissed = new Set(readDismissed());
  persistedCount.value = dismissed.size;
  persisted.setHints(persistedAll.filter(hint => !dismissed.has(hint.id!)));
  persisted.show();
};
const forgetPersisted = () => {
  localStorage.removeItem(STORAGE_KEY);
  persistedCount.value = 0;
  persisted.hide();
  notice("Stored dismissals cleared");
};

// 7. Custom beacon and popover through slots.
const slotted = useHints({
  hints: [
    {
      element: "#form-email",
      id: "email",
      beacon: { side: "right", align: "center" },
      popover: {
        title: "Custom card",
        description: "The popover body is the #popover slot; the beacon is the #beacon slot.",
      },
    },
    {
      element: "#form-agree",
      id: "agree",
      beacon: { side: "right", align: "center" },
      popover: { title: "Same slot", description: "Every hint of this instance shares the slot markup." },
    },
  ],
});

// 8. Beacon variants through className and CSS variables.
const variants = useHints({
  hints: [
    {
      element: "#card-5",
      id: "rose",
      beacon: { className: "hint-rose" },
      popover: { title: "Rose", description: "--driver-hint-color on a beacon class." },
    },
    {
      element: "#card-6",
      id: "large",
      beacon: { className: "hint-large", side: "bottom", align: "center" },
      popover: { title: "Large", description: "--driver-hint-size makes it bigger.", side: "bottom" },
    },
  ],
});

// 9. Hints and tours coexist.
const withTour = useHints({
  hints: [
    {
      element: "#card-2",
      id: "launcher",
      popover: {
        title: "Start the Tour",
        description: "Hint popovers are ordinary driver popovers, so onPopoverRender can add a button.",
        side: "top",
        align: "center",
        onPopoverRender: (popover, { hints: instance }) => {
          const button = document.createElement("button");
          button.type = "button";
          button.classList.add("driver-popover-footer-btn");
          button.innerText = "Take the tour";
          button.addEventListener("click", () => {
            instance.close();
            startTour();
          });
          popover.footerButtons?.prepend(button);
        },
      },
    },
    {
      element: "#scrollable-area",
      id: "scrolls",
      popover: {
        title: "Scrolling Is Handled",
        description:
          "Scroll this box: the beacon tracks its element, and hides itself once the element leaves the container.",
        side: "top",
        align: "start",
      },
    },
  ],
});
const startTour = () => {
  const driver = shared.value;
  driver.destroy();
  driver.setConfig({
    showProgress: true,
    steps: [
      {
        element: ".page-header",
        popover: {
          title: "The Tour Has the Screen",
          description: "While a tour is running the beacons are hidden, so the two never compete for attention.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: ".feature-list",
        popover: {
          title: "Still No Coupling",
          description:
            "Nothing was registered between the two. The tour marks the page while it runs and the hints take the cue from that.",
          side: "top",
          align: "start",
        },
      },
      {
        popover: {
          title: "Back to the Hints",
          description: "Close this and the beacons reappear exactly as they were, including any you dismissed.",
        },
      },
    ],
  });
  driver.drive();
};

const all = [basic, placement, overlay, buttons, managed, persisted, slotted, variants, withTour];
const hideAll = () => all.forEach(instance => instance.hide());
const only = (instance: (typeof all)[number]) => {
  hideAll();
  instance.show();
};
</script>

<template>
  <div class="page">
    <section class="fx-controls">
      <h2>Hints</h2>
      <p class="fx-hint">
        Beacons sit on the page until the reader clicks one. Each section below owns a <code>useHints()</code> instance
        rendered by its own <code>&lt;DriverHints&gt;</code>; showing one hides the others.
      </p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="hideAll">Hide all</button>
      </div>
    </section>

    <section class="hn-section">
      <h3>Basic hints</h3>
      <p>Three beacons on the stage, no overlay, page stays interactive. Open them in any order.</p>
      <button type="button" class="demo-button" @click="only(basic)">Show</button>
      <pre class="fx-code">
const { hints, show } = useHints({ hints: [{ element: "#card-3", popover: { title: "..." } }] })
&lt;DriverHints :hints="hints" /&gt;</pre>
    </section>

    <section class="hn-section">
      <h3>Beacon placement</h3>
      <p>Side plus alignment give the twelve anchor points; <code>animate: false</code> stops the pulse.</p>
      <button type="button" class="demo-button" @click="only(placement)">Show</button>
    </section>

    <section class="hn-section">
      <h3>Overlay mode</h3>
      <p>With <code>overlay: true</code> the page dims while a hint is open and the popover anchors to the element.</p>
      <button type="button" class="demo-button" @click="only(overlay)">Show</button>
    </section>

    <section class="hn-section">
      <h3>Button text, hidden button, onButtonClick</h3>
      <p>
        Instance and hint level <code>buttonText</code>, <code>showButton: false</code>, and a hook that runs instead of
        dismissing.
      </p>
      <button type="button" class="demo-button" @click="only(buttons)">Show</button>
    </section>

    <section class="hn-section">
      <h3>Dismiss, restore, setHints</h3>
      <p>Dismiss a hint with Got it, then bring it back; swap the whole list with <code>setHints</code>.</p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="only(managed)">Show (set {{ currentSet }})</button>
        <button
          type="button"
          class="demo-button"
          @click="managed.restore(currentSet === 'A' ? 'a-header' : 'b-scroll')"
        >
          Restore first
        </button>
        <button type="button" class="demo-button" @click="managed.restoreAll()">Restore all</button>
        <button type="button" class="demo-button" @click="swapSet">
          Swap to set {{ currentSet === "A" ? "B" : "A" }}
        </button>
      </div>
    </section>

    <section class="hn-section">
      <h3>Persisted dismissals</h3>
      <p>
        Dismissals last for the session; <code>onDismiss</code> plus a stable <code>id</code> makes them stick, here in
        localStorage. Dismiss, reload, and the hint stays gone.
        <span v-if="persistedCount"> Stored dismissals: {{ persistedCount }}.</span>
      </p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="(hideAll(), showPersisted())">Show</button>
        <button type="button" class="demo-button" @click="forgetPersisted">Forget dismissals</button>
      </div>
    </section>

    <section class="hn-section">
      <h3>Custom beacon and popover (slots)</h3>
      <p>
        The <code>#beacon</code> slot fills the beacon button; the <code>#popover</code> slot replaces the popover body.
      </p>
      <button type="button" class="demo-button" @click="only(slotted)">Show</button>
      <pre class="fx-code">
&lt;DriverHints :hints="hints"&gt;
  &lt;template #beacon&gt;&lt;span class="hn-badge"&gt;?&lt;/span&gt;&lt;/template&gt;
  &lt;template #popover="{ popover, dismiss, close }"&gt;...&lt;/template&gt;
&lt;/DriverHints&gt;</pre>
    </section>

    <section class="hn-section">
      <h3>Beacon variants (CSS variables)</h3>
      <p><code>beacon.className</code> plus <code>--driver-hint-color</code> / <code>--driver-hint-size</code>.</p>
      <button type="button" class="demo-button" @click="only(variants)">Show</button>
    </section>

    <section class="hn-section">
      <h3>Hints and tours</h3>
      <p>
        Open the hint on Card Two and take the tour from it, or start the tour with the button: the beacons step aside
        while the tour runs and come back on their own.
      </p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="only(withTour)">Show</button>
        <button type="button" class="demo-button" @click="startTour">Start the tour now</button>
      </div>
    </section>

    <Stage />

    <ClientOnly>
      <DriverHints :hints="basic.hints" />
      <DriverHints :hints="placement.hints" />
      <DriverHints :hints="overlay.hints" />
      <DriverHints :hints="buttons.hints" />
      <DriverHints :hints="managed.hints" />
      <DriverHints :hints="persisted.hints" />
      <DriverHints :hints="variants.hints" />
      <DriverHints :hints="withTour.hints" />

      <DriverHints :hints="slotted.hints">
        <template #beacon>
          <span class="hn-badge">?</span>
        </template>
        <template #popover="{ popover, dismiss, close }">
          <div class="hn-card">
            <strong>{{ popover.title }}</strong>
            <p>{{ popover.description }}</p>
            <div class="fx-row">
              <button type="button" class="hn-ghost" @click="close()">Later</button>
              <button type="button" class="demo-button" @click="dismiss()">Got it</button>
            </div>
          </div>
        </template>
      </DriverHints>
    </ClientOnly>
  </div>
</template>

<style scoped>
.hn-section {
  display: grid;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.hn-section h3 {
  margin: 0;
  font-size: 16px;
}

.hn-section p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
}

.hn-section .demo-button {
  justify-self: start;
}

.hn-badge {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f59e0b;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.5);
}

.hn-card {
  display: grid;
  gap: 0.4rem;
  min-width: 220px;
}

.hn-card p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
}

.hn-card .fx-row {
  justify-content: flex-end;
}

.hn-ghost {
  border: 0;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
}
</style>
