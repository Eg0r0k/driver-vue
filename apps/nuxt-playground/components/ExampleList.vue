<script setup lang="ts">
import type { ExampleGroup } from "~/examples/types";

/** The cards of one example group, each with a Run button. */
const props = defineProps<{
  group: ExampleGroup;
}>();

const runner = useExampleRunner();
const running = ref<string | undefined>();

const run = (id: string) => {
  const example = props.group.examples.find(item => item.id === id);
  if (!example) {
    return;
  }

  runner.reset();
  running.value = id;
  runner.log(`▶ ${example.title}`);
  example.run(runner.context());
};
</script>

<template>
  <section class="examples">
    <h2 class="examples-title">{{ group.title }}</h2>
    <p v-if="group.intro" class="examples-intro">{{ group.intro }}</p>

    <article
      v-for="example in group.examples"
      :id="`example-${example.id}`"
      :key="example.id"
      class="example"
      :class="{ 'example-running': running === example.id }"
    >
      <div class="example-body">
        <h3 class="example-title">{{ example.title }}</h3>
        <p class="example-description">{{ example.description }}</p>
      </div>
      <button type="button" class="example-run" @click="run(example.id)">Run</button>
    </article>
  </section>
</template>
