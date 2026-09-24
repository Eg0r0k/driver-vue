<script setup lang="ts">
import { ref } from "vue";
import { useDriver, DriverTour } from "driver-vue";

const modalOpen = ref(false);

const openModal = () => {
  window.setTimeout(() => (modalOpen.value = true), 800);
};

const { drive, driver } = useDriver({
  showProgress: true,
  onDestroyed: () => (modalOpen.value = false),
  steps: [
    {
      element: "#wait-open",
      advanceOnClick: true,
      popover: {
        title: "Open the modal",
        description: "Click this button. The modal renders about a second later and the tour waits for it.",
        showButtons: ["close"],
      },
    },
    {
      element: "#wait-confirm",
      waitForElement: 5000,
      popover: { title: "Confirm", description: "This step is shown once the modal has rendered." },
      onDeselected: () => (modalOpen.value = false),
    },
  ],
});
</script>

<template>
  <div class="demo">
    <div class="demo-box">
      <div class="demo-row">
        <button id="wait-open" type="button" class="demo-button" @click="openModal">Open modal</button>
      </div>
      <div v-if="modalOpen" class="demo-card">
        <p>Delete this report?</p>
        <div class="demo-row" style="margin-top: 8px">
          <button id="wait-confirm" type="button" class="demo-button" @click="modalOpen = false">Confirm</button>
          <button type="button" class="demo-button" @click="modalOpen = false">Cancel</button>
        </div>
      </div>
      <div class="demo-box-footer">
        <button type="button" class="demo-run" @click="drive()">Run the waiting tour</button>
      </div>
    </div>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
