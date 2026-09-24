<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/** Contextual help: focusing a field highlights it with a popover. */
const { highlight, destroy, driver } = useDriver({
  stagePadding: 0,
  onDestroyed: () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
  },
});

const fields = [
  { id: "name", placeholder: "Name", title: "Name", description: "Your full name, as it appears on invoices." },
  { id: "email", placeholder: "Email", title: "Email", description: "Used for sign-in and receipts." },
  {
    id: "company",
    placeholder: "Company",
    title: "Company",
    description: "Optional. Leave empty for a personal account.",
  },
];

const onFocus = (event: FocusEvent, title: string, description: string) => {
  highlight({ element: event.target as Element, popover: { title, description } });
};
</script>

<template>
  <form class="demo demo-box" @submit.prevent @focusout="destroy()">
    <input
      v-for="field in fields"
      :id="`form-${field.id}`"
      :key="field.id"
      class="demo-input"
      type="text"
      :placeholder="field.placeholder"
      @focus="onFocus($event, field.title, field.description)"
    />
    <div class="demo-row">
      <button type="submit" class="demo-button">Submit</button>
    </div>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </form>
</template>
