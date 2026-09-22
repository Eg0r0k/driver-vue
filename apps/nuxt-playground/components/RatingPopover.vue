<script setup lang="ts">
import type { TourSlotProps } from "driver-vue";

/**
 * A popover body used through `popover.component` on a single step. It gets
 * the tour slot props plus whatever the step put in `popover.props`.
 */
const props = defineProps<TourSlotProps & { question?: string; onRate?: (stars: number) => void }>();

const stars = ref(0);
const hover = ref(0);

const send = () => {
  props.onRate?.(stars.value);
  props.next();
};
</script>

<template>
  <div class="rating">
    <strong class="rating-title">{{ props.popover.title }}</strong>
    <p class="rating-question">{{ props.question ?? "How was it?" }}</p>
    <div class="rating-stars" @mouseleave="hover = 0">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        class="rating-star"
        :class="{ 'rating-star-on': n <= (hover || stars) }"
        :aria-label="`${n} star${n > 1 ? 's' : ''}`"
        @mouseenter="hover = n"
        @click="stars = n"
      >
        ★
      </button>
    </div>
    <div class="rating-actions">
      <button type="button" class="rating-ghost" @click="props.close()">Skip</button>
      <button type="button" class="demo-button" :disabled="!stars" @click="send">Send</button>
    </div>
  </div>
</template>

<style scoped>
.rating {
  display: grid;
  gap: 0.4rem;
  min-width: 240px;
}

.rating-title {
  font-size: 16px;
}

.rating-question {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-star {
  border: 0;
  background: none;
  font-size: 26px;
  line-height: 1;
  color: #d1d5db;
  cursor: pointer;
  padding: 0 2px;
}

.rating-star-on {
  color: #f59e0b;
}

.rating-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.4rem;
}

.rating-ghost {
  border: 0;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
}

.demo-button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
