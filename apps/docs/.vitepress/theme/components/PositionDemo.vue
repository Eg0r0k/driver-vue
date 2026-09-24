<script setup lang="ts">
import { ref } from "vue";
import { injectDriver, type Alignment, type Side } from "driver-vue";

/** Highlights a small target with the chosen `side` and `align`, on the shared driver. */
const sides: Side[] = ["top", "right", "bottom", "left"];
const aligns: Alignment[] = ["start", "center", "end"];

const side = ref<Side>("left");
const align = ref<Alignment>("start");

const shared = injectDriver({ optional: true });

const run = () => {
  const driver = shared?.value;
  if (!driver) {
    return;
  }

  driver.destroy();
  driver.setConfig({});
  driver.highlight({
    element: "#position-target",
    popover: {
      title: `${side.value} / ${align.value}`,
      description: `side: "${side.value}", align: "${align.value}"`,
      side: side.value,
      align: align.value,
    },
  });
};
</script>

<template>
  <div class="demo">
    <div class="demo-box">
      <div class="position-stage">
        <span id="position-target" class="demo-card position-target">Target</span>
      </div>
      <div class="demo-box-footer">
        <label class="position-field">
          side
          <select v-model="side" class="demo-input position-select">
            <option v-for="value in sides" :key="value" :value="value">{{ value }}</option>
          </select>
        </label>
        <label class="position-field">
          align
          <select v-model="align" class="demo-input position-select">
            <option v-for="value in aligns" :key="value" :value="value">{{ value }}</option>
          </select>
        </label>
        <button type="button" class="demo-run" @click="run">Run</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.position-stage {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.position-target {
  padding: 8px 20px;
  font-size: 14px;
}

.position-field {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.position-select {
  width: auto;
  padding: 4px 8px;
}
</style>
