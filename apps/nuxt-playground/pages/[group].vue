<script setup lang="ts">
import { groups } from "~/examples";

/** One page per example group: the shared stage content plus the group's cards. */
const route = useRoute();

const group = computed(() => groups.find(item => item.slug === route.params.group));

if (!group.value) {
  throw createError({ statusCode: 404, statusMessage: "Unknown example group" });
}

useHead({ title: `${group.value.title} · driver-vue playground` });
</script>

<template>
  <div v-if="group" class="page">
    <Stage />
    <ExampleList :group="group" />
  </div>
</template>
