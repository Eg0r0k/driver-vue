<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vitepress";
import { injectDriver, type Config } from "driver-vue";
import { PAGE_ONE, PAGE_TWO, STORAGE_KEY, steps, tourState } from "./multiPageTour";

/**
 * A live multi-page tour across two docs pages. It uses the app-wide driver
 * installed by DriverPlugin (the Layout renders its <DriverTour />), keeps the
 * position in shared state plus localStorage, and navigates with VitePress's
 * own router. See examples/multi-page-tour.md for the prose version.
 */
const props = defineProps<{ page: "one" | "two" }>();

const driver = injectDriver();
const router = useRouter();
const route = useRoute();

let navigating = false;

const normalize = (path: string) => path.replace(/(index)?\.html$/, "").replace(/\/$/, "");
const currentPage = computed(() => normalize(route.path));
const currentStep = computed(() => steps[tourState.value.index]);

const save = () => {
  try {
    if (tourState.value.active) {
      localStorage.setItem(STORAGE_KEY, String(tourState.value.index));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    return;
  }
};

const finish = () => {
  tourState.value = { active: false, index: 0 };
  save();
  driver.value.destroy();
};

const goTo = (index: number) => {
  const step = steps[index];
  if (!step) {
    finish();
    return;
  }

  const from = tourState.value.index;
  tourState.value = { active: true, index };
  save();

  if (normalize(step.page) === currentPage.value) {
    if (index > from) {
      driver.value.moveNext();
    } else {
      driver.value.movePrevious();
    }
    return;
  }

  navigating = true;
  driver.value.destroy();
  router.go(step.page);
};

const config = computed<Config>(() => ({
  showProgress: true,
  progressText: "{{current}} of {{total}}",
  steps: steps.map((step, index) => ({
    element: step.element,
    popover: {
      ...step.popover,
      onNextClick: () => goTo(index + 1),
      onPrevClick: () => goTo(index - 1),
    },
  })),
  onDestroyed: () => {
    if (navigating) {
      return;
    }
    tourState.value = { active: false, index: 0 };
    save();
  },
}));

const resume = async () => {
  const step = currentStep.value;
  if (!tourState.value.active || !step || normalize(step.page) !== currentPage.value) {
    return;
  }

  await nextTick();
  driver.value.setConfig(config.value);
  driver.value.drive(tourState.value.index);
};

const start = () => {
  tourState.value = { active: true, index: 0 };
  save();

  if (normalize(steps[0].page) === currentPage.value) {
    void resume();
    return;
  }

  navigating = true;
  router.go(steps[0].page);
};

onMounted(() => {
  navigating = false;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!tourState.value.active && saved !== null) {
    tourState.value = { active: true, index: Number(saved) };
  }

  const step = currentStep.value;
  if (tourState.value.active && step && normalize(step.page) !== currentPage.value) {
    finish();
    return;
  }

  void resume();
});

onUnmounted(() => {
  if (!navigating) {
    finish();
  }
});
</script>

<template>
  <div class="demo">
    <DemoBox :prefix="props.page === 'one' ? 'mp' : 'mp2'">
      <template #footer>
        <button type="button" class="demo-run driver-interactive" @click="start">Start the two-page tour</button>
      </template>
    </DemoBox>

    <p class="mp-links">
      <a v-if="props.page === 'one'" :href="PAGE_TWO">Page two of this example →</a>
      <a v-else :href="PAGE_ONE">← Back to page one</a>
    </p>

    <Teleport to="body">
      <div v-if="tourState.active" class="mp-progress driver-interactive">
        <span>Tour · step {{ tourState.index + 1 }} of {{ steps.length }} · {{ currentStep?.label }}</span>
        <button type="button" class="demo-button secondary" @click="finish">Exit</button>
      </div>
    </Teleport>
  </div>
</template>

<style>
.mp-links {
  margin-top: 8px;
  font-size: 14px;
}

.mp-progress {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: calc(var(--driver-z-index, 10000) + 3);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  font-size: 13px;
}
</style>
