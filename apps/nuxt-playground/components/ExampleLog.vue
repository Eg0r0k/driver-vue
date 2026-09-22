<script setup lang="ts">
/** The on-page log: hooks and events the examples report instead of console.log. */
const { entries, clearLog } = useExampleRunner();
</script>

<template>
  <aside class="log">
    <div class="log-head">
      <strong>Log</strong>
      <button type="button" class="log-clear" @click="clearLog">Clear</button>
    </div>
    <p v-if="!entries.length" class="log-empty">Run an example: hooks and events show up here.</p>
    <ol v-else class="log-list">
      <li v-for="entry in entries" :key="entry.id">
        <span class="log-time">{{ entry.time }}</span>
        <code>{{ entry.text }}</code>
      </li>
    </ol>
  </aside>
</template>
