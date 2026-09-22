<script setup lang="ts">
import type { TourSlotProps } from "driver-vue";

// A popover body built from the tour slot props: the wrapper and the arrow
// are still positioned by driver-vue, everything inside is ours.
const props = defineProps<TourSlotProps>();
</script>

<template>
  <div class="custom-popover">
    <p class="custom-popover-step">Step {{ props.index + 1 }} / {{ props.total }}</p>
    <h3 class="custom-popover-title">{{ props.popover.title }}</h3>
    <p class="custom-popover-description">{{ props.popover.description }}</p>
    <div class="custom-popover-actions">
      <button type="button" class="ghost" @click="props.close()">Skip</button>
      <button type="button" :disabled="!props.hasPrev" @click="props.prev()">Back</button>
      <button type="button" class="primary" @click="props.next()">
        {{ props.isLast ? "Finish" : "Next" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-popover {
  display: grid;
  gap: 0.5rem;
  min-width: 240px;
}

.custom-popover-step {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.custom-popover-title {
  margin: 0;
  font-size: 18px;
}

.custom-popover-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.custom-popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

button {
  padding: 0.35rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

button.primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

button.ghost {
  border-color: transparent;
  margin-right: auto;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
