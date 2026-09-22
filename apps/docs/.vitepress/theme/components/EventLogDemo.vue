<script setup lang="ts">
import { ref } from "vue";
import { useDriver, DriverTour } from "driver-vue";

const log = ref<string[]>([]);
const push = (line: string) => log.value.unshift(`${new Date().toLocaleTimeString()} ${line}`);

const { drive, driver } = useDriver({
  onNextClick: () => {
    push("Next button clicked");
    driver.moveNext();
  },
  onPrevClick: () => {
    push("Previous button clicked");
    driver.movePrevious();
  },
  onCloseClick: () => {
    push("Close button clicked");
    driver.destroy();
  },
  onDoneClick: () => {
    push("Done button clicked");
    driver.destroy();
  },
  steps: [
    {
      element: "#events-log",
      popover: { title: "Events logged", description: "Watch the log below as you click the buttons." },
    },
    {
      element: "#events-export",
      popover: { title: "Popover title", description: "Popover description", side: "right" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="events" />
    <pre id="events-log" class="demo-log">{{ log.length ? log.join("\n") : "No events yet." }}</pre>
    <button type="button" class="demo-run" @click="drive()">Show example</button>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
