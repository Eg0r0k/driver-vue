<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/** Contextual help: focusing a field highlights it with a popover. */
const { highlight, destroy, driver } = useDriver({
  popoverClass: "driverjs-theme",
  stagePadding: 0,
  onDestroyed: () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
  },
});

const fields = [
  { id: "name", placeholder: "Enter your name", title: "Name", description: "Enter your name here" },
  { id: "education", placeholder: "Your education", title: "Education", description: "Enter your education here" },
  { id: "age", placeholder: "Your age", title: "Age", description: "Enter your age here" },
];

const onFocus = (event: FocusEvent, title: string, description: string) => {
  highlight({ element: event.target as Element, popover: { title, description } });
};
</script>

<template>
  <form class="demo-box" @submit.prevent @focusout="destroy()">
    <input
      v-for="field in fields"
      :id="`form-${field.id}`"
      :key="field.id"
      class="demo-input"
      type="text"
      :placeholder="field.placeholder"
      @focus="onFocus($event, field.title, field.description)"
    />
    <button type="submit" class="demo-button">Submit</button>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </form>
</template>
