<script setup lang="ts">
import type { TourSlotProps } from "driver-vue";

/** A compact card used as the popover body for a whole tour via `components.popover`. */
const props = defineProps<TourSlotProps>();
</script>

<template>
  <div class="card">
    <div class="card-head">
      <span class="card-badge">{{ props.index + 1 }}</span>
      <strong>{{ props.popover.title }}</strong>
      <button type="button" class="card-close" aria-label="Close" @click="props.close()">×</button>
    </div>
    <p v-if="props.popover.description" class="card-text">{{ props.popover.description }}</p>
    <div class="card-actions">
      <button type="button" class="card-btn" :disabled="!props.hasPrev" @click="props.prev()">←</button>
      <span class="card-count">{{ props.index + 1 }} / {{ props.total }}</span>
      <button type="button" class="card-btn card-btn-primary" @click="props.next()">
        {{ props.isLast ? "Done" : "→" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: grid;
  gap: 0.5rem;
  min-width: 230px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-badge {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #4f46e5;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.card-close {
  margin-left: auto;
  border: 0;
  background: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
}

.card-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-count {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

.card-btn {
  min-width: 34px;
  padding: 0.3rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.card-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.card-btn-primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}
</style>
