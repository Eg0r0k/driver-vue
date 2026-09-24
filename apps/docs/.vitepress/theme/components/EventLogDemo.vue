<script setup lang="ts">
import { ref } from "vue";
import { useDriver, DriverTour } from "driver-vue";

const log = ref<string[]>([]);
const push = (line: string) => log.value.unshift(`${new Date().toLocaleTimeString()} ${line}`);

/** Button hooks that log each click, then do what the default button would. */
const { drive, driver } = useDriver({
  onNextClick: () => {
    push("onNextClick");
    driver.moveNext();
  },
  onPrevClick: () => {
    push("onPrevClick");
    driver.movePrevious();
  },
  onCloseClick: () => {
    push("onCloseClick");
    driver.destroy();
  },
  onDoneClick: () => {
    push("onDoneClick");
    driver.destroy();
  },
  steps: [
    {
      element: "#events-log",
      popover: { title: "Event log", description: "Each button click is written to this log." },
    },
    {
      element: "#events-export",
      popover: { title: "Done button", description: "On the last step Next becomes Done.", side: "top" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="events">
      <pre id="events-log" class="demo-log">{{ log.length ? log.join("\n") : "No events yet." }}</pre>
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
